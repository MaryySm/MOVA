# MOVA

El proyecto incluye tres componentes:

- `wearable/`: prototipos React + Vite del teléfono y del reloj MOVA Kids. Comparten emociones, actividades y SOS mediante la API. Los perfiles siguen guardándose en cada navegador.
- `app/`: aplicación Flutter con pantallas de acceso, perfiles, rutinas y conexión BLE.
- `backend/`: API Express que guarda sincronizaciones JSON en PostgreSQL.

## Ejecutar los prototipos web

Con Node.js 22.12 o superior (Node 24 también funciona), desde la raíz:

```sh
cd wearable
npm install
npm run dev:app
```

Abre http://localhost:8443. En otra terminal, desde `wearable/`:

```sh
npm run dev:wearable
```

Abre http://localhost:8444. Para comprobar la compilación: `npm run build`.
En Windows se puede usar `npm.cmd` en lugar de `npm`. Detén cada servidor con Ctrl+C.

## Ejecutar API y base de datos

Abre Docker Desktop y, desde la raíz:

```sh
cd backend
docker compose up -d --build
```

Docker Compose ya define las variables de conexión; no requiere crear `.env`.
Comprueba http://localhost:3000/health: debe devolver `status: ok` y `database: connected`.

- `POST /api/sync`: recibe `{"deviceId":"mova","payload":{"heartRate":80}}`.
- `GET /api/sync?limit=50`: devuelve las sincronizaciones más recientes.

Para detener los contenedores conservando los datos: `docker compose down`.
Los datos se almacenan en el volumen `mova_pgdata`.

## Ejecutar Flutter

Las plataformas Android, iOS y web ya están creadas. Desde la raíz:

```sh
cd app
flutter pub get
flutter devices
flutter test
```

Para ver la interfaz en el navegador:

```sh
flutter run -d web-server --web-hostname 127.0.0.1 --web-port 8445 --dart-define=MOVA_API_URL=http://localhost:3000
```

Abre http://localhost:8445. La versión web comparte datos con el simulador; CORS está habilitado para los puertos locales 8443, 8444 y 8445. El acceso actual valida los campos localmente y no implementa autenticación de servidor.

Para Android, conecta un teléfono con depuración USB o inicia un emulador y ejecuta:

```sh
flutter run -d ID_DEL_DISPOSITIVO --dart-define=MOVA_API_URL=http://10.0.2.2:3000
```

`10.0.2.2` corresponde al host desde Android Emulator. En un teléfono físico o iOS, reemplázalo por la IP local de tu computador y usa la misma red Wi-Fi.

Para recibir datos del wearable real, define también `--dart-define=MOVA_BLE_SERVICE_UUID=UUID_DEL_SERVICIO` y `--dart-define=MOVA_BLE_DATA_UUID=UUID_DE_DATOS` con los valores del fabricante. La app espera datos JSON; la conexión a un wearable real todavía necesita validación con el dispositivo.

## Datos compartidos entre teléfono y reloj

Inicia primero Docker Compose y luego las vistas web/Flutter. Las tres usan el dispositivo de demostración `MOVA-2841` y consultan su estado cada dos segundos:

- En el reloj (`8444`), elige una emoción o marca una actividad. El teléfono Flutter (`8445`) la muestra en Inicio y actualiza sus rutinas y emociones.
- En Flutter, marca una rutina o selecciona una emoción desde Inicio: el cambio también llega al reloj. En Emociones, usa «Guardar registro» para enviar la emoción seleccionada; las notas todavía son locales.
- Mantén pulsado SOS en el reloj. En Inicio del teléfono aparece la solicitud y el botón «Confirmar recepción». Al confirmar, el reloj vuelve a Inicio y muestra la confirmación. Esto registra un aviso en la demo; no contacta servicios de emergencia ni envía notificaciones fuera de estas vistas.
- El teléfono React (`8443`) incluye en Inicio el panel «Reloj enlazado» para ver y editar los mismos datos. Los demás paneles originales de ese prototipo conservan sus datos locales de demostración.
- Si la API falla, aparece el estado de conexión y los cambios no se anuncian como guardados. Las lecturas se reintentan; repite una edición fallida cuando vuelva la conexión.

La tabla `wearable_states` contiene el estado actual por dispositivo y `wearable_syncs` conserva el historial de cambios. La migración se aplica automáticamente al iniciar la API, incluso si el volumen ya existía.

API del estado compartido:

```text
GET   /api/devices/MOVA-2841/state
PATCH /api/devices/MOVA-2841/state
```

PATCH acepta campos parciales, por ejemplo `{"mood":"Bien"}`, `{"activities":{"a1":true}}` o `{"sos":false}`. Las actividades se identifican de `a1` a `a7`, en el mismo orden que el reloj. `POST /api/sync` también actualiza el estado si recibe esos campos o `heartRate`, con un `deviceId` válido.

Para otro dispositivo, configura el mismo identificador en ambos clientes: `VITE_MOVA_DEVICE_ID` en React y `--dart-define=MOVA_DEVICE_ID=ID` en Flutter. React acepta `VITE_MOVA_API_URL`; por defecto usa el nombre del host actual con el puerto 3000. Para acceder desde otra IP, configura `CORS_ORIGINS` en `backend/.env` con los orígenes exactos separados por comas, y reinicia Compose. Configura además `MOVA_API_URL` en Flutter.

La integración es una demo local de un dispositivo compartido. Todavía no incluye cuentas de servidor, permisos por usuario, asignación remota de perfiles ni sincronización de calendarios, fotos o notas.

Verificación:

```sh
# Con la API encendida, desde backend (genera un dispositivo test-... aislado):
docker compose exec -T api npm test
# Desde wearable:
npm run build
npx tsc --noEmit
# Desde app:
flutter test
```

## Historial emocional y seguimiento

En la sección Emociones de Flutter, cada registro confirmado desde el teléfono o el reloj aparece con fecha y hora de Chile. Se conservan también los registros anteriores de la demo, identificados como «sin seguimiento». El historial se ordena por fecha descendente y permite cargar registros anteriores.

Los filtros Hoy, Semana y Mes muestran la distribución de los registros del día actual, la semana actual (desde el lunes) y el mes actual, en `America/Santiago`. Cada porcentaje es el número de registros de esa emoción dividido por el total del periodo. No mide duración, y las respuestas al seguimiento no se cuentan como nuevos registros.

Cada nueva emoción programa una única pregunta en el reloj: «¿Aún te sientes …?». En pruebas, aparece después de 30 segundos mientras el simulador está abierto. «Sí, sigo igual» o «No, cambió» guarda la respuesta y su hora en el registro original. No se programa una segunda pregunta a partir de esa respuesta. Si se registra otra emoción, el seguimiento pendiente anterior se reemplaza. Si el reloj está cerrado, la pregunta pendiente aparece al abrirlo; los datos y el plazo sobreviven al reinicio de la API.

Para cambiar a cinco minutos, configura `MOVA_EMOTION_FOLLOWUP_SECONDS=300` en `backend/.env` y ejecuta `docker compose up -d --build`. El nuevo plazo se aplica a los registros creados desde ese momento.

Rutas adicionales:

```text
GET  /api/devices/MOVA-2841/emotions
GET  /api/devices/MOVA-2841/emotions?before=ID_DEL_ULTIMO_REGISTRO
POST /api/devices/MOVA-2841/emotions/ID/prompt
POST /api/devices/MOVA-2841/emotions/ID/answer
```

La respuesta a `answer` usa `{"stillFeeling":true}` o `{"stillFeeling":false}`. La API controla el plazo y admite reintentos de la misma respuesta sin duplicar el seguimiento. El historial devuelve páginas de 50 registros y los resúmenes de los tres periodos completos.
