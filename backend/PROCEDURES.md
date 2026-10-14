# Lógica centralizada de MOVA en PostgreSQL

La migración `003-procedures.sql` agrega procedimientos reales PL/pgSQL y `pairing_requests`, conservando las tablas y registros existentes. `004-lock-order.sql` endurece la validación del estado y el orden de bloqueos. La API aplica ambas migraciones automáticamente y llama a procedimientos con `CALL`. Las lecturas siguen usando consultas SQL parametrizadas. El hash de contraseñas, la autenticación HTTP, la generación criptográfica de credenciales y los límites de intentos permanecen en Node.js.

## Procesos principales

| Proceso | Principal | Secuencia |
|---|---|---|
| Registro de cuenta | sp_registrar_usuario | validar datos → insertar cuenta y preferencias → sp_insertar_perfil → sesión → sp_registrar_historial |
| Crear perfil | sp_crear_perfil | validar usuario → sp_insertar_perfil (miembro propietario, preferencias, rutina inicial) → historial |
| Registrar emoción | sp_registrar_emocion | sp_validar_perfil/dispositivo → sp_validar_emocion → sp_insertar_emocion (etiquetas, seguimiento, estado, aviso) → historial |
| Sincronizar reloj | sp_procesar_sincronizacion | sp_validar_estado → sp_validar_dispositivo → guardar mensaje y estado → sp_completar_tarea / sp_registrar_emocion / sp_procesar_sos → telemetría → historial |
| Seguimiento emocional | sp_procesar_seguimiento | permisos → bloqueo de estado/observación → comprobar plazo y respuesta única → actualizar → historial |
| Vincular desde teléfono | sp_completar_vinculacion | sp_validar_vinculacion (propietario, vigencia y un uso) → sp_asociar_reloj → historial |
| Crear/editar tarea | sp_guardar_tarea | permisos → validar título, horario y días → guardar → historial |
| Crear/editar evento | sp_guardar_evento | permisos → validar datos y orden de fechas → guardar → historial |
| Completar tarea | sp_completar_tarea | permisos → validar actividad/fecha → cumplimiento por fecha → historial |
| SOS | sp_procesar_sos | permisos → crear aviso o confirmar → historial |
| Administrar perfil | sp_administrar_perfil | permisos → editar/archivar/miembros/preferencias → historial |
| Administrar cuenta | sp_administrar_cuenta | validar usuario → sesión/cierre/cambio de hash/preferencias → historial |
| Archivar | sp_archivar_recurso / sp_archivar_dispositivo | permisos → archivo lógico e invalidación cuando corresponde → historial |
| Lectura de avisos | sp_leer_aviso | permisos → guardar lectura individual |

Los procedimientos no ejecutan COMMIT ni ROLLBACK. Un CALL es atómico; si un hijo lanza una excepción no controlada se revierte la llamada. Cuando la API necesita leer el resultado dentro del mismo proceso, usa una transacción explícita y hace rollback ante cualquier fallo. `sp_error` comunica un mensaje y estado HTTP mediante SQLSTATE P0001; la API convierte esos errores a JSON sin exponer detalles SQL internos.

Los parámetros de salida son INOUT JSONB (o UUID en helpers). Ejemplo usando datos de un perfil propio:

```sql
CALL sp_registrar_emocion(
  'UUID_DEL_USUARIO'::uuid, NULL, NULL, 'UUID_DEL_PERFIL'::uuid,
  '{"mood":"Bien","note":"Registro desde pgAdmin","tags":["calm"]}'::jsonb,
  NULL
);
```

Esto modifica datos: para una demostración reversible ejecutar dentro de BEGIN y terminar con ROLLBACK. Las credenciales no se deben construir ni guardar manualmente en pgAdmin.

## Vinculación inversa

1. Reloj no vinculado llama POST `/api/pairings/start`.
2. API genera seis dígitos aleatorios y un secreto independiente de 256 bits. PostgreSQL conserva solo hashes; el código dura diez minutos.
3. Reloj muestra el QR `mova://pair?code=123456` y el mismo código. El QR no contiene token, secreto, correo ni datos del perfil.
4. Teléfono autenticado abre Ajustes → Dispositivo MOVA → Vincular reloj y escanea o escribe el código. Ambos caminos completan el mismo formulario y requieren confirmar Vincular.
5. POST `/api/pairings/claim` llama `sp_completar_vinculacion`. Solo el propietario del perfil puede reclamar. Crea un dispositivo y consume el código con bloqueo para evitar doble vinculación.
6. Reloj consulta POST `/api/pairings/status` con su secreto. Recibe su credencial al completarse la vinculación y carga las pantallas originales.

El secreto pendiente permanece localmente hasta la vinculación para tolerar recargas y pérdida temporal de red. El código no permite consultar credenciales. Desvincular desde el teléfono archiva el dispositivo e invalida su token. “Vincular otro reloj” en el simulador solo limpia su sesión local; la administración del dispositivo sigue en el teléfono.

Las rutas anteriores de registro/canje permanecen por compatibilidad con clientes instalados y también llaman a procedimientos almacenados. La interfaz nueva utiliza exclusivamente vinculación inversa.

## pgAdmin

Actualizar el árbol: Schemas → public → Procedures. Listar sin modificar datos:

```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema='public' AND routine_type='PROCEDURE'
ORDER BY routine_name;
```

Hay 33 procedimientos instalados. Ahora hay 25 tablas (incluida schema_migrations). Se añadió solo la tabla necesaria para las solicitudes de vinculación; una lógica más centralizada no exige duplicar tablas.

## Verificación

`docker compose exec -T api npm test`: flujos existentes, permisos, concurrencia, código de un uso, caducidad, recuperación, rechazo de etiqueta inválida y fallo en el último procedimiento hijo con rollback total. Las cuentas/dispositivos de prueba se eliminan por sus propios identificadores; no se borran registros de usuarios reales.

La migración `005-location.sql` agrega el proceso `sp_registrar_ubicacion`, que coordina autorización del perfil/dispositivo, `sp_validar_ubicacion`, `sp_guardar_ubicacion` e historial. La tabla `device_locations` conserva solo la última captura explícita del teléfono, identificada como simulada. Las lecturas respetan los permisos del perfil y la escritura no admite credenciales de reloj.
