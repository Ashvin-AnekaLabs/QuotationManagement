const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { createUserValidator, updateUserValidator } = require('../validations/userValidation');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// Base middleware for entire /users route: Must be logged in, must be Admin or Manager
router.use(authMiddleware);
router.use(authorizeRoles('Admin', 'Manager'));

// GET /api/v1/users/managers (Must come before /:id)
router.get('/managers', userController.getManagersDropdown);

// GET /api/v1/users
router.get('/', userController.getUsers);

// POST /api/v1/users
router.post('/', createUserValidator, userController.createUser);

// PUT /api/v1/users/:id
router.put('/:id', updateUserValidator, userController.updateUser);

// DELETE /api/v1/users/:id
router.delete('/:id', userController.deleteUser);

module.exports = router;
