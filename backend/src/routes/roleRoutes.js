const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

router.get('/', authorizeRoles('Admin', 'Manager'), roleController.getRoles);
router.get('/:id/privileges', authorizeRoles('Admin'), roleController.getRolePrivileges);
router.get('/:id/users', authorizeRoles('Admin'), roleController.getRoleUsers);
router.put('/:id/privileges', authorizeRoles('Admin'), roleController.updateRolePrivileges);

module.exports = router;
