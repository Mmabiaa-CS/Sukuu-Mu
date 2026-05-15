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
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string', enum: ['admin', 'teacher', 'student'] },
                        is_active: { type: 'integer', enum: [0, 1] }
                    }
                },
                Student: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        student_code: { type: 'string', example: 'SMS-2025-0001' },
                        first_name: { type: 'string' },
                        last_name: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                        date_of_birth: { type: 'string', format: 'date' },
                        gender: { type: 'string', enum: ['male', 'female', 'other'] },
                        enrollment_date: { type: 'string', format: 'date' },
                        class_name: { type: 'string' },
                        is_active: { type: 'integer' }
                    }
                },
                Class: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        total_students: { type: 'integer' }
                    }
                },
                Subject: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        code: { type: 'string' },
                        description: { type: 'string' }
                    }
                },
                Teacher: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        employee_id: { type: 'string' },
                        first_name: { type: 'string' },
                        last_name: { type: 'string' },
                        email: { type: 'string' },
                        qualification: { type: 'string' }
                    }
                },
                Parent: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        first_name: { type: 'string' },
                        last_name: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                        occupation: { type: 'string' }
                    }
                },
                FeeStructure: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        total_fee: { type: 'number' },
                        academic_year: { type: 'string' },
                        term: { type: 'string' }
                    }
                },
                FeePayment: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        amount_paid: { type: 'number' },
                        payment_date: { type: 'string', format: 'date-time' },
                        payment_method: { type: 'string', enum: ['cash', 'bank_transfer', 'mobile_money', 'cheque', 'other'] },
                        reference: { type: 'string' }
                    }
                },
                Attendance: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        student_id: { type: 'integer' },
                        class_id: { type: 'integer' },
                        date: { type: 'string', format: 'date' },
                        status: { type: 'string', enum: ['present', 'absent', 'late'] },
                        remarks: { type: 'string' },
                        recorded_at: { type: 'string', format: 'date-time' }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        token: { type: 'string' },
                        user: { $ref: '#/components/schemas/User' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', default: false },
                        message: { type: 'string' }
                    }
                }
            }
        },
        tags: [
            { name: 'Auth', description: 'Authentication and user management' },
            { name: 'Teachers', description: 'Teacher management and assignments' },
            { name: 'Students', description: 'Student management and enrollments' },
            { name: 'Classes', description: 'Class and room management' },
            { name: 'Subjects', description: 'Subject registry' },
            { name: 'Parents', description: 'Parent tracking module' },
            { name: 'Attendance', description: 'Daily attendance logs' },
            { name: 'Fees', description: 'School fee structures and payments' }
        ],
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
