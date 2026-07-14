# Design — blu Empresas 2.0 (canal web)

## 1. Visión general de la arquitectura

```
┌─────────────────────┐      HTTPS/JSON       ┌──────────────────────────────┐      HTTPS/JSON (BIAN)     ┌───────────────────┐
│   Next.js (web)      │  ───────────────────▶ │  BFF — Java/Spring Boot       │  ─────────────────────────▶ │  Servicios core    │
│  blu-empresas-web    │ ◀─────────────────── │  (uno por dominio de UI)       │ ◀───────────────────────── │  (BIAN, ya existen) │
└─────────────────────┘                       └──────────────────────────────┘                             └───────────────────┘
        │                                              │
        │ Server Components / RSC fetch                │ Istio sidecar (mTLS)
        ▼                                              ▼
   Vercel/K8s (SSR)                              Kubernetes + Istio + StackHawk
```

El BFF no es una capa nueva de arquitectura para la organización: **ya existe scaffoldeado** como
4 repos Java/Spring Boot en Azure DevOps (`blu-companies-web-fe`, `-host-fe`, `-auth-fe`,
`-admin-fe`, proyecto "Diners Blu 2.0"), con el mismo esqueleto hexagonal/DDD y despliegue
Helm+Istio que los servicios core. Este documento asume que se completan esos 4 repos existentes,
no que se crean desde cero. Ver `.kiro/steering/tech.md` para el detalle del esqueleto y el
inventario de servicios core.

## 2. Responsabilidad de cada BFF existente

Propuesta de asignación de dominios a los 4 repos ya scaffoldeados (a confirmar con el squad
propietario si la asignación real es distinta):

| Repo BFF | Dominios que resuelve | Epics cubiertos |
|---|---|---|
| `blu-companies-auth-fe` | Login, soft token, recuperación de clave, registro, biometría, perfil/seguridad | Epic 1 (Ingreso canal), parte de Epic 2 (seguridad de perfil) |
| `blu-companies-host-fe` | Shell/layout, navegación, búsqueda global, notificaciones — probablemente Backend-for-Micro-Frontend-Shell | Cross-cutting (Requirement 2.9, 2.10) |
| `blu-companies-web-fe` | Home consolidado, Cuentas, Tarjetas, Créditos, Inversiones, Pagos y Transferencias, Recompensas, Servicios y Seguridad, Contratación de Productos | Epics 2–7, 9, 10, 11 |
| `blu-companies-admin-fe` | Aprobaciones, administración de usuarios/roles, cash management | Epic 8 |

Si en la práctica un solo BFF (`web-fe`) termina absorbiendo demasiados dominios, dividir por
Bounded Context (ej. `blu-companies-payments-fe` nuevo) siguiendo el mismo esqueleto — no forzar
todo dentro de un repo monolítico solo porque ya existe.

## 3. Contrato de passthrough

Regla general: **1 endpoint de BFF por pantalla o acción de UI**, no un proxy genérico 1:1 de cada
operación BIAN. El BFF:

1. Recibe la request del Next.js con un contrato simple (JSON orientado a la pantalla).
2. Resuelve el/los servicio(s) core necesarios (puede ser 1 o varios, ver "Agregación" abajo).
3. Traduce la respuesta BIAN al contrato de salida que el frontend consume.
4. No cachea datos de negocio más allá de lo que Spring/Istio provean por defecto — el estado vive
   en los servicios core.

Ejemplo — `GET /bff/home/summary` (usado por Requirement 2.1):
```
BFF orquesta en paralelo:
  cbf-loandepo-account          → saldo de cuentas
  cbf-cards-creditcard          → deuda de tarjetas + cupo global
  msd-trb-cashacct-balanceh     → saldo consolidado de caja (si aplica)
  (inversiones — servicio core pendiente de confirmar, ver tech.md)
Y devuelve:
{ "activo": 40100.75, "pasivo": 21419.86, "cupoGlobal": 40000, "cupoGlobalDisponible": 30820.32 }
```

### Agregación (fan-out) vs. passthrough puro

- **Passthrough puro** (1 servicio core → 1 respuesta adaptada): detalle de tarjeta, detalle de
  cuenta, bloqueo/desbloqueo, aprobaciones.
- **Agregación** (varios servicios core → 1 respuesta combinada): Home consolidado
  (Requirement 2.1), reportes de caja (Requirement 5.4), historial de puntos (Requirement 9.3).
  Usar llamadas paralelas (`CompletableFuture`/WebClient reactivo), no secuenciales, salvo
  dependencia real entre ellas.

## 4. Autenticación y seguridad

- Login (Requirement 1.1–1.2): `blu-companies-auth-fe` intermedia contra `cbf-cusmgt-login` +
  `cbf-croschan-authentication`; el soft token OTP se valida contra el servicio de autenticación
  correspondiente (confirmar cuál emite/valida el OTP — no encontrado explícitamente en el
  inventario, puede vivir dentro de `cbf-croschan-authentication` o `cbf-cusmgt-biometric-auth`).
- Sesión: token emitido por el BFF de auth, propagado como `Authorization: Bearer` en cada llamada
  del Next.js al resto de BFFs, y de ahí a los servicios core (mTLS de Istio protege
  service-to-service, no reemplaza la identidad del usuario final — el JWT/token de sesión viaja
  igual en las cabeceras).
- Autorización por rol (Requirement 8.3, 8.5): el BFF de `admin-fe` es responsable de resolver
  "¿qué puede ver/hacer este usuario?" antes de exponer datos — nunca confiar solo en que el
  frontend oculte botones.
- Operaciones sensibles (transferencias, pagos, aprobaciones de monto alto) requieren token
  dinámico de segundo factor — mismo mecanismo que el login, reutilizar el mismo servicio.
- Todo tráfico servicio-a-servicio pasa por el sidecar Istio (mTLS automático); no implementar TLS
  manual dentro de la app.
- Escaneo StackHawk (DAST) debe ejecutarse en cada pipeline de BFF antes de promover a producción
  — no es opcional, ya está configurado en el esqueleto (`stackhawk/stackhawk-dev.yml`).

## 5. Reglas de UI que vive en el BFF (no en el core)

### 5.1 Exportación a Excel sobre umbral (Requirements 3.2, 4.4, 4.5, 9.3, 5.4)

En el mockup esto es un toast simulado (`xlsxToast`). En producción, el BFF debe exponer un
endpoint real de exportación:

```
GET /bff/{dominio}/export?formato=xlsx&filtros=...
→ 200 OK, Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

Umbrales (configurables, no hardcodear en el frontend):
- Tarjetas adicionales: > 20 → ofrecer exportación en vez de listar.
- Movimientos (cuenta o tarjeta): > 100 → ofrecer exportación en vez de listar.
- Historial de puntos: umbral a definir con negocio (mockup no fija un número).

El BFF genera el archivo (librería tipo Apache POI, ya que el stack es Java) a partir de los
mismos datos que traería para listar — no es un servicio nuevo del core, es responsabilidad de la
capa BFF.

### 5.2 Cupo global vs. cupo por tarjeta (Requirement 4.1)

Confirmar con el servicio `cbf-cards-credcard-limit-mgt` si el cupo ya se modela a nivel cliente.
Si el core todavía expone cupo por tarjeta individual, **el BFF debe agregarlo** (sumar/reconciliar)
para cumplir la regla de UI validada en el mockup — no debe filtrarse un cupo por tarjeta a la
pantalla.

### 5.3 Estados de crédito (Requirements 6.1, 6.2)

El BFF nunca decide si un crédito está en mora/legal/judicial — eso lo entrega el core
(`cbf-loandepo-account` o equivalente). El BFF solo traduce ese estado a la bandera
`puedeAbonar: boolean` que el frontend usa para mostrar/ocultar el botón de pago.

## 6. Manejo de errores

- Errores de validación de negocio del core (ej. "monto excede cupo") deben propagarse al frontend
  con un código de error estable (no el mensaje crudo del core) + mensaje localizado — el BFF
  mantiene un catálogo de mapeo `códigoCore → códigoBFF/mensaje`.
- Timeouts de servicios core en agregaciones: si un fan-out parcial falla (ej. inversiones no
  responde pero cuentas sí), el Home debe degradar mostrando lo disponible con un indicador de
  "no disponible temporalmente" en esa sección — no debe fallar toda la pantalla por un servicio.
- Reintentos: usar política estándar de resiliencia (Resilience4j, ya common en el stack Spring
  Boot corporativo) — no reintentar operaciones no idempotentes (pagos, transferencias).

## 7. No funcionales

- **Arranque**: imagen nativa GraalVM (`DockerFileNativeAmazon`) ya en el esqueleto — mantener
  tiempos de cold-start bajos es requisito de plataforma, no negociable por feature.
- **Observabilidad**: seguir el patrón ya usado por servicios core (tracing distribuido vía Istio +
  logging estructurado) — cada endpoint de BFF debe loguear el/los servicio(s) core invocados y
  latencia, para poder diagnosticar cuál dominio está lento en agregaciones.
- **Compatibilidad BIAN**: si el equipo decide exponer el contrato del BFF también como servicio
  reutilizable (no solo para este frontend), debe seguir la convención de paquete
  `ec.com.dinersclub.dddmodules.bian` y nomenclatura de Service Domain/Behavior Qualifier.
- **Frontend**: Next.js con App Router, Server Components para las pantallas de solo lectura
  (Home, detalle de producto, movimientos) y Client Components para flujos interactivos con estado
  de formulario (transferencias, onboarding, config de tarjeta) — igual patrón que
  `BluPersonasWeb`.

## 8. Brechas conocidas a resolver antes de implementar

Estas no son decisiones de diseño del BFF — son preguntas para Core Banking / arquitectura antes
de poder completar el passthrough de los dominios correspondientes (detalle en
`.kiro/steering/tech.md`, sección "Dominios SIN servicio core encontrado"):

1. Transferencias de dinero (propias, terceros, otros bancos).
2. Inversiones (DPF, fondos).
3. Recompensas/Loyalty (puntos, canje).
4. Adquirencia comercial/caja (transacciones de datáfono, cierre de lote, liquidación).
5. Pago de servicios básicos (luz, agua, internet, TV).
6. Aviso de viaje, residencia fiscal CRS, devolución de mercadería, asesor virtual.
7. Originación: simulador/solicitud de crédito nuevo, apertura BLU+, solicitud Signature/adicional.
8. Mapa de agencias/cajeros (posible servicio transversal no bancario).

Mientras no se confirmen, estos endpoints de BFF pueden mockearse contra un stub para no bloquear
el desarrollo del frontend, pero **no se debe estimar el trabajo de BFF de estos dominios como
"solo passthrough"** hasta confirmar que el servicio core existe con el contrato esperado.
