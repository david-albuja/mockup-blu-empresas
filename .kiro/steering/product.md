# Producto: blu Empresas 2.0

## Qué es

Rediseño de la banca digital empresarial de **Diners Club / blu (Ecuador)**. Sustituye el canal
web actual de empresas por una experiencia alineada a las mejores prácticas de banca digital
(Revolut, N26, Monzo, BBVA), manteniendo el modelo de negocio real (BIAN) del banco.

## Fuente de verdad funcional

El prototipo estático en la raíz de este repo (`index.html`, `js/`, `css/`) es el **mockup
validado** de la experiencia objetivo — HTML/CSS/JS vanilla, sin backend, con datos simulados en
`js/data.js`. Sirvió para:

1. Validar UX/UI con el equipo de negocio (observaciones documentadas y corregidas: orden
   RUC→cédula en recuperación de contraseña, umbrales de exportación a Excel, eliminación de
   información redundante en detalle de producto).
2. Generar el backlog completo en Azure DevOps (proyecto **"Gestión Productos Bancarios"**,
   iniciativa **"MVP blu Empresas 2.0"**, id `188943`): 11 Epics, 73 User Stories.

Cuando el mockup y una Historia de Usuario (HU) de Azure DevOps difieran en un detalle menor,
prevalece la HU (tiene los criterios de aceptación formales); para el flujo/interacción general,
el mockup es la referencia visual.

## Usuarios

- **Cliente empresarial** (dueño/representante de la empresa cliente de blu): consulta productos,
  paga, transfiere, contrata productos nuevos.
- **Usuario adicional** (empleado de la empresa con acceso al canal): opera con permisos limitados
  según su rol.
- **Aprobador**: revisa y aprueba/rechaza operaciones que superan su límite individual.
- **Administrador de la empresa**: gestiona usuarios, roles y límites de aprobación.
- **Responsable de caja** (si la empresa tiene servicio de adquirencia/datáfono): consulta ventas y
  liquidaciones del establecimiento.

## Dominios funcionales (= Epics de Azure DevOps)

| Epic | Id | Alcance |
|---|---|---|
| Ingreso canal | 189146 | Onboarding, creación de usuario, recuperación de clave, login, biometría |
| Home + Perfil | 189147 | Home consolidado, perfil, seguridad, búsqueda, notificaciones |
| Cuentas | 189148 | Consolidado, detalle, movimientos, inversiones |
| Tarjetas de crédito | 189149 | Consolidado, detalle, servicing (bloqueo, config, diferir, avances, beneficios) |
| Establecimientos | 189150 | Consulta de caja / adquirencia comercial |
| Créditos | 189152 | Consolidado, detalle, pago de cuota, simulador |
| Pagos y Transferencias | 190081 | Transferencias, pago de servicios, retiro sin tarjeta, carga masiva, contactos |
| Aprobaciones y Administración | 190082 | Bandeja de aprobaciones, cash management, usuarios y roles |
| Recompensas Club | 190083 | Puntos, canje, historial |
| Servicios y Seguridad | 190097 | Bloqueo, aviso de viaje, certificados, tributarios, CRS, devoluciones, contacto, asesor virtual |
| Contratación de Productos | 190098 | Catálogo de ofertas, onboarding de tarjeta/cuenta nuevas, tarjeta adicional |

Ver `.kiro/specs/blu-empresas-web/requirements.md` para el detalle de las 73 HU.
