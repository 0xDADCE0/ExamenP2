// src/routes/devices.routes.js
const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');
const authenticateUser = require('../middleware/auth/user.auth');
const { validateCreateNotificationFromDevice } = require('../middleware/validation/notification.validation');

/**
 * Suscribir usuario autenticado a un dispositivo por deviceCode
 * POST /api/devices/:deviceCode/subscribe
 */
router.post('/:deviceCode/subscribe', authenticateUser, deviceController.subscribe);

/**
 * Desuscribir usuario autenticado de un dispositivo
 * DELETE /api/devices/:deviceCode/subscribe
 */
router.delete('/:deviceCode/subscribe', authenticateUser, deviceController.unsubscribe);

/**
 * Publicar notificación desde dispositivo
 * El dispositivo se autentica con header x-device-key
 * POST /api/devices/:deviceCode/notifications
 */
router.post('/:deviceCode/notifications', validateCreateNotificationFromDevice, deviceController.createNotificationFromDevice);

module.exports = router;
