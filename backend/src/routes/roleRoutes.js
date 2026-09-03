const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// Apply auth middleware and Admin authorization to all routes in this file
router.use(authMiddleware);
router.use(authorizeRoles('Admin'));

router.get('/', roleController.getRoles);
router.get('/:id/privileges', roleController.getRolePrivileges);
router.get('/:id/users', roleController.getRoleUsers);
router.put('/:id/privileges', roleController.updateRolePrivileges);

module.exports = router;
