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

7. En el teléfono entra en **Ajustes**, registra un reloj con identificador único y genera un código. Abre [el reloj](http://localhost:8444) e introduce ese código. Vence en 10 minutos y se puede usar una sola vez. Regenerarlo y canjearlo reemplaza la credencial del reloj.
8. Crea tareas, registra emociones o modifica preferencias. El otro cliente recibe los cambios mediante consultas periódicas a la API.

Mantén las terminales abiertas. `r` recarga Flutter, `R` lo reinicia y `q` lo detiene. En Windows puedes usar `npm.cmd`. El puerto 8443 es una vista opcional que muestra el teléfono Flutter mediante un iframe y requiere que 8445 esté ejecutándose.

## Ver la base de datos

Abre [Adminer](http://localhost:8080), selecciona PostgreSQL y usa:

- Servidor: `db`
- Usuario: `mova`
- Contraseña local: `mova_dev_password`
- Base de datos: `mova`

Hay **23 tablas**, incluida la tabla técnica de migraciones. Las tablas y rutas se describen en [backend/API.md](backend/API.md). Las migraciones se aplican automáticamente al iniciar la API, conservando los registros anteriores. El primer propietario que registre un identificador antiguo sin dueño incorpora sus registros emocionales históricos a su perfil.

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
