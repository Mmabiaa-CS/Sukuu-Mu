'use strict';

const express = require('express');
const router = express.Router();

const classController = require('./class.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// All class routes require a valid token
router.use(authenticate);

/**
 * @openapi
 * /classes/search:
 *   get:
 *     tags: [Classes]
 *     summary: Search classes by name or description
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Success }
 */
router.get('/search', classController.searchClasses);

/**
 * @openapi
 * /classes:
 *   get:
 *     tags: [Classes]
 *     summary: Get all classes
 *     responses:
 *       200: { description: Success }
 */
router.get('/', classController.getAllClasses);

/**
 * @openapi
 * /classes/{id}:
 *   get:
 *     tags: [Classes]
 *     summary: Get class by ID with subjects and teachers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.get('/:id', classController.getClassById);

/**
 * @openapi
 * /classes/{id}/students:
 *   get:
 *     tags: [Classes]
 *     summary: List all students in a class
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.get('/:id/students', classController.getStudentsByClass);

router.post('/',
    authorize('admin'),
    classController.createClass
);

router.put('/:id',
    authorize('admin', 'teacher'),
    classController.updateClass
);

router.delete('/:id',
    authorize('admin'),
    classController.deleteClass
);

router.post('/:id/migrate',
    authorize('admin'),
    classController.migrateStudents
);

module.exports = router;