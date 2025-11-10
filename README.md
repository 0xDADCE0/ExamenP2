````markdown
# Lucia – Sistema de notificaciones

Proyecto compuesto por:

- **Backend**: API REST en Node.js + Express + MySQL.
- **App móvil**: React Native con Expo (cliente para usuarios finales).

---

## Requerimientos

- **Node.js** LTS (18+ o 20+)
- **npm** (incluido con Node)
- **MySQL 8+**
- **Git** (opcional, para clonar el repo)
- Dispositivo físico con **Expo Go** o emulador Android/iOS para probar la app

---

## 1. Backend (API REST)

> Carpeta sugerida: `backend/`  
> (ajusta el nombre si tu proyecto usa otra ruta)

### 1.1. Instalación de dependencias

```bash
cd backend
npm install
````

### 1.2. Configuración de base de datos

1. Crear usuario y base de datos ejecutando el script SQL del proyecto en MySQL (CLI o Workbench):

   ```sql
    DROP DATABASE IF EXISTS lucia_db;
    CREATE DATABASE lucia_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;
    
    USE lucia_db;
    
    DROP USER IF EXISTS 'lucia_db_user'@'localhost';
    CREATE USER 'lucia_db_user'@'localhost' IDENTIFIED BY 'lucia_db_password';
    GRANT SELECT, INSERT, UPDATE, DELETE
    ON lucia_db.*
    TO 'lucia_db_user'@'localhost';
    FLUSH PRIVILEGES;
    
    CREATE TABLE users (
        user_id BIGINT AUTO_INCREMENT,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(50) NOT NULL DEFAULT '',
        creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        update_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id),
        CONSTRAINT chk_users_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
    ) COMMENT 'Stores information of registered users.';
    
    CREATE TABLE devices (
        device_id BIGINT AUTO_INCREMENT,
        device_code VARCHAR(36) NOT NULL UNIQUE COMMENT 'UUID code (QR)',
        location VARCHAR(255) NOT NULL,
        api_key VARCHAR(128) NOT NULL UNIQUE,
        creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (device_id),
        KEY idx_devices_code (device_code)
    ) COMMENT 'Stores information of registered devices.';
    
    CREATE TABLE subscriptions (
        subscription_id BIGINT AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        device_id BIGINT NOT NULL,
        creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (subscription_id),
        CONSTRAINT uk_user_device UNIQUE KEY (user_id, device_id),
        CONSTRAINT fk_sub_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        CONSTRAINT fk_sub_device FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE,
        KEY idx_subscriptions_device (device_id)
    ) COMMENT 'Stores user-device subscription information.';
    
    CREATE TABLE notifications (
        notification_id BIGINT AUTO_INCREMENT,
        device_id BIGINT NOT NULL,
        type VARCHAR(50) NOT NULL,
    	title VARCHAR(255) NOT NULL,
        body TEXT NULL,
        payload JSON NULL,
        creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (notification_id),
        CONSTRAINT fk_notif_device FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE,
        KEY idx_device_created (device_id, creation_date)
    ) COMMENT 'Stores device sent notifications.';
    
    CREATE TABLE user_notifications (
        user_notification_id BIGINT AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        notification_id BIGINT NOT NULL,
        creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        read_at TIMESTAMP NULL,
        deleted_at TIMESTAMP NULL,
        PRIMARY KEY (user_notification_id),
        CONSTRAINT uk_user_notification UNIQUE KEY (user_id, notification_id),
        CONSTRAINT fk_un_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        CONSTRAINT fk_un_notification FOREIGN KEY (notification_id) REFERENCES notifications(notification_id) ON DELETE CASCADE,
        KEY idx_user_status (user_id, is_read, deleted_at, user_notification_id)
    ) COMMENT 'Stores information of individual user notifications.';

   -- Tablas: users, devices, subscriptions, notifications, user_notifications
   -- (usar el script completo incluido en este repositorio)
   ```

2. Crear archivo `.env` en la carpeta `backend`:

   ```env
   PORT=3000

   DB_HOST=localhost
   DB_USER=lucia_db_user
   DB_PASSWORD=lucia_db_password
   DB_DATABASE=lucia_db

   JWT_SECRET=lucia_jwt_secret
   ```

### 1.3. Ejecutar el backend

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

La API quedará disponible en:

```text
http://localhost:3000/api
```

---

## 2. App móvil (React Native + Expo)

> Carpeta sugerida: `app/` o `lucia-app/`
> (ajusta el nombre según tu estructura)

### 2.1. Instalación de dependencias

```bash
cd app
npm install
```

### 2.2. Configurar URL del backend

En `src/api/client.js`:

```js
const BASE_URL = 'http://<IP_LOCAL_DE_TU_PC>:3000/api';
```

* Reemplazar `<IP_LOCAL_DE_TU_PC>` por la IPv4 de la máquina donde corre el backend
  (ejemplo: `192.168.0.15`).
* El dispositivo o emulador debe estar en la **misma red** que el backend.

### 2.3. Ejecutar la app

Desde la carpeta de la app:

```bash
npm start
```

Se abrirá la interfaz de Expo en el navegador.

* **Dispositivo físico**:

  * Instalar **Expo Go** desde la store.
  * Escanear el QR que muestra la consola / navegador.
* **Emulador Android/iOS**:

  * Iniciar emulador.
  * En la interfaz de Expo elegir “Run on Android device/emulator” o “Run on iOS simulator”.

---

## 3. Scripts útiles

### Backend

* `npm start` → Inicia la API.
* `npm run dev` → Inicia la API con `nodemon` (recarga automática).

### App móvil

* `npm start` → Inicia el bundler de Expo.
* `npm run android` / `npm run ios` → Ejecutar en emulador (si está configurado).

---

## 4. Integrantes del equipo

* Benjamín Barona

---

## 5. Descripción breve del módulo implementado

El módulo implementado corresponde al **sistema de notificaciones de Lucía**, compuesto por:

### Backend

* **Gestión de usuarios**

  * Registro y login con JWT (`/auth`).
  * Consulta y actualización de perfil (`/me`).

* **Dispositivos**

  * Registro de dispositivos físicos con:

    * `device_code` (UUID impreso en QR).
    * `api_key` (clave privada del dispositivo).
  * Suscripción de usuarios a dispositivos mediante:

    * Escaneo de QR.
    * Ingreso manual del `device_code`.
  * Tabla `subscriptions` para mapear usuarios ↔ dispositivos.

* **Notificaciones**

  * Dispositivos publican notificaciones vía:

    * `POST /devices/:deviceCode/notifications` autenticado con header `x-device-key`.
  * Notificaciones almacenadas en `notifications` y replicadas por usuario en `user_notifications`.
  * Operaciones por usuario:

    * Listar notificaciones (polling REST): `GET /notifications`.
    * Marcar como leídas: `PATCH /notifications/:userNotificationId/read`.
    * Eliminación lógica (soft delete): `DELETE /notifications/:userNotificationId`.

* **Tiempo real (preparado para SSE)**

  * Endpoint SSE: `GET /notifications/stream`.
  * Cada nueva notificación se envía a los clientes conectados del usuario.

### App móvil

* Pantalla de **login** contra la API.
* Navegación con **drawer**:

  * Home.
  * Notifications (lista de notificaciones).
  * Scan QR (suscripción a dispositivos mediante QR o código manual).
* Polling periódico de notificaciones y contador de “no leídas” en el menú.
* Mensaje de “No notifications” cuando la lista está vacía.
* Fake splash screen inicial con el logo de “LUCIA”.

Este módulo deja la base lista para extender la lógica de notificaciones, integrar SSE en el cliente y añadir nuevas pantallas o funcionalidades alrededor del ecosistema de dispositivos Lucía.

```
::contentReference[oaicite:0]{index=0}
```
