# MOVA
Proyecto inicial: app Flutter, prototipos web independientes en ./wearable y API PostgreSQL en ./backend.

Para visualizar localmente, ejecuta en `wearable` `npm.cmd run dev:app` (app del teléfono en http://localhost:8443) y, en otra terminal, `npm.cmd run dev:wearable` (simulador MOVA Kids independiente en http://localhost:8444). Cada vista se inicia en su propio puerto; el simulador no controla la app del teléfono.

Para iniciar: instala Flutter, en app ejecuta flutter create --platforms=android,ios . y luego flutter pub get / flutter run. En backend copia .env.example a .env y ejecuta docker compose up --build.

La búsqueda/vinculación BLE está implementada. Define MOVA_BLE_SERVICE_UUID y MOVA_BLE_DATA_UUID según el fabricante para habilitar recepción y sincronización de datos JSON. Android Emulator usa http://10.0.2.2:3000. Ajusta MOVA_API_URL en dispositivos físicos.
