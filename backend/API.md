# API MOVA y modelo de datos

Base local: `http://localhost:3000`. JSON. El encabezado `Authorization: Bearer <token>` es obligatorio salvo para salud, registro, acceso, inicio/consulta de vinculación y canje legacy. Las respuestas no incluyen hashes de contraseña ni credenciales de otros dispositivos.

## Tablas (25)

| Área | Tablas | Relación |
|---|---|---|
| Cuentas | users, auth_sessions, user_settings | Sesiones con vencimiento y revocación; preferencias por usuario |
| Perfiles | profiles, profile_members, profile_settings | Propietario y miembros con rol owner/caregiver/viewer |
| Dispositivos | devices, device_pairings, pairing_requests | Reloj asociado a propietario y perfil; código temporal de un uso |
| Rutinas | tasks, task_completions | Horario y días de semana; cumplimiento independiente por fecha |
| Agenda | calendar_events | Eventos del perfil con inicio, fin y notas |
| Emociones | emotion_types, emotion_tags, emotion_entries, emotion_entry_tags | Catálogos, observaciones fechadas, notas, etiquetas y seguimiento |
| Avisos | sos_events, notifications, notification_reads | SOS abierto/confirmado y lectura independiente por usuario |
| Sincronización | wearable_states, wearable_syncs, telemetry_samples, device_locations | Estado actual, recepción histórica y muestras de sensores |
| Operación | audit_logs, schema_migrations | Auditoría básica de acciones y migraciones aplicadas |

Las relaciones usan claves foráneas e índices. Los registros emocionales anteriores permanecen. Tareas, eventos, perfiles y dispositivos se archivan para conservar historial. Las contraseñas usan scrypt con sal aleatoria; sesiones y credenciales de dispositivos se almacenan mediante hash SHA-256, nunca como el token original.

Los procesos de escritura se coordinan mediante procedimientos almacenados PL/pgSQL, documentados en [PROCEDURES.md](PROCEDURES.md).

## Acceso

| Método | Ruta | Cuerpo / resultado |
|---|---|---|
| GET | /health | Estado de API y conexión PostgreSQL |
| POST | /api/auth/register | email, password (10–128), name, profileName, age opcional, diagnosis opcional; devuelve token, user, profile |
| POST | /api/auth/login | email, password; devuelve token y user |
| GET | /api/auth/me | Usuario de la sesión |
| POST | /api/auth/logout | Revoca sesión actual; 204 |
| POST | /api/auth/password | currentPassword, newPassword; revoca otras sesiones |
| POST | /api/pairings/start | Público; genera code de seis dígitos, qr, secret y expiresAt para el reloj |
| POST | /api/pairings/status | Público; secret; devuelve estado y credencial del reloj cuando está vinculado |
| POST | /api/pairings/claim | Usuario propietario; code, profileId, name opcional; vincula el reloj |
| POST | /api/pairings/redeem | code; devuelve token limitado al dispositivo y device |

Una sesión dura siete días. Los códigos de vinculación duran diez minutos, se canjean una vez y sustituyen la credencial previa del reloj. Registro, acceso y canje limitan los intentos por IP.

## Perfiles y dispositivos

- GET/POST `/api/profiles`: listar perfiles accesibles / crear con name, age, diagnosis.
- PATCH/DELETE `/api/profiles/:id`: editar name, age, diagnosis, photo / archivar.
- GET/POST `/api/profiles/:id/members`: listar / agregar usuario registrado mediante email y role (`caregiver` o `viewer`). Solo el propietario administra miembros.
- DELETE `/api/profiles/:id/members/:userId`: retirar miembro; no permite retirar propietario.
- GET/POST `/api/devices`: listar / registrar id, name, profileId. Identificador alfanumérico con guiones y guiones bajos.
- POST `/api/devices/:id/pairing`: generar código, solo propietario.
- DELETE `/api/devices/:id`: archivar e invalidar credencial, solo propietario.
- GET/PATCH `/api/profiles/:id/settings`: vibration, sound, lights, intensity (0–10).
- GET/PATCH `/api/settings`: preferencias del usuario; PATCH language.

Un viewer puede consultar, pero no modificar datos del perfil. El token del reloj solo permite consultar y enviar datos de su propio dispositivo; no administra cuentas o perfiles. Confirmar SOS requiere usuario con permiso de escritura.

## Tareas y agenda

- GET `/api/profiles/:id/tasks?date=AAAA-MM-DD`: `{date,tasks}` para los días programados; sin date usa el día actual del perfil.
- POST `/api/profiles/:id/tasks`: title, icon, time (`HH:MM`), weekdays (1=lunes, 7=domingo).
- PATCH/DELETE `/api/tasks/:id`: editar / archivar.
- PUT `/api/tasks/:id/completion`: done boolean, date opcional. Respuesta 204.
- GET/POST `/api/profiles/:id/calendar`: listar / crear title, startsAt, endsAt (ISO 8601), notes.
- PATCH/DELETE `/api/calendar/:id`: editar / archivar. Fin debe ser posterior al inicio.

## Emociones y sincronización

- GET `/api/catalog`: emociones y etiquetas válidas.
- POST `/api/profiles/:id/emotions`: mood (código o etiqueta), note opcional, tags opcional. Registro del teléfono sin seguimiento si no hay reloj seleccionado.
- GET `/api/profiles/:id/emotions` o `/api/devices/:id/emotions`: entries (50 por página), nextCursor, timezone, summary.day/week/month. `?before=<nextCursor>` obtiene la página siguiente. Los porcentajes son proporciones de registros, no de duración emocional.
- GET `/api/devices/:id/state`: payload, tasks actuales, settings, followUp, serverNow.
- PATCH `/api/devices/:id/state`: mood, note, tags, activities (objeto idTarea:boolean), sos, heartRate, steps, battery. Un mood produce una observación aunque repita el anterior.
- POST `/api/sync`: deviceId y payload con los mismos campos reconocidos; conserva el mensaje recibido y actualiza datos derivados.
- GET `/api/sync?deviceId=<id>&limit=50`: historial limitado a recursos autorizados, máximo 100.
- POST `/api/devices/:id/emotions/:entryId/prompt`: reclamar seguimiento vencido de forma idempotente.
- POST `/api/devices/:id/emotions/:entryId/answer`: stillFeeling boolean; repetir la misma respuesta es idempotente, cambiar una ya confirmada devuelve 409.

Un nuevo registro en el mismo reloj reemplaza un seguimiento pendiente anterior. El reloj consulta el estado y muestra el seguimiento después del plazo; la API no envía push. La zona de informes es America/Santiago. La persistencia de tareas está separada por fecha y compartida por los relojes de un perfil.

## Avisos y sensores

- GET `/api/profiles/:id/notifications`: avisos y read_at propio.
- POST `/api/notifications/:id/read`: marcar leído, 204.
- GET `/api/profiles/:id/sos`: historial con raised_at y acknowledged_at.
- GET `/api/devices/:id/telemetry`: últimas 100 muestras recibidas.

## Validación y pruebas

Errores JSON `{error}`: 400 entrada inválida, 401 sesión ausente/vencida, 403 permiso insuficiente, 404 recurso no disponible, 409 conflicto, 429 límite de intentos. Las actualizaciones compuestas de sincronización son transaccionales. Los ensayos prueban permisos, vinculación, tareas por fecha, agenda, emociones, seguimiento idempotente, límites de calendario chileno, paginación, SOS, preferencias, telemetría, lectura de avisos y revocación.

Los puertos, secretos y conexiones de Compose son de desarrollo. No se incluye envío SMTP, recuperación por correo, entrega push ni firmware del reloj físico. Los avisos SOS requieren que el cliente cuidador esté abierto y conectado para verlos. La auditoría implementada cubre registros, vinculación y sincronización; no es un registro completo de todas las lecturas y cambios administrativos.

## Ubicación simulada para pruebas

- GET `/api/devices/:id/location`: última captura o null; acceso limitado al dispositivo/perfil autorizado.
- POST `/api/devices/:id/location`: usuario con permiso de escritura; latitude [-90,90], longitude [-180,180], accuracy [0,99999], observedAt ISO reciente y source exactamente `phone_simulated`. Guarda mediante procedimientos y evita reemplazar una captura por otra más antigua. El reloj no puede enviar datos haciéndose pasar por un teléfono.

La migración 005 agrega `device_locations`: una fila por dispositivo, sin historial de recorridos. No representa GPS del reloj físico.
