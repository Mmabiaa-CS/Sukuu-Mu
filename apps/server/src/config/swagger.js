'use strict';

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sukuu-Mu School Management System API',
            version: '1.0.0',
            description: 'Complete API Reference for Frontend Developers',
        },
        servers: [
            {
                url: 'http://localhost:3001/api/v1',
                description: 'Local development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/modules/**/*.routes.js', './src/modules/**/*.controller.js'], // paths to files containing documentation
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs,
};
