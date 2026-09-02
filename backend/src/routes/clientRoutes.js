const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const {
  createClientValidator,
  updateClientValidator,
  idParamValidator,
} = require('../validations/clientValidation');

const authMiddleware = require('../middlewares/authMiddleware');
const authorizePermission = require('../middlewares/permissionMiddleware');

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

router.post('/', createClientValidator, authorizePermission('CLIENTS', 'can_add'), clientController.createClient);

// Single GET /clients/:id (0 = get all, >0 = get by ID)
router
  .route('/:id')
  .get(idParamValidator, authorizePermission('CLIENTS', 'can_view'), clientController.getClient)
  .put(updateClientValidator, authorizePermission('CLIENTS', 'can_edit'), clientController.updateClient)
  .delete(idParamValidator, authorizePermission('CLIENTS', 'can_delete'), clientController.deleteClient);

module.exports = router;
