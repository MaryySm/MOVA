# MOVA

Proyecto con app móvil Flutter en `app`, prototipos web locales en `wearable` y API Node.js/PostgreSQL en `backend`.

## API y base de datos local

Requiere Docker Desktop con Docker Compose. En PowerShell:

```powershell
cd C:\mova\backend
Copy-Item .env.example .env
```

Edita `.env` y sustituye los dos valores `replace_with_...` por secretos distintos generados con un gestor seguro. La contraseña de PostgreSQL debe ser hexadecimal para que funcione en la URL de conexión. Luego ejecuta:

```powershell
docker compose up --build -d
docker compose ps
```

La API queda disponible en `http://localhost:3000`; `GET /health` indica cuándo PostgreSQL está conectado. Los datos se guardan en el volumen Docker `mova_pgdata`. Las tablas se crean o actualizan de forma idempotente al iniciar la API.

## App Flutter y autenticación

Requiere Flutter. En una terminal, desde `app`:

```powershell
flutter pub get
flutter run --dart-define=MOVA_API_URL=http://10.0.2.2:3000
```

`10.0.2.2` conecta el emulador Android con la API del computador. En un teléfono físico, reemplázalo por la IP local del computador. Para una compilación publicada, define `MOVA_API_URL` como la URL HTTPS de la API.

Para ver la app en Chrome en este computador, inicia Flutter con `flutter run -d chrome --dart-define=MOVA_API_URL=http://localhost:3000`. El Compose local permite CORS solo para orígenes localhost; en producción configura `CORS_ORIGINS` con los orígenes exactos y deja `ALLOW_LOCAL_CORS=0`.

El registro crea en PostgreSQL la cuenta del adulto y los datos del usuario, incluyendo una contraseña almacenada con hash y sal. El correo se normaliza a minúsculas y debe ser único. El inicio de sesión valida la contraseña contra ese hash y entrega una sesión firmada. Las rutas de sincronización requieren esa sesión y separan los registros por cuenta.

## Publicación

La autenticación y persistencia están conectadas localmente, pero el proyecto aún no está desplegado en Internet. Para publicarlo hacen falta un proveedor de hosting con PostgreSQL, un dominio, HTTPS y secretos configurados en ese proveedor. No subas `.env` ni uses credenciales de desarrollo en producción. Cuando esos datos estén disponibles, se puede configurar el despliegue y compilar la app contra su URL HTTPS.

## Prototipos web locales

Desde `wearable`, inicia en terminales separadas:

```powershell
npm.cmd run dev:app
npm.cmd run dev:wearable
```

La app de teléfono abre en `http://localhost:8443` y el simulador independiente MOVA Kids en `http://localhost:8444`.

## Bluetooth

Define `MOVA_BLE_SERVICE_UUID` y `MOVA_BLE_DATA_UUID` según el fabricante para habilitar la recepción de datos BLE. También configura `MOVA_API_URL` en la compilación Flutter.
