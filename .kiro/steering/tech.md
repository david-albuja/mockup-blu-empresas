# Stack técnico y arquitectura

## Las 3 capas

```
Next.js (frontend, canal web)
        │  HTTPS / JSON REST (contratos propios del BFF, orientados a pantalla)
        ▼
BFF — Java 17 + Spring Boot, un microservicio por dominio de UI (passthrough)
        │  HTTPS / JSON REST — BIAN service operations (contrato del core)
        ▼
Servicios core — Java + Spring Boot, arquitectura BIAN (ya existen, no se tocan)
```

**El BFF es passthrough**: no reimplementa reglas de negocio ni guarda estado propio. Su trabajo es:
1. Adaptar el contrato BIAN (verboso, orientado a "Service Domain / Behavior Qualifier / Control
   Record") a un contrato simple orientado a la pantalla que el Next.js necesita.
2. Agregar/combinar la respuesta de 2+ servicios core cuando una pantalla lo requiere (ej. Home
   consolidado = cuentas + tarjetas + créditos + inversiones en una sola llamada).
3. Aplicar las reglas de presentación que el mockup ya validó (ver "Reglas de negocio de UI"
   abajo) — estas SÍ viven en el BFF porque son de experiencia, no de dominio bancario.
4. Propagar autenticación/autorización (token de sesión, alcance de usuario/rol) hacia el core.

No debe: calcular intereses, validar cupos, decidir estados de mora/legal/judicial, ni cualquier
regla que pertenezca al dominio bancario — eso ya lo resuelve el servicio core correspondiente.

## Por qué Java y no Python para el BFF

No es una decisión abierta: **ya es el estándar de la organización**, confirmado en 4 repos Azure
DevOps ya scaffoldeados para blu Empresas (`blu-companies-web-fe`, `blu-companies-host-fe`,
`blu-companies-auth-fe`, `blu-companies-admin-fe`, proyecto "Diners Blu 2.0") — los 4 son
Java 17 + Maven + Spring Boot, con el mismo esqueleto hexagonal/DDD y paquete BIAN
(`ec.com.dinersclub.dddmodules.bian`). **Estos repos ya existen y deben ser el punto de partida**
(no crear repos BFF nuevos desde cero).

Razones para no introducir Python aquí:
- Todos los servicios core con los que el BFF conversa son Java/BIAN — mismo lenguaje minimiza
  fricción de contratos, DTOs, y librerías compartidas (auth, tracing, logging, resiliencia).
- CI/CD (Azure Pipelines), Helm charts, sidecar Istio, imagen nativa GraalVM (`DockerFileNativeAmazon`)
  y el escaneo de seguridad StackHawk ya están calibrados para este esqueleto Spring Boot.
- El equipo de la Tribu ya opera y da soporte en Java sobre este mismo patrón para Personas.

## Esqueleto estándar de cada microservicio (BFF y core)

Confirmado idéntico en `blu-companies-web-fe`, `blu-companies-host-fe`, `blu-companies-auth-fe`,
`blu-companies-admin-fe` y en servicios core como `msd-cli-gdd-seguro-afiliacion`:

```
/application            módulo Maven — capa de entrada (REST controllers, Application.java)
  /src/main/java/ec/com/dinersclub/dddmodules/bian/Application.java
  /src/main/resources/application.yml
/domain                 módulo Maven — modelo de dominio, casos de uso, puertos
/infrastructure         módulo Maven — adaptadores salientes (clientes HTTP a otros servicios, DB si aplica)
/k8s
  Chart.yaml
  /docker/DockerFileNativeAmazon      imagen nativa GraalVM
  /templates/{deployment,service,virtualservice}.yaml   K8s + Istio service mesh
  values-dev.yaml / values-prod.yaml
/stackhawk/stackhawk-dev.yml          DAST — escaneo de seguridad automatizado en pipeline
azure-pipelines.yml
pom.xml (raíz, agrega los 3 módulos)
```

Cada BFF nuevo para un dominio no cubierto por los 4 repos existentes (ej. si "Contratación de
Productos" necesita su propio BFF en vez de vivir dentro de `web-fe`) debe clonar exactamente este
esqueleto.

## Frontend: Next.js

Sigue las convenciones ya usadas en `BluPersonasWeb` (repo Azure DevOps, proyecto "Diners Blu 2.0"),
que es el equivalente ya en producción para Personas: Next.js + TypeScript + Storybook, con
scripts de calidad (`bundle-scan`, `check-missing-stories`, `check-missing-tests`) corriendo en CI.
El repo de Empresas debe replicar esa misma disciplina (cobertura de Storybook y tests por
componente, control de tamaño de bundle).

## Inventario de servicios core (confirmado vs. pendiente)

Búsqueda hecha sobre el catálogo de repositorios de Azure DevOps (proyecto "Diners Blu 2.0").
Esto NO es exhaustivo — es lo que se encontró por nombre; antes de implementar cada BFF, el
equipo debe confirmar con el squad de Core Banking la lista real de operaciones expuestas por
cada servicio (WSDL/OpenAPI, no inferido del nombre del repo).

### Dominios con servicio(s) core confirmados

| Dominio UI | Repos core encontrados |
|---|---|
| Tarjetas de crédito (consolidado, límite, bloqueo, diferir, avances, pagos, QR) | `cbf-cards-creditcard`, `cbf-cards-credcard-information`, `cbf-cards-credcard-limit-mgt`(`-sb4`), `cbf-cards-credcard-lock-unlock`, `cbf-cards-credcard-deferred`, `cbf-cards-creditcard-precancel`, `cbf-cards-creditcard-prepayments`, `cbf-cards-deferred-prepayments`, `cbf-cards-payments`, `cbf-cards-payments-c2a`, `cbf-cards-payments-cash-adv`, `cbf-cards-payments-qr`, `cbf-cards-payments-services`, `cbf-cards-cardless-transactions`, `msd-car-cardauth-authcred-req`, `msd-car-cardauth-authoriz-req`, `msd-car-cartracap-cartra-dcd-ret`, `msd-car-credcard-carpayse-re`, `msd-car-credcard-carpayser-re`, `msd-car-credcard-credlimi-ret`, `mef-car-credcard-limit-ba-ret` |
| Cuentas / Créditos (préstamos y depósitos) | `cbf-loandepo-account`, `cbf-loandepo-account-services`, `cbf-loandepo-interest-account`, `cbf-loandepo-movements-account` |
| Cash management (saldo, depósito/retiro de cuenta) | `msd-trb-cashacct-acctgrps`, `msd-trb-cashacct-balanceh`, `msd-trb-cashacct-depwdraw` |
| Aprobaciones | `msd-enterprise-approval-workflow` |
| Certificados bancarios | `cbf-domaar-certificate`, `msd-cmg-custaggr-bankcertif-cr` |
| Onboarding / Login / Biometría / Auth | `cbf-cusmgt-onboarding`, `cbf-cusmgt-login`, `cbf-cusmgt-biometric-auth`, `cbf-croschan-authentication`, `cbf-itmgt-profile-auth` |
| Notificaciones | `msd-cha-gds-notifications` |
| Límites de cliente / usuarios externos | `cbf-custmgmt-limit-account`, `msd-cmg-cuacen-extuser-ret`, `msd-cmg-paredadi-user-reg` |
| Documentos (generación/gestión) | `msd-dma-docuserv-docserpro-ret`, `msd-dma-docuserv-docutemp-exe`, `msd-dma-docuserv-dosepr-ini`, `msd-dma-docuserv-doseprfus` |
| Operación en cajero (ATM) | `msd-chsp-chspatm-operpinatm-ret` |

### Dominios SIN servicio core encontrado (requieren confirmación/creación)

Estos aparecen en el mockup y en HUs de Azure DevOps pero **no se encontró** un repo de servicio
core que los respalde por nombre. Antes de que el BFF los exponga como passthrough, alguien debe
confirmar con Core Banking si el servicio existe con otro nombre, está en otro proyecto, o debe
crearse:

- **Transferencias de dinero** (entre cuentas propias / terceros / otros bancos) — Epic "Pagos y
  Transferencias".
- **Inversiones** (depósitos a plazo fijo, fondos) — Epic "Cuentas".
- **Recompensas / Loyalty** (puntos, canje, cashback) — Epic "Recompensas Club".
- **Adquirencia comercial / caja** (transacciones de datáfono, cierre de lote, liquidación) — Epic
  "Establecimientos".
- **Pago de servicios básicos** (luz, agua, internet, TV) — Epic "Pagos y Transferencias".
- **Aviso de viaje, residencia fiscal (CRS), devolución de mercadería, asesor virtual** — Epic
  "Servicios y Seguridad".
- **Simulación/originación de crédito nuevo, apertura de cuenta BLU+, solicitud de tarjeta
  Signature/adicional** — Epic "Contratación de Productos" (son procesos de originación, casi
  seguro viven en un dominio BIAN distinto al de servicing que sí se encontró).
- **Mapa de agencias/cajeros** — es más probable que sea un servicio de datos maestros/geolocalización,
  no bancario; confirmar si ya existe como servicio compartido transversal (no específico de blu).

## Reglas de negocio de UI que sí viven en el BFF (validadas en el mockup)

- **Umbral de exportación a Excel**: si el número de ítems a listar supera un umbral, el BFF debe
  soportar un endpoint de exportación (generación real de archivo) en vez de devolver la lista
  completa para renderizar. Umbrales validados en el mockup: tarjetas adicionales > 20,
  movimientos > 100 (`js/app.js`, constante `DATA_LIMIT`). **Nota**: en el mockup esto es solo un
  toast simulado — la generación real de Excel es trabajo nuevo del BFF, no existe hoy.
- **Cupo global vs. cupo por tarjeta**: el BFF de tarjetas debe exponer el cupo como un valor único
  a nivel cliente (no por tarjeta individual) — confirmar que el servicio core ya modela el cupo
  así o si el BFF debe agregarlo.
- **Estados de crédito** (al día / mora / legal / judicial): el BFF no decide el estado, solo lo
  refleja tal como lo entrega el core; la UI condiciona qué acciones mostrar (botón de pago
  deshabilitado en legal/judicial) según ese estado.

## Infraestructura

- Kubernetes + Istio service mesh (mTLS entre servicios vía sidecar, `virtualservice.yaml` por
  repo).
- Imagen nativa GraalVM (`DockerFileNativeAmazon`) para arranque rápido en cada pod.
- CI/CD: Azure Pipelines (`azure-pipelines.yml` por repo).
- Seguridad: StackHawk (DAST) integrado en pipeline de cada servicio.
- Helm: `values-dev.yaml` / `values-prod.yaml` por ambiente.
