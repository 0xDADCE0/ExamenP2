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

