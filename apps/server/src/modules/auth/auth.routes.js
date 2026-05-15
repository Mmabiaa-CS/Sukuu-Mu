'use strict';

const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// ── Public ─────────────────────────────────────────────────────────────────
router.post('/login',    authController.login);
router.post('/register', authController.register);

// ── Protected ──────────────────────────────────────────────────────────────
router.get('/me',                authenticate, authController.getMe);
router.patch('/change-password', authenticate, authController.changePassword);
router.get('/users', authenticate, authorize('admin'), authController.getAllUsers);

module.exports = router;