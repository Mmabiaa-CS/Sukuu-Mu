'use strict';

const express = require('express');
const router = express.Router();

const classController = require('./class.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// All class routes require a valid token
router.use(authenticate);

router.get('/search', classController.searchClasses);    // 👈 before /:id
router.get('/', classController.getAllClasses);
router.get('/:id', classController.getClassById);
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