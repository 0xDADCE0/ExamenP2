// src/routes/notifications.routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authenticateUser = require('../middleware/auth/user.auth');
const { validateListNotifications } = require('../middleware/validation/notification.validation');

/**
 * SSE stream para notificaciones en tiempo real del usuario autenticado
 * GET /api/notifications/stream
 */
router.get('/stream', authenticateUser, notificationController.streamForUser);

/**
 * Listar notificaciones del usuario (polling)
 * GET /api/notifications?status=unread|all&limit=&offset=
 */
router.get('/', authenticateUser, validateListNotifications, notificationController.listForUser);

/**
 * Marcar notificación como leída
 * PATCH /api/notifications/:userNotificationId/read
 */
router.patch('/:userNotificationId/read', authenticateUser, notificationController.markAsRead);

/**
 * Eliminar notificación para el usuario (soft delete)
 * DELETE /api/notifications/:userNotificationId
 */
router.delete('/:userNotificationId', authenticateUser, notificationController.deleteForUser);

module.exports = router;
