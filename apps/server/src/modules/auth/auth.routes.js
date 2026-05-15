'use strict';

const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// ── Public ─────────────────────────────────────────────────────────────────
/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@school.com }
 *               password: { type: string, example: password123 }
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role_name: { type: string, enum: [admin, teacher, student], default: student }
 */
router.post('/register', authController.register);

// ── Protected ──────────────────────────────────────────────────────────────
/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get currently logged-in user profile
 *     security: [{ bearerAuth: [] }]
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @openapi
 * /auth/change-password:
 *   patch:
 *     tags: [Auth]
 *     summary: Change own password
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/change-password', authenticate, authController.changePassword);

/**
 * @openapi
 * /auth/users:
 *   get:
 *     tags: [Auth]
 *     summary: Get all registered system users
 *     security: [{ bearerAuth: [] }]
 */
router.get('/users', authenticate, authorize('admin'), authController.getAllUsers);

module.exports = router;