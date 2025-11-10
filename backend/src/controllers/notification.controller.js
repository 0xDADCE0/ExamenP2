// src/controllers/notification.controller.js
const db = require('../config/db.config');
const ApiError = require('../utils/ApiError');
const notificationSse = require('../services/notification.service');

const notificationController = {
  // GET /api/notifications?status=unread|all&limit=&offset=
  async listForUser(req, res, next) {
    try {
      const userId = req.user.user_id;

      const status = req.query.status === 'all' ? 'all' : 'unread';

      const limitRaw = req.query.limit ?? '50';
      const offsetRaw = req.query.offset ?? '0';

      const limit = parseInt(limitRaw, 10);
      const offset = parseInt(offsetRaw, 10);

      if (!Number.isInteger(limit) || limit <= 0) {
        throw new ApiError(400, 'El parámetro "limit" debe ser un número entero positivo');
      }
      if (!Number.isInteger(offset) || offset < 0) {
        throw new ApiError(400, 'El parámetro "offset" debe ser un número entero mayor o igual a 0');
      }

      // IMPORTANTE: solo dejamos ? para user_id.
      // limit y offset van interpolados después de validados.
      const query = `
        SELECT
          un.user_notification_id,
          un.user_id,
          un.notification_id,
          un.creation_date   AS user_notification_creation_date,
          un.is_read,
          un.read_at,
          un.deleted_at,
          n.device_id,
          n.type,
          n.title,
          n.body,
          n.payload,
          n.creation_date    AS notification_creation_date,
          d.device_code,
          d.location AS device_location
        FROM user_notifications un
        JOIN notifications n ON un.notification_id = n.notification_id
        JOIN devices d       ON n.device_id = d.device_id
        WHERE un.user_id = ?
          AND un.deleted_at IS NULL
          ${status === 'unread' ? 'AND un.is_read = 0' : ''}
        ORDER BY n.creation_date DESC, un.user_notification_id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const [rows] = await db.execute(query, [userId]);
      return res.json(rows);
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { userNotificationId } = req.params;

      const [result] = await db.execute(
        `UPDATE user_notifications
         SET is_read = 1,
             read_at = NOW()
         WHERE user_notification_id = ?
           AND user_id = ?
           AND deleted_at IS NULL`,
        [userNotificationId, userId]
      );

      if (result.affectedRows === 0) {
        throw new ApiError(404, 'Notificación no encontrada');
      }

      return res.json({ message: 'Notificación marcada como leída' });
    } catch (err) {
      next(err);
    }
  },

  async deleteForUser(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { userNotificationId } = req.params;

      const [result] = await db.execute(
        `UPDATE user_notifications
         SET deleted_at = NOW()
         WHERE user_notification_id = ?
           AND user_id = ?
           AND deleted_at IS NULL`,
        [userNotificationId, userId]
      );

      if (result.affectedRows === 0) {
        throw new ApiError(404, 'Notificación no encontrada');
      }

      return res.json({ message: 'Notificación eliminada' });
    } catch (err) {
      next(err);
    }
  },

  streamForUser(req, res) {
    const userId = req.user.user_id;

    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    if (res.flushHeaders) {
      res.flushHeaders();
    }

    notificationSse.addClient(userId, res);
    res.write('event: connected\ndata: {}\n\n');

    req.on('close', () => {
      notificationSse.removeClient(userId, res);
      res.end();
    });
  }
};

module.exports = notificationController;
