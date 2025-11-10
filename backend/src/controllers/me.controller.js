// controllers/me.controller.js
const db = require('../config/db.config');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');

const meController = {
    // Obtener perfil del usuario autenticado
    async getMe(req, res) {
        const userId = req.user.user_id;
        
        const [rows] = await db.execute(
            'SELECT user_id, email, username, creation_date FROM users WHERE user_id = ?',
            [userId]
        );
        
        if (rows.length === 0) {
            throw new ApiError(404, 'Usuario no encontrado');
        }
        
        res.json(rows[0]);
    },

    // Actualizar perfil del usuario autenticado
    async updateMe(req, res) {
        const { email, password, username } = req.body;
        const userId = req.user.user_id;

        const fields = [];
        const params = [];

        if (email !== undefined) {
            fields.push('email = ?');
            params.push(email);
        }

        if (password !== undefined) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            fields.push('password_hash = ?');
            params.push(password_hash);
        }

        if (username !== undefined) {
            fields.push('username = ?');
            params.push(username);
        }

        // Si no se mandó ningún campo actualizable
        if (fields.length === 0) {
            throw new ApiError(400, 'No se proporcionó ningún campo para actualizar');
        }

        const query = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;
        params.push(userId);

        const [result] = await db.execute(query, params);

        if (result.affectedRows === 0) {
            throw new ApiError(404, 'Usuario no encontrado');
        }

        return res.json({
            message: 'Perfil actualizado exitosamente'
        });
    },

    // Eliminar perfil del usuario autenticado
    async deleteMe(req, res) {
        const userId = req.user.user_id;
        
        const [result] = await db.execute(
            'DELETE FROM users WHERE user_id = ?',
            [userId]
        );
        
        if (result.affectedRows === 0) {
            throw new ApiError(404, 'Usuario no encontrado');
        }
        
        res.json({
            message: 'Cuenta eliminada exitosamente'
        });
    }
};

module.exports = meController;
