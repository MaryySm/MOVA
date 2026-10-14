# MOVA

Teléfono Flutter (`app/`), reloj web React (`wearable/`) y API Express/PostgreSQL (`backend/`). Ambos clientes usan cuentas, perfiles y dispositivos persistidos en una misma base de datos.

## Ejecutar desde Visual Studio Code

1. Abre Docker Desktop. Instala Flutter y Node.js 22.12 o superior.
2. En Visual Studio Code abre esta carpeta mediante **Archivo → Abrir carpeta**.
3. Abre **Terminal → Nueva terminal** y ejecuta:

```sh
cd backend
docker compose up -d --build
```

4. Abre otra terminal desde la raíz del proyecto:

```sh
cd app
flutter pub get
flutter run -d web-server --web-hostname 127.0.0.1 --web-port 8445 --dart-define=MOVA_API_URL=http://localhost:3000
```

5. Abre [el teléfono](http://localhost:8445). Selecciona **Regístrate** y usa tu propio correo y una contraseña de 10 a 128 caracteres. Ya no se aceptan credenciales arbitrarias. Las cuentas de la antigua demo no eran cuentas de usuario y deben registrarse.
6. Abre otra terminal desde la raíz:

```sh
cd wearable
npm install
npm run dev:wearable
```

7. En el teléfono entra en **Ajustes**, selecciona **Dispositivo MOVA → Vincular reloj**. Abre [el reloj](http://localhost:8444), que muestra un QR y seis dígitos, y escanea el QR desde MOVA o escribe el código en el teléfono. Vence en 10 minutos y se puede usar una sola vez. El reloj recibe su credencial automáticamente tras confirmar la vinculación en el teléfono.
8. Crea tareas, registra emociones o modifica preferencias. El otro cliente recibe los cambios mediante consultas periódicas a la API.

Mantén las terminales abiertas. `r` recarga Flutter, `R` lo reinicia y `q` lo detiene. En Windows puedes usar `npm.cmd`. El puerto 8443 es una vista opcional que muestra el teléfono Flutter mediante un iframe y requiere que 8445 esté ejecutándose.

## Ver la base de datos

Abre [Adminer](http://localhost:8080), selecciona PostgreSQL y usa:

- Servidor: `db`
- Usuario: `mova`
- Contraseña local: `mova_dev_password`
- Base de datos: `mova`

Hay **25 tablas**, incluida la tabla técnica de migraciones. Las tablas y rutas se describen en [backend/API.md](backend/API.md). Las migraciones se aplican automáticamente al iniciar la API, conservando los registros anteriores. El primer propietario que registre un identificador antiguo sin dueño incorpora sus registros emocionales históricos a su perfil.

## Conectar desde pgAdmin o PostgreSQL

La base de datos está en el contenedor PostgreSQL del proyecto. Para verla con pgAdmin instalado en tu computador:

1. Abre Docker Desktop y asegúrate de que los contenedores de `backend/` estén ejecutándose (`docker compose up -d`).
2. Abre pgAdmin 4. Haz clic derecho en **Servers → Register → Server**.
3. En **General**, escribe `MOVA local` en Name.
4. En **Connection** completa Host name/address `127.0.0.1`, Port `5432`, Maintenance database `mova`, Username `mova` y Password `mova_dev_password`.
5. Guarda y abre **Servers → MOVA local → Databases → mova → Schemas → public → Tables**.
6. Para ver los registros, haz clic derecho en una tabla y selecciona **View/Edit Data → All Rows**.

En pgAdmin instalado en el computador usa `127.0.0.1`; en Adminer, que está dentro de Docker, usa `db`.

Si ya tienes el cliente `psql` instalado:

```sh
psql -h 127.0.0.1 -p 5432 -U mova -d mova
```

Ingresa la contraseña cuando la solicite. `\dt public.*` lista las tablas; `\q` cierra la conexión. También puedes acceder sin instalar psql, desde la carpeta backend:

```sh
docker compose exec db psql -U mova -d mova
```

El backend es la API que conecta las aplicaciones con PostgreSQL. Su comprobación está en [localhost:3000/health](http://localhost:3000/health); las tablas se consultan con pgAdmin o Adminer.

## Operaciones disponibles

Registro e inicio de sesión real, cierre de sesión y cambio de contraseña; múltiples perfiles y cuidadores con permisos; registro y vinculación de dispositivos; tareas recurrentes y cumplimiento por fecha; agenda; emociones con notas, etiquetas, historial y porcentajes diarios, semanales y mensuales; seguimiento único en el reloj; SOS con confirmación del cuidador; avisos con lectura por usuario; preferencias compartidas; recepción de telemetría y auditoría básica.

El seguimiento usa 30 segundos durante las pruebas. Para 5 minutos:

```sh
cd backend
MOVA_EMOTION_FOLLOWUP_SECONDS=300 docker compose up -d api
```

La lógica de escritura está centralizada en procedimientos almacenados principales y secundarios. Ver [la arquitectura y sus pruebas](backend/PROCEDURES.md). El historial emocional incluye un gráfico de barras verticales con colores pastel fijos por emoción y filtros Hoy/Semana/Mes.

La telemetría procede de datos enviados por el cliente: tener tablas no implica disponer de sensores o firmware. El reloj web es un simulador. La entrega de avisos es dentro de la aplicación; no hay envío externo por correo ni notificaciones push. La recuperación por correo y el firmware BLE del reloj quedan pendientes. Esta configuración es de desarrollo local; las credenciales de PostgreSQL y el transporte HTTP deben configurarse al preparar un despliegue real.

## Verificar

```sh
cd backend
docker compose exec -T api npm test
```

```sh
cd app
flutter test
flutter analyze
```

```sh
cd wearable
npm run build -- --mode wearable
npx tsc --noEmit
```

Las pruebas de integración crean cuentas y dispositivos propios y eliminan únicamente esos datos al terminar. Para detener los contenedores y conservar los datos: `docker compose down`. No uses `down -v` si deseas conservar la base de datos.

En un emulador Android usa `--dart-define=MOVA_API_URL=http://10.0.2.2:3000`. En un dispositivo físico usa la dirección de red del computador y configura el acceso correspondiente.

## iPhone sin reinstalar por cambios de IP

La versión móvil usa un nombre Bonjour del Mac (en este equipo: `http://MacBook-Air-de-Erick.local:3000`) y permite configurar el servidor en tiempo de ejecución. El Mac y el iPhone deben estar en la misma red, con Docker activo y permiso de red local. El nombre se consulta en macOS con `scutil --get LocalHostName`; sustituirlo en otro computador.

En el acceso, pulsar el icono Wi-Fi de la esquina superior derecha. También está en Ajustes → Conexiones → Conexión con MOVA. Ingresar una URL base sin rutas, pulsar Comprobar y luego Guardar. La comprobación consulta `/health` sin credenciales. La dirección se conserva entre reinicios; cambiar de servidor elimina la sesión local para evitar reutilizar credenciales en otro destino. No elimina la cuenta ni los datos de PostgreSQL.

Si una red bloquea Bonjour o la comunicación entre equipos, usar la IP actual desde ese mismo diálogo o una red que permita conexiones locales. Un backend publicado con dominio HTTPS sería necesario para usar MOVA a través de internet; no se despliega uno con esta configuración local.

Desde la carpeta `app` de la copia fuera de iCloud, la actualización inicial para este Mac es:

```sh
flutter run --release -d ID_DEL_IPHONE --dart-define=MOVA_API_URL=http://MacBook-Air-de-Erick.local:3000
```

## Probar la ubicación del reloj con el teléfono

La tarjeta Dispositivo MOVA del inicio usa cartografía real de OpenStreetMap y conserva su tamaño y estilo. Pulsar Ubicar y permitir ubicación mientras se usa MOVA. El punto es del teléfono y se etiqueta como simulación del reloj, con hora de captura. Cada pulsación obtiene una posición; no hay seguimiento automático ni ubicación en segundo plano.

Con un reloj vinculado, la API guarda solo la última posición en `device_locations` (fuente `phone_simulated`, precisión y fecha), mediante `sp_registrar_ubicacion` → `sp_validar_ubicacion` → `sp_guardar_ubicacion` → historial. Otros clientes autorizados consultan esa posición. Sin reloj vinculado, se muestra localmente y se informa que no se comparte. Una desconexión deja el punto visible y avisa que no se pudo guardar. El mapa necesita internet para descargar cartografía y no coloca un marcador hasta obtener una posición real o una captura previamente guardada. El mapa inicial de Santiago es solo una vista, no una ubicación detectada.

Este cambio requiere actualizar una vez la app del iPhone para incluir las dependencias y el permiso de ubicación. No requiere borrar la aplicación ni la cuenta. La atribución OpenStreetMap permanece visible y enlaza a su licencia.

Al tocar el mapa compacto se abre una vista ampliada dentro de MOVA con zoom y desplazamiento, centrado, actualización manual y botón Minimizar. Google Maps, Apple Maps y Waze reciben las mismas coordenadas del marcador solo al seleccionar su botón. Google Maps y Waze intentan abrir la app instalada y usan su enlace web como alternativa; Apple Maps usa su enlace universal. Los accesos están deshabilitados hasta obtener una posición. La ubicación sigue identificada como simulación del teléfono.
