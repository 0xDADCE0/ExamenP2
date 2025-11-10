// config/swagger.config.js
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Lucia API',
            version: '1.0.0',
            description: 'API para el sistema de notificaciones Lucia'
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Servidor de desarrollo'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                // Esquema base de todos los errores
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Mensaje principal de error',
                            example: 'Error interno'
                        },
                        details: {
                            type: 'array',
                            description: 'Detalles adicionales, usado normalmente en errores de validación',
                            items: {
                                type: 'string'
                            },
                            example: [
                                'El email es requerido',
                                'Formato de email inválido'
                            ]
                        }
                    },
                    required: ['error']
                },

                // 400 - Error de validación
                Error400Validation: {
                    allOf: [
                        { $ref: '#/components/schemas/ErrorResponse' },
                        {
                            type: 'object',
                            properties: {
                                error: {
                                    example: 'Error de validación'
                                },
                                details: {
                                    example: [
                                        'El email es requerido',
                                        'La contraseña es requerida'
                                    ]
                                }
                            }
                        }
                    ]
                },

                // 401 - No autorizado (login o token faltante)
                Error401Unauthorized: {
                    allOf: [
                        { $ref: '#/components/schemas/ErrorResponse' },
                        {
                            type: 'object',
                            properties: {
                                error: {
                                    example: 'Credenciales inválidas'
                                    // En endpoints protegidos también puede ser 'Token no proporcionado'
                                }
                            }
                        }
                    ]
                },

                // 403 - Prohibido (token inválido)
                Error403Forbidden: {
                    allOf: [
                        { $ref: '#/components/schemas/ErrorResponse' },
                        {
                            type: 'object',
                            properties: {
                                error: {
                                    example: 'Token inválido'
                                }
                            }
                        }
                    ]
                },

                // 404 - Recurso no encontrado
                Error404NotFound: {
                    allOf: [
                        { $ref: '#/components/schemas/ErrorResponse' },
                        {
                            type: 'object',
                            properties: {
                                error: {
                                    example: 'Usuario no encontrado'
                                    // Para rutas inexistentes será 'Ruta no encontrada'
                                }
                            }
                        }
                    ]
                },

                // 409 - Conflicto de recursos (email duplicado)
                Error409Conflict: {
                    allOf: [
                        { $ref: '#/components/schemas/ErrorResponse' },
                        {
                            type: 'object',
                            properties: {
                                error: {
                                    example: 'El email ya está registrado'
                                }
                            }
                        }
                    ]
                },

                // 500 - Error interno
                Error500Internal: {
                    allOf: [
                        { $ref: '#/components/schemas/ErrorResponse' },
                        {
                            type: 'object',
                            properties: {
                                error: {
                                    example: 'Error interno'
                                }
                            }
                        }
                    ]
                }
            }
        },
        tags: [
            {
                name: 'Auth',
                description: 'Endpoints de autenticación'
            },
            {
                name: 'Profile',
                description: 'Gestión del perfil del usuario autenticado'
            },
            {
                name: 'Devices',
                description: 'Suscripciones a dispositivos Lucía'
            },
            {
                name: 'Notifications',
                description: 'Gestión y stream de notificaciones'
            }
        ]
    },
    apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = swaggerDocs;
