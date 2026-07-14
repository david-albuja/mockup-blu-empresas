# Requirements — blu Empresas 2.0 (canal web)

## Introducción

Este documento traduce el backlog completo de Azure DevOps (iniciativa "MVP blu Empresas 2.0",
id `188943`, proyecto "Gestión Productos Bancarios") a requisitos formales para implementación.
Cada Requirement corresponde 1:1 a una User Story (HU) ya creada en Azure DevOps — el id entre
paréntesis permite trazabilidad directa. La fuente de verdad de interacción/UX es el prototipo en
la raíz de este repo; la fuente de verdad de alcance funcional es este documento + Azure DevOps.

Formato de criterios de aceptación: EARS (Easy Approach to Requirements Syntax) —
`WHEN <evento/condición> THEN el sistema SHALL <comportamiento observable>`.

---

## Epic 1: Ingreso canal (Azure DevOps #189146)

### Requirement 1.1: Ingreso sin biometría en canal web (#190061)
**User Story:** Como usuario del canal, quiero iniciar sesión con usuario y contraseña en el canal
web, para acceder a mis productos sin depender de biometría (no disponible en web).
**Acceptance Criteria:**
1. WHEN el usuario ingresa usuario y contraseña válidos THEN el sistema SHALL avanzar al paso de
   verificación por token dinámico (ver Requirement 1.2).
2. WHEN el usuario deja un campo requerido vacío y presiona "Ingresar" THEN el sistema SHALL
   marcar el campo en estado de error sin enviar la solicitud.

### Requirement 1.2: Validación con token de seguridad (soft token) en el login (#190062)
**User Story:** Como usuario del canal, quiero confirmar mi inicio de sesión con un código de 6
dígitos (soft token), para añadir un segundo factor de autenticación.
**Acceptance Criteria:**
1. WHEN el usuario completa correctamente el código de 6 dígitos THEN el sistema SHALL completar
   el login y redirigir al Home.
2. WHEN el usuario solicita reenviar el código THEN el sistema SHALL iniciar un temporizador de
   30 segundos antes de permitir un nuevo reenvío.
3. WHEN el código ingresado no tiene 6 dígitos THEN el sistema SHALL impedir el envío del
   formulario.

### Requirement 1.3: Texto "Solicita un producto" para empresas no clientes (#190063)
**User Story:** Como visitante que no es cliente de blu, quiero un enlace claro para solicitar un
producto, para iniciar mi relación comercial con el banco desde el login.
**Acceptance Criteria:**
1. WHEN un visitante ve la pantalla de login THEN el sistema SHALL mostrar el enlace "Solicita un
   producto" que dirige al catálogo de ofertas (Requirement 11.1).

### Requirement 1.4: Recuperación de usuario y contraseña validando primero el RUC de la empresa (#190064)
**User Story:** Como usuario que olvidó su clave, quiero que el sistema valide primero el RUC de mi
empresa y luego mi cédula, para seguir el orden lógico de validación (empresa cliente → usuario
asociado).
**Acceptance Criteria:**
1. WHEN el usuario ingresa un RUC de 13 dígitos válido THEN el sistema SHALL avanzar al paso de
   ingreso de cédula del usuario adicional.
2. WHEN el usuario ingresa una cédula de 10 dígitos válida asociada al RUC previamente validado
   THEN el sistema SHALL mostrar la confirmación de envío de instrucciones por correo/SMS.
3. WHEN el usuario retrocede desde el paso de cédula THEN el sistema SHALL conservar el RUC ya
   ingresado.

### Requirement 1.5: Registro de nueva empresa y usuario administrador en 3 pasos (#190099)
**User Story:** Como representante de una empresa nueva en blu, quiero registrarme en 3 pasos
(identidad, verificación SMS, credenciales), para obtener acceso al canal sin depender de un
ejecutivo.
**Acceptance Criteria:**
1. WHEN el usuario completa los 3 pasos con datos válidos THEN el sistema SHALL crear la cuenta y
   redirigir al Home.
2. WHEN el usuario ingresa un código OTP incorrecto THEN el sistema SHALL mostrar error y permitir
   reintentar o reenviar.
3. WHEN el RUC ingresado no corresponde a un cliente blu THEN el sistema SHALL rechazar el
   registro con un mensaje explicativo.

### Requirement 1.6: Creación de usuario adicional con usuario y contraseña propios (#190100)
**User Story:** Como usuario invitado por el administrador de la empresa, quiero crear mi propio
usuario y contraseña, para acceder con credenciales personales.
**Acceptance Criteria:**
1. WHEN la contraseña y su confirmación coinciden THEN el sistema SHALL crear el usuario.
2. WHEN la confirmación no coincide con la contraseña THEN el sistema SHALL mostrar error y no
   permitir continuar.

---

## Epic 2: Home + Perfil (#189147)

### Requirement 2.1: Posición consolidada con total en activos, pasivos y cupo disponible (#190065)
**Acceptance Criteria:**
1. WHEN el usuario ingresa al Home THEN el sistema SHALL mostrar el total de activos (cuentas +
   inversiones), pasivos (tarjetas + créditos) y cupo global disponible.
2. WHEN el usuario activa el modo de saldo oculto THEN el sistema SHALL enmascarar todos los
   montos monetarios de la pantalla.

### Requirement 2.2: Acceso a Caja al mismo nivel que los demás productos en el Home (#190066)
**Acceptance Criteria:**
1. IF la empresa tiene servicio de adquirencia/datáfono THEN el sistema SHALL mostrar la categoría
   "Caja" en el carrusel de productos del Home al mismo nivel que Tarjetas/Cuentas/Créditos.

### Requirement 2.3: Sección de tarjetas prepago en el Home (#190067)
**Acceptance Criteria:**
1. WHEN la empresa tiene tarjetas prepago activas THEN el sistema SHALL mostrarlas en su propia
   categoría dentro del carrusel de productos del Home.

### Requirement 2.4: "Ver todo" consistente por categoría de producto (#190068)
**Acceptance Criteria:**
1. WHEN el usuario selecciona "Ver todo" en cualquier categoría de producto THEN el sistema SHALL
   navegar a la vista de listado completo de esa misma categoría.

### Requirement 2.5: Edición de datos de contacto y foto de perfil (#190102)
**Acceptance Criteria:**
1. WHEN el usuario actualiza correo o teléfono y guarda THEN el sistema SHALL reflejar el cambio
   de inmediato en la pantalla de perfil.
2. WHEN el usuario cambia su correo a uno no verificado THEN el sistema SHALL retirar el
   indicador de verificado hasta confirmar el nuevo correo.

### Requirement 2.6: Configuración de seguridad desde el perfil (#190103)
**Acceptance Criteria:**
1. WHEN el usuario activa el token dinámico en pagos THEN el sistema SHALL solicitar dicho token
   en operaciones de pago subsecuentes.
2. WHEN el usuario activa el modo privado de saldos THEN el sistema SHALL ocultar todos los
   montos de la app hasta que lo desactive.

### Requirement 2.7: Cambio de contraseña desde el perfil (#190104)
**Acceptance Criteria:**
1. WHEN la nueva contraseña cumple las reglas mínimas (longitud, mayúscula, número, carácter
   especial) y coincide con su confirmación THEN el sistema SHALL permitir guardar el cambio.
2. WHEN la nueva contraseña no cumple las reglas mínimas THEN el sistema SHALL mantener
   deshabilitado el botón de guardar.

### Requirement 2.8: Cierre de sesión con confirmación (#190105)
**Acceptance Criteria:**
1. WHEN el usuario confirma el cierre de sesión THEN el sistema SHALL invalidar la sesión y
   redirigir al login.
2. WHEN el usuario cancela el cierre de sesión THEN el sistema SHALL mantener la sesión activa.

### Requirement 2.9: Búsqueda global de pantallas y productos (#190106)
**Acceptance Criteria:**
1. WHEN el usuario escribe un término en el buscador global THEN el sistema SHALL filtrar en
   tiempo real pantallas, tarjetas, cuentas, créditos, inversiones y contactos que coincidan.
2. WHEN no hay coincidencias THEN el sistema SHALL mostrar un estado vacío.
3. WHEN el usuario selecciona un resultado THEN el sistema SHALL navegar directamente a esa
   pantalla o producto.

### Requirement 2.10: Centro de notificaciones (#190107)
**Acceptance Criteria:**
1. WHEN el usuario abre el panel de notificaciones THEN el sistema SHALL mostrar las
   notificaciones recientes y marcarlas como leídas.
2. WHEN el usuario no tiene notificaciones THEN el sistema SHALL mostrar un estado vacío.

---

## Epic 3: Cuentas (#189148)

### Requirement 3.1: Visualización de cuenta cancelada con saldo pendiente (#190075)
**Acceptance Criteria:**
1. IF una cuenta está en estado cancelada THEN el sistema SHALL mostrarla igualmente en el
   listado con una indicación visual de su estado y su saldo pendiente si lo tiene.

### Requirement 3.2: Descarga en Excel de movimientos de cuentas sobre el umbral (#190076)
**Acceptance Criteria:**
1. WHEN el número de movimientos de una cuenta supera el umbral configurado (100) THEN el sistema
   SHALL ofrecer la descarga en Excel en lugar de listar todos los movimientos en pantalla.

### Requirement 3.3: Visibilidad de tasa de interés e interés ganado (#190077)
**Acceptance Criteria:**
1. WHEN el usuario abre el detalle de una cuenta de ahorros con tasa asociada THEN el sistema
   SHALL mostrar la tasa anual y el interés ganado del mes y del año.

### Requirement 3.4: Consolidado y detalle de inversiones (#190101)
**Acceptance Criteria:**
1. WHEN el usuario ingresa a la categoría Inversiones THEN el sistema SHALL mostrar el monto total
   invertido y el listado de productos (depósitos a plazo fijo, fondos).
2. WHEN el usuario abre el detalle de una inversión THEN el sistema SHALL mostrar monto, tasa y
   fecha de vencimiento (o "sin plazo fijo").

---

## Epic 4: Tarjetas de crédito (#189149)

### Requirement 4.1: Ocultar cupo por tarjeta — cupo global (#190069)
**Acceptance Criteria:**
1. WHEN el usuario consulta cualquier tarjeta de crédito THEN el sistema SHALL NOT mostrar un cupo
   individual por tarjeta, mostrando en su lugar el cupo global consolidado del cliente.

### Requirement 4.2: Pago total, mínimo y fecha máxima por tarjeta (#190070)
**Acceptance Criteria:**
1. WHEN el usuario consulta una tarjeta THEN el sistema SHALL mostrar pago total, pago mínimo y
   fecha máxima de pago propios de esa tarjeta.

### Requirement 4.3: Separación de tarjetas principales y adicionales (#190071)
**Acceptance Criteria:**
1. WHEN el usuario ve el listado de tarjetas THEN el sistema SHALL agruparlas en secciones
   separadas "Principales" y "Adicionales".

### Requirement 4.4: Excel cuando el número de tarjetas adicionales supera el umbral (#190072)
**Acceptance Criteria:**
1. WHEN el número de tarjetas adicionales supera el umbral configurado (20) THEN el sistema SHALL
   ofrecer descarga en Excel en lugar de listarlas todas.

### Requirement 4.5: Excel cuando el número de movimientos supera el umbral (#190073)
**Acceptance Criteria:**
1. WHEN el número de movimientos de una tarjeta supera el umbral configurado (100) THEN el sistema
   SHALL ofrecer descarga en Excel en lugar de listarlos todos.

### Requirement 4.6: Rediseño del detalle de tarjeta (#190074)
**Acceptance Criteria:**
1. WHEN el usuario abre el detalle de una tarjeta THEN el sistema SHALL mostrar imagen, acciones
   rápidas, pago integrado y movimientos sin duplicar información entre secciones.

### Requirement 4.7: Activación de tarjeta nueva y creación de PIN (#190108)
**Acceptance Criteria:**
1. WHEN el usuario confirma correctamente los últimos 4 dígitos y fecha de expiración y crea un
   PIN válido de 4 dígitos THEN el sistema SHALL activar la tarjeta.
2. WHEN los datos de confirmación no coinciden con la tarjeta seleccionada THEN el sistema SHALL
   mostrar error y no activar la tarjeta.

### Requirement 4.8: Configuración de tarjeta — canales, límite diario, cambio de PIN (#190109)
**Acceptance Criteria:**
1. WHEN el usuario desactiva un canal de consumo (online/exterior/cajero/contactless) THEN el
   sistema SHALL persistir esa preferencia para la tarjeta.
2. WHEN el usuario cambia su PIN con un valor válido de 4 dígitos THEN el sistema SHALL confirmar
   el cambio.

### Requirement 4.9: Cuenta débito prioritaria para pagos automáticos (#190110)
**Acceptance Criteria:**
1. WHEN el usuario reordena sus cuentas y guarda THEN el sistema SHALL persistir el nuevo orden de
   prioridad de débito.

### Requirement 4.10: Catálogo de beneficios por tarjeta (#190111)
**Acceptance Criteria:**
1. WHEN el usuario abre "Beneficios" desde el detalle de una tarjeta THEN el sistema SHALL mostrar
   los beneficios vigentes asociados a ese producto.

### Requirement 4.11: Diferir un consumo a cuotas (#190112)
**Acceptance Criteria:**
1. WHEN el usuario selecciona un consumo elegible y un plazo entre 3 y 24 meses THEN el sistema
   SHALL recalcular y mostrar la cuota mensual antes de confirmar.
2. WHEN el usuario confirma el diferimiento THEN el sistema SHALL aplicar el nuevo plan de pago al
   consumo.

### Requirement 4.12: Precancelación de compras diferidas (#190113)
**Acceptance Criteria:**
1. WHEN el usuario selecciona un plan de cuotas activo THEN el sistema SHALL mostrar el saldo
   pendiente y el ahorro en intereses estimado por precancelar.
2. IF el usuario no tiene planes de cuotas activos THEN el sistema SHALL mostrar un estado vacío.

### Requirement 4.13: Avance de efectivo en cajero (#190116)
**Acceptance Criteria:**
1. WHEN el usuario define un monto (entre $50 y $2000, dentro de cupo disponible) y un plazo (1,
   3, 6 o 12 meses) THEN el sistema SHALL recalcular en tiempo real cuota mensual e interés total.

### Requirement 4.14: Avance de facturación a una cuenta (#190114)
**Acceptance Criteria:**
1. WHEN el usuario solicita un avance dentro de su cupo disponible hacia una cuenta destino THEN
   el sistema SHALL confirmar la solicitud y reflejar el depósito en la cuenta elegida.
2. WHEN el monto solicitado supera el cupo disponible THEN el sistema SHALL impedir continuar.

### Requirement 4.15: Gestión de listado de tarjetas adicionales (#190115)
**Acceptance Criteria:**
1. WHEN el titular consulta sus tarjetas adicionales THEN el sistema SHALL listarlas con nombre
   del adicional, tarjeta asociada y estado, con acceso directo a solicitar una nueva.

---

## Epic 5: Establecimientos (#189150)

### Requirement 5.1: Resumen de ventas del día y monto por liquidar (#190080)
**Acceptance Criteria:**
1. WHEN el responsable de caja consulta el resumen del día THEN el sistema SHALL mostrar ventas,
   número de transacciones, ticket promedio, comisión y neto a liquidar.

### Requirement 5.2: Tabla de transacciones con filtro, orden y paginación (#190117)
**Acceptance Criteria:**
1. WHEN el usuario filtra por estado (Aprobado/Rechazado/Anulado) THEN el sistema SHALL mostrar
   solo las transacciones que coincidan, paginadas.
2. WHEN no hay resultados para el filtro aplicado THEN el sistema SHALL mostrar un estado vacío.

### Requirement 5.3: Cierre de lote de transacciones (#190118)
**Acceptance Criteria:**
1. WHEN el usuario confirma el cierre de lote THEN el sistema SHALL consolidar las transacciones
   del periodo vigente para su liquidación.

### Requirement 5.4: Reportes de ventas por marca y terminal, con exportación (#190119)
**Acceptance Criteria:**
1. WHEN el usuario exporta el reporte THEN el sistema SHALL generar un archivo descargable con los
   datos de ventas del periodo seleccionado, desglosados por marca de tarjeta y terminal.

---

## Epic 6: Créditos (#189152)

### Requirement 6.1: Visualización de estados de crédito (#190078)
**Acceptance Criteria:**
1. IF un crédito está en estado mora, legal o judicial THEN el sistema SHALL mostrar la fecha
   máxima de pago como "Inmediato" y reflejar el estado visualmente.

### Requirement 6.2: Botón de pago condicional al estado del crédito (#190079)
**Acceptance Criteria:**
1. IF el crédito está en estado legal o judicial THEN el sistema SHALL NOT mostrar el botón de
   pago, mostrando en su lugar un banner para contactar a Diners.

### Requirement 6.3: Pago de cuota de crédito (#190120)
**Acceptance Criteria:**
1. WHEN el usuario paga la cuota del mes o abona a capital desde una cuenta propia THEN el sistema
   SHALL confirmar el pago y actualizar el saldo del crédito.

### Requirement 6.4: Simulador de nuevo crédito (#190121)
**Acceptance Criteria:**
1. WHEN el usuario ajusta monto (entre $1.000 y $30.000) o plazo (12 a 60 meses) THEN el sistema
   SHALL recalcular en tiempo real la cuota mensual estimada.
2. WHEN el usuario confirma la simulación THEN el sistema SHALL registrar la solicitud en estado
   "en revisión".

---

## Epic 7: Pagos y Transferencias (#190081)

### Requirement 7.1: Transferencia de dinero con flujo guiado de 3 pasos (#190086)
**Acceptance Criteria:**
1. WHEN el usuario completa origen, destinatario y monto válido (mayor a 0 y menor o igual al
   saldo disponible) THEN el sistema SHALL solicitar confirmación con token dinámico antes de
   ejecutar la transferencia.
2. WHEN el monto excede el saldo disponible THEN el sistema SHALL impedir continuar.

### Requirement 7.2: Contactos frecuentes en el flujo de transferencia (#190087)
**Acceptance Criteria:**
1. WHEN el usuario inicia una transferencia THEN el sistema SHALL mostrar sus contactos favoritos
   como acceso rápido al destinatario.

### Requirement 7.3: Pago de tarjeta — total, mínimo u otro monto (#190088)
**Acceptance Criteria:**
1. WHEN el usuario elige pagar el total, el mínimo, o ingresa otro valor THEN el sistema SHALL
   mostrar el interés estimado ahorrado o incurrido para esa opción antes de confirmar.
2. WHEN el "otro valor" ingresado supera el total adeudado THEN el sistema SHALL impedir
   continuar.

### Requirement 7.4: Retiro sin tarjeta mediante código de cajero (#190122)
**Acceptance Criteria:**
1. WHEN el usuario define un monto válido (múltiplo de $10, máximo $300) THEN el sistema SHALL
   generar un código de 6 dígitos con validez de 30 minutos.

### Requirement 7.5: Mapa de agencias y cajeros cercanos (#190123)
**Acceptance Criteria:**
1. WHEN el usuario abre el mapa THEN el sistema SHALL mostrar agencias/cajeros cercanos con
   distancia y estado (abierto/cerrado).

### Requirement 7.6: Transferencias y pagos programados o recurrentes (#190124)
**Acceptance Criteria:**
1. WHEN el usuario pausa un programado activo THEN el sistema SHALL dejar de ejecutarlo en la
   fecha programada hasta que se reactive.
2. WHEN el usuario crea un nuevo programado (frecuencia, monto, destino) THEN el sistema SHALL
   listarlo con su próxima fecha de ejecución.

### Requirement 7.7: Pago de servicios básicos inscritos (#190125)
**Acceptance Criteria:**
1. WHEN el usuario paga un servicio vencido desde una cuenta propia THEN el sistema SHALL marcar
   el servicio como "Al día".

### Requirement 7.8: Gestión de servicios inscritos (#190126)
**Acceptance Criteria:**
1. WHEN el usuario inscribe un nuevo servicio con número de referencia válido THEN el sistema
   SHALL agregarlo al listado de inscritos.
2. WHEN el usuario quita un servicio inscrito THEN el sistema SHALL eliminarlo del listado.

### Requirement 7.9: Pago masivo por carga de archivo (#190127)
**Acceptance Criteria:**
1. WHEN el usuario carga un archivo válido (proveedores/nómina/cobros) THEN el sistema SHALL
   mostrar un resumen (registros y monto total) y enviar la carga a aprobación.
2. WHEN no se ha seleccionado un archivo THEN el sistema SHALL mantener deshabilitado "Cargar y
   validar".

### Requirement 7.10: Búsqueda y gestión de contactos y beneficiarios (#190128)
**Acceptance Criteria:**
1. WHEN el usuario busca un contacto por nombre o banco THEN el sistema SHALL filtrar el listado
   en tiempo real.
2. WHEN el usuario agrega un nuevo contacto con datos completos THEN el sistema SHALL dejarlo
   disponible para futuras transferencias.

---

## Epic 8: Aprobaciones y Administración (#190082)

### Requirement 8.1: Bandeja de aprobaciones pendientes con indicador (#190089)
**Acceptance Criteria:**
1. WHEN el aprobador tiene operaciones pendientes THEN el sistema SHALL mostrar el conteo como
   badge en el acceso rápido del Home y listarlas en la bandeja.

### Requirement 8.2: Aprobar o rechazar una operación individual (#190090)
**Acceptance Criteria:**
1. WHEN el aprobador aprueba una operación (con token si el monto lo requiere) THEN el sistema
   SHALL marcarla como aprobada y procesarla.
2. WHEN el aprobador rechaza sin ingresar motivo THEN el sistema SHALL impedir continuar.

### Requirement 8.3: Administración de usuarios y permisos por rol (#190091)
**Acceptance Criteria:**
1. WHEN el administrador crea un usuario con rol y límite de aprobación THEN el sistema SHALL
   listarlo con esos datos.
2. WHEN el administrador desactiva un usuario THEN el sistema SHALL impedirle iniciar sesión
   conservando su historial de operaciones.

### Requirement 8.4: Dashboard de cash management (#190129)
**Acceptance Criteria:**
1. WHEN el tesorero cambia la vista del flujo de caja entre semana y mes THEN el sistema SHALL
   actualizar el gráfico con los datos correspondientes.

### Requirement 8.5: Gestión de roles y permisos de aprobación (#190130)
**Acceptance Criteria:**
1. WHEN el administrador consulta un rol THEN el sistema SHALL mostrar sus permisos y el número de
   usuarios asignados.

---

## Epic 9: Recompensas Club (#190083)

### Requirement 9.1: Consolidado de puntos con nivel y progreso (#190092)
**Acceptance Criteria:**
1. WHEN el cliente consulta Recompensas THEN el sistema SHALL mostrar puntos acumulados, nivel
   actual, próximo nivel y puntos faltantes.

### Requirement 9.2: Catálogo de canje de puntos (#190093)
**Acceptance Criteria:**
1. WHEN el cliente canjea un beneficio cuyo costo es menor o igual a su saldo de puntos THEN el
   sistema SHALL descontar los puntos y confirmar el canje.
2. IF el costo del beneficio supera el saldo de puntos THEN el sistema SHALL deshabilitar el canje.

### Requirement 9.3: Historial de acumulación y canje (#190094)
**Acceptance Criteria:**
1. WHEN el historial de puntos supera el umbral configurado para mostrar en pantalla THEN el
   sistema SHALL ofrecer descarga en Excel en lugar de la lista completa.

---

## Epic 10: Servicios y Seguridad (#190097)

### Requirement 10.1: Bloqueo, desbloqueo y reporte de robo/pérdida (#190131)
**Acceptance Criteria:**
1. WHEN el usuario bloquea temporalmente una tarjeta THEN el sistema SHALL permitir
   desbloquearla nuevamente sin restricciones.
2. WHEN el usuario reporta una tarjeta como robada/perdida THEN el sistema SHALL marcarla como
   reportada de forma permanente y deshabilitar sus controles de bloqueo reversible.

### Requirement 10.2: Aviso de viaje (#190132)
**Acceptance Criteria:**
1. WHEN el usuario registra un aviso con fecha de fin posterior a la de inicio y al menos una
   tarjeta seleccionada THEN el sistema SHALL confirmar el registro.
2. WHEN la fecha de fin es anterior a la de inicio THEN el sistema SHALL impedir continuar.

### Requirement 10.3: Generación de certificados bancarios (#190133)
**Acceptance Criteria:**
1. WHEN el cliente genera un certificado (cuenta/tarjeta/no adeudo/referencia) THEN el sistema
   SHALL confirmar el envío del documento al correo registrado.

### Requirement 10.4: Consulta y descarga de documentos tributarios (#190134)
**Acceptance Criteria:**
1. WHEN el cliente filtra documentos por año THEN el sistema SHALL mostrar solo los del periodo
   seleccionado, cada uno descargable en PDF.

### Requirement 10.5: Declaración de residencia fiscal — CRS (#190135)
**Acceptance Criteria:**
1. WHEN el cliente acepta el consentimiento y completa los datos requeridos THEN el sistema SHALL
   registrar la declaración.
2. WHEN el cliente no acepta el consentimiento THEN el sistema SHALL impedir el envío.

### Requirement 10.6: Solicitud de devolución de mercadería (#190136)
**Acceptance Criteria:**
1. WHEN el cliente envía una solicitud con consumo y motivo seleccionados THEN el sistema SHALL
   generar un número de caso de seguimiento.

### Requirement 10.7: Canales de contacto y mensajería (#190137)
**Acceptance Criteria:**
1. WHEN el cliente envía un mensaje con asunto y producto seleccionados THEN el sistema SHALL
   confirmar el envío.

### Requirement 10.8: Asesor virtual con respuestas rápidas (#190138)
**Acceptance Criteria:**
1. WHEN el cliente selecciona una consulta frecuente predefinida THEN el sistema SHALL responder
   con la información correspondiente.
2. WHEN la consulta no está contemplada THEN el sistema SHALL ofrecer escalar a un asesor humano.

---

## Epic 11: Contratación de Productos (#190098)

### Requirement 11.1: Catálogo de ofertas de productos (#190139)
**Acceptance Criteria:**
1. WHEN el cliente selecciona una oferta THEN el sistema SHALL dirigirlo al flujo de solicitud o
   simulación correspondiente a ese producto.

### Requirement 11.2: Solicitud guiada de tarjeta Signature en 6 pasos (#190140)
**Acceptance Criteria:**
1. WHEN el cliente completa los 6 pasos y confirma con token válido THEN el sistema SHALL
   registrar la solicitud y mostrar el seguimiento de estado (recibida→en revisión→aprobada→en
   camino→entregada).
2. WHEN el cliente no acepta los términos y condiciones en el paso final THEN el sistema SHALL
   impedir confirmar la solicitud.

### Requirement 11.3: Apertura de Cuenta BLU+ en 4 pasos (#190141)
**Acceptance Criteria:**
1. WHEN el cliente define una meta, depósito inicial y confirma con token THEN el sistema SHALL
   crear la cuenta con el saldo inicial correspondiente.
2. IF el cliente configura un aporte recurrente THEN el sistema SHALL mostrar la confirmación de
   ese aporte al finalizar.

### Requirement 11.4: Solicitud de tarjeta adicional (#190142)
**Acceptance Criteria:**
1. WHEN el titular completa el formulario y asigna un cupo dentro de su cupo disponible THEN el
   sistema SHALL enviar la solicitud y mostrarla como pendiente en el listado de adicionales.
2. WHEN el cupo asignado supera el cupo disponible del titular THEN el sistema SHALL impedir
   continuar.
