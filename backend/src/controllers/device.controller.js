// src/controllers/device.controller.js
const db = require('../config/db.config');
const ApiError = require('../utils/ApiError');
const notificationSse = require('../services/notification.service');

const deviceController = {
    // Suscribir usuario autenticado a un dispositivo por device_code (QR)
    async subscribe(req, res) {
        const userId = req.user.user_id;
        const { deviceCode } = req.params;

        const [devices] = await db.execute(
            'SELECT device_id FROM devices WHERE device_code = ?',
            [deviceCode]
        );
        if (devices.length === 0) {
            throw new ApiError(404, 'Dispositivo no encontrado');
        }

        const device = devices[0];

        try {
            await db.execute(
                'INSERT INTO subscriptions (user_id, device_id) VALUES (?, ?)',
                [userId, device.device_id]
            );
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                // Ya está suscrito
                return res.status(200).json({
                    message: 'Ya estabas suscrito a este dispositivo'
                });
            }
            throw err;
        }

        res.status(201).json({
            message: 'Suscripción creada exitosamente'
        });
    },

    // Desuscribir usuario autenticado de un dispositivo
    async unsubscribe(req, res) {
        const userId = req.user.user_id;
        const { deviceCode } = req.params;

        const [devices] = await db.execute(
            'SELECT device_id FROM devices WHERE device_code = ?',
            [deviceCode]
        );
        if (devices.length === 0) {
            throw new ApiError(404, 'Dispositivo no encontrado');
        }

        const device = devices[0];

        const [result] = await db.execute(
            'DELETE FROM subscriptions WHERE user_id = ? AND device_id = ?',
            [userId, device.device_id]
        );

        if (result.affectedRows === 0) {
            throw new ApiError(404, 'No estabas suscrito a este dispositivo');
        }

        res.json({ message: 'Suscripción eliminada exitosamente' });
    },

    // Endpoint que usa el dispositivo para publicar una notificación
    // POST /devices/:deviceCode/notifications
    async createNotificationFromDevice(req, res) {
        const { deviceCode } = req.params;
        const deviceApiKey = req.header('x-device-key');
        const { type, title, body, payload } = req.body;

        if (!deviceApiKey) {
            throw new ApiError(401, 'Clave de dispositivo requerida en header x-device-key');
        }

        const [devices] = await db.execute(
            'SELECT device_id, api_key, location FROM devices WHERE device_code = ?',
            [deviceCode]
        );

        if (devices.length === 0) {
            throw new ApiError(404, 'Dispositivo no encontrado');
        }

        const device = devices[0];

        if (device.api_key !== deviceApiKey) {
            throw new ApiError(403, 'Clave de dispositivo inválida');
        }

        const conn = await db.getConnection();

        try {
            await conn.beginTransaction();

            const [notifResult] = await conn.execute(
                'INSERT INTO notifications (device_id, type, title, body, payload) VALUES (?, ?, ?, ?, ?)',
                [
                    device.device_id,
                    type,
                    title,
                    body || null,
                    payload ? JSON.stringify(payload) : null
                ]
            );

            const notificationId = notifResult.insertId;

            const [subs] = await conn.execute(
                'SELECT user_id FROM subscriptions WHERE device_id = ?',
                [device.device_id]
            );

            if (subs.length > 0) {
                const values = subs.map(s => [s.user_id, notificationId]);
                const placeholders = values.map(() => '(?, ?)').join(', ');
                const flat = values.flat();

                await conn.execute(
                    `INSERT INTO user_notifications (user_id, notification_id) VALUES ${placeholders}`,
                    flat
                );
            }

            await conn.commit();

            // Notificar por SSE fuera de la transacción
            const notificationPayload = {
                notification_id: notificationId,
                type,
                title,
                body: body || null,
                payload: payload || null,
                device: {
                    device_id: device.device_id,
                    device_code: deviceCode,
                    location: device.location
                },
                creation_date: new Date().toISOString()
            };

            for (const s of subs || []) {
                notificationSse.sendToUser(s.user_id, notificationPayload);
            }

            res.status(201).json({
                notification_id: notificationId,
                delivered_to: (subs || []).length
            });
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }
};

module.exports = deviceController;
