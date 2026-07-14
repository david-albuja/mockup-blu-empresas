# Implementation Plan — blu Empresas 2.0 (canal web)

Convención: cada tarea referencia el/los Requirement(s) de `requirements.md` que satisface. Marcar
`[x]` solo cuando el criterio de aceptación correspondiente esté verificado (no solo el código
escrito). Antes de la Fase 1, resolver el bloqueo de la Fase 0 — sin eso, buena parte del trabajo
de BFF no puede estimarse con certeza.

## Fase 0 — Confirmación de servicios core (bloqueante)

- [ ] 0.1 Confirmar con Core Banking la lista real de operaciones (OpenAPI/WSDL) de cada servicio
  listado como "confirmado" en `.kiro/steering/tech.md` — el nombre del repo no garantiza el
  contrato exacto que el BFF necesita.
- [ ] 0.2 Resolver, para cada uno de los 8 dominios listados en `design.md §8`, si el servicio core
  existe con otro nombre, está en otro proyecto Azure DevOps, o debe crearse — y quién lo
  construye (fuera de alcance de este equipo si es un servicio core nuevo).
- [ ] 0.3 Confirmar cuál de los 4 repos BFF existentes (`blu-companies-{web,host,auth,admin}-fe`)
  asume cada dominio — usar la propuesta de `design.md §2` como punto de partida de la discusión,
  no como decisión final.
- [ ] 0.4 Definir el mecanismo real de emisión/validación de soft token OTP (no identificado
  explícitamente en el inventario de servicios).

## Fase 1 — Cimientos de plataforma

- [ ] 1.1 Clonar/actualizar el esqueleto Maven (`application/domain/infrastructure` +
  `k8s/` + `stackhawk/` + `azure-pipelines.yml`) en los 4 repos BFF existentes según lo que aún no
  tengan implementado.
- [ ] 1.2 Definir el catálogo de códigos de error BFF↔frontend (`design.md §6`) como librería
  compartida entre los 4 BFFs (o dependencia Maven interna).
- [ ] 1.3 Configurar cliente HTTP resiliente (WebClient + Resilience4j) reutilizable para llamadas
  a servicios core, con política de timeout/retry/circuit-breaker estándar.
- [ ] 1.4 Scaffoldear el repo Next.js de Empresas replicando convenciones de `BluPersonasWeb`
  (TypeScript, Storybook, `bundle-scan`, `check-missing-stories`, `check-missing-tests` en CI).
- [ ] 1.5 Implementar el flujo de sesión/token de extremo a extremo (Next.js → `auth-fe` → core) —
  prerrequisito de todo lo demás.

## Fase 2 — Ingreso canal (Epic 1 → Requirements 1.1–1.6)

- [ ] 2.1 BFF `auth-fe`: endpoint de login + validación de soft token OTP. _Req 1.1, 1.2_
- [ ] 2.2 Frontend: pantalla de login + modal de token, con estado de error por campo. _Req 1.1, 1.2_
- [ ] 2.3 Frontend: enlace "Solicita un producto" hacia catálogo de ofertas. _Req 1.3_
- [ ] 2.4 BFF `auth-fe` + Frontend: recuperación de clave con validación RUC→cédula en ese orden.
  _Req 1.4_
- [ ] 2.5 BFF `auth-fe` + Frontend: registro de nueva empresa en 3 pasos (identidad, OTP,
  credenciales), validando RUC contra servicio de clientes. _Req 1.5_
- [ ] 2.6 BFF `auth-fe` + Frontend: creación de usuario adicional con validación de confirmación de
  contraseña. _Req 1.6_

## Fase 3 — Home + Perfil (Epic 2 → Requirements 2.1–2.10)

- [ ] 3.1 BFF `web-fe`: endpoint de agregación `home/summary` (activo/pasivo/cupo global) con
  fan-out paralelo a cuentas/tarjetas/créditos/inversiones/caja. _Req 2.1, 2.2, 2.3_
- [ ] 3.2 Frontend: Home con carrusel de categorías (incluye Caja condicionado a si la empresa
  tiene adquirencia, y Prepago si aplica) + modo saldo oculto. _Req 2.1, 2.2, 2.3_
- [ ] 3.3 Frontend: "Ver todo" consistente navegando al listado por categoría. _Req 2.4_
- [ ] 3.4 BFF `auth-fe`/`host-fe`: endpoints de perfil (edición datos, seguridad, cambio de clave,
  logout). _Req 2.5, 2.6, 2.7, 2.8_
- [ ] 3.5 Frontend: pantalla de perfil (datos, toggles de seguridad, cambio de clave, logout con
  confirmación). _Req 2.5, 2.6, 2.7, 2.8_
- [ ] 3.6 BFF `host-fe`: endpoint de búsqueda global (índice de pantallas + productos + contactos).
  _Req 2.9_
- [ ] 3.7 Frontend: buscador global con navegación por teclado. _Req 2.9_
- [ ] 3.8 BFF `host-fe` + Frontend: centro de notificaciones. _Req 2.10_

## Fase 4 — Cuentas y Tarjetas (Epics 3, 4 → Requirements 3.1–3.4, 4.1–4.15)

- [ ] 4.1 BFF `web-fe`: passthrough de detalle/consolidado de cuentas, incluyendo cuentas
  canceladas con saldo pendiente. _Req 3.1_
- [ ] 4.2 BFF `web-fe`: endpoint de exportación Excel de movimientos de cuenta (umbral 100). _Req 3.2_
- [ ] 4.3 Frontend + BFF: tasa de interés / interés ganado en detalle de cuenta de ahorros. _Req 3.3_
- [ ] 4.4 BFF `web-fe` (o servicio a confirmar, ver Fase 0): consolidado y detalle de inversiones.
  _Req 3.4_
- [ ] 4.5 BFF `web-fe`: passthrough de tarjetas — cupo global agregado (no por tarjeta), pago
  total/mínimo/fecha, separación principales/adicionales. _Req 4.1, 4.2, 4.3_
- [ ] 4.6 BFF `web-fe`: exportación Excel de tarjetas adicionales (umbral 20) y de movimientos
  (umbral 100). _Req 4.4, 4.5_
- [ ] 4.7 Frontend: rediseño de detalle de tarjeta sin duplicar información. _Req 4.6_
- [ ] 4.8 BFF `web-fe` + Frontend: activación de tarjeta + creación de PIN. _Req 4.7_
- [ ] 4.9 BFF `web-fe` + Frontend: configuración de tarjeta (canales, límite diario, cambio de
  PIN). _Req 4.8_
- [ ] 4.10 BFF `web-fe` + Frontend: cuenta débito prioritaria (reordenar). _Req 4.9_
- [ ] 4.11 Frontend: catálogo de beneficios por tarjeta. _Req 4.10_
- [ ] 4.12 BFF `web-fe` + Frontend: diferir consumo a cuotas con recálculo en vivo. _Req 4.11_
- [ ] 4.13 BFF `web-fe` + Frontend: precancelación de compras diferidas. _Req 4.12_
- [ ] 4.14 BFF `web-fe` + Frontend: avance de efectivo (cajero) con recálculo en vivo. _Req 4.13_
- [ ] 4.15 BFF `web-fe` + Frontend: avance de facturación a cuenta. _Req 4.14_
- [ ] 4.16 Frontend + BFF: gestión de listado de tarjetas adicionales. _Req 4.15_

## Fase 5 — Créditos y Establecimientos (Epics 5, 6 → Requirements 5.1–5.4, 6.1–6.4)

- [ ] 5.1 BFF `web-fe`: passthrough de créditos con bandera `puedeAbonar` derivada del estado
  (al día/mora/legal/judicial). _Req 6.1, 6.2_
- [ ] 5.2 BFF `web-fe` + Frontend: pago de cuota de crédito. _Req 6.3_
- [ ] 5.3 BFF `web-fe` (o servicio de originación a confirmar) + Frontend: simulador de crédito
  nuevo con amortización en tiempo real. _Req 6.4_
- [ ] 5.4 BFF `admin-fe` o `web-fe` (a confirmar, ver Fase 0): resumen de ventas del día y monto
  por liquidar de Consulta de Caja. _Req 5.1_
- [ ] 5.5 Ídem: tabla de transacciones con filtro/orden/paginación. _Req 5.2_
- [ ] 5.6 Ídem: cierre de lote. _Req 5.3_
- [ ] 5.7 Ídem: reportes por marca/terminal con exportación. _Req 5.4_

## Fase 6 — Pagos y Transferencias (Epic 7 → Requirements 7.1–7.10)

- [ ] 6.1 BFF `web-fe` (servicio de transferencias a confirmar): transferencia guiada con
  validación de saldo y confirmación por token. _Req 7.1_
- [ ] 6.2 BFF `web-fe`: contactos frecuentes en el flujo. _Req 7.2_
- [ ] 6.3 BFF `web-fe`: pago de tarjeta (total/mínimo/otro) con cálculo de interés. _Req 7.3_
- [ ] 6.4 BFF `web-fe`: retiro sin tarjeta (código de cajero). _Req 7.4_
- [ ] 6.5 BFF `web-fe` (servicio transversal a confirmar): mapa de agencias/cajeros. _Req 7.5_
- [ ] 6.6 BFF `web-fe`: transferencias/pagos programados o recurrentes (pausar/reanudar/crear).
  _Req 7.6_
- [ ] 6.7 BFF `web-fe` (servicio de pago de servicios básicos a confirmar): pago de servicios
  inscritos. _Req 7.7_
- [ ] 6.8 Ídem: gestión de servicios inscritos (agregar/quitar). _Req 7.8_
- [ ] 6.9 BFF `web-fe`: pago masivo por carga de archivo, con ruteo a aprobaciones. _Req 7.9_
- [ ] 6.10 BFF `web-fe`: búsqueda y gestión de contactos/beneficiarios. _Req 7.10_

## Fase 7 — Aprobaciones y Administración (Epic 8 → Requirements 8.1–8.5)

- [ ] 7.1 BFF `admin-fe`: bandeja de aprobaciones con conteo/badge, integrando
  `msd-enterprise-approval-workflow`. _Req 8.1_
- [ ] 7.2 BFF `admin-fe`: aprobar/rechazar operación individual con token si aplica. _Req 8.2_
- [ ] 7.3 BFF `admin-fe`: administración de usuarios (crear/editar/desactivar) con rol y límite.
  _Req 8.3_
- [ ] 7.4 BFF `admin-fe`: dashboard de cash management (semana/mes), integrando
  `msd-trb-cashacct-*`. _Req 8.4_
- [ ] 7.5 BFF `admin-fe`: gestión de roles y permisos. _Req 8.5_

## Fase 8 — Recompensas Club (Epic 9 → Requirements 9.1–9.3)

- [ ] 8.1 BFF `web-fe` (servicio de loyalty a confirmar): consolidado de puntos con nivel/progreso.
  _Req 9.1_
- [ ] 8.2 Ídem: catálogo de canje con validación de saldo suficiente. _Req 9.2_
- [ ] 8.3 Ídem: historial con exportación Excel sobre umbral. _Req 9.3_

## Fase 9 — Servicios y Seguridad (Epic 10 → Requirements 10.1–10.8)

- [ ] 9.1 BFF `web-fe`: bloqueo/desbloqueo y reporte de robo/pérdida, integrando
  `cbf-cards-credcard-lock-unlock`. _Req 10.1_
- [ ] 9.2 BFF `web-fe` (servicio a confirmar): aviso de viaje con validación de rango de fechas.
  _Req 10.2_
- [ ] 9.3 BFF `web-fe`: generación de certificados, integrando `cbf-domaar-certificate` /
  `msd-cmg-custaggr-bankcertif-cr`. _Req 10.3_
- [ ] 9.4 BFF `web-fe`: documentos tributarios filtrables por año, integrando `msd-dma-docuserv-*`.
  _Req 10.4_
- [ ] 9.5 BFF `web-fe` (servicio a confirmar): declaración de residencia fiscal CRS. _Req 10.5_
- [ ] 9.6 BFF `web-fe` (servicio a confirmar): devolución de mercadería con número de caso. _Req 10.6_
- [ ] 9.7 BFF `web-fe`: canales de contacto/mensajería. _Req 10.7_
- [ ] 9.8 BFF `web-fe` (servicio a confirmar, posible integración externa de NLP/chat): asesor
  virtual con respuestas rápidas y escalamiento. _Req 10.8_

## Fase 10 — Contratación de Productos (Epic 11 → Requirements 11.1–11.4)

- [ ] 10.1 Frontend: catálogo de ofertas enlazando a cada flujo de contratación. _Req 11.1_
- [ ] 10.2 BFF `web-fe` (servicio de originación a confirmar) + Frontend: wizard de 6 pasos de
  tarjeta Signature, con seguimiento de estado post-solicitud. _Req 11.2_
- [ ] 10.3 Ídem: wizard de 4 pasos de apertura de Cuenta BLU+. _Req 11.3_
- [ ] 10.4 BFF `web-fe`: solicitud de tarjeta adicional con validación de cupo. _Req 11.4_

## Fase 11 — Endurecimiento y salida a producción

- [ ] 11.1 Ejecutar StackHawk (DAST) en los 4 BFFs y remediar hallazgos antes de subir a
  `values-prod.yaml`.
- [ ] 11.2 Validar imagen nativa GraalVM y tiempos de cold-start de cada BFF bajo carga esperada.
- [ ] 11.3 Verificar cobertura de Storybook/tests del frontend (`check-missing-stories`,
  `check-missing-tests`) antes de cada release.
- [ ] 11.4 Prueba de degradación: simular caída de un servicio core en una pantalla de agregación
  (Home) y confirmar que el resto de la pantalla sigue funcionando (`design.md §6`).
