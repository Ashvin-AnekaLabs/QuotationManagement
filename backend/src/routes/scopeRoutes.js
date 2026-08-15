const express = require('express');
const router = express.Router({ mergeParams: true });
const scopeController = require('../controllers/scopeController');
const {
  createScopeValidator,
  updateScopeValidator,
  idParamValidator,
} = require('../validations/scopeValidation');

const functionalityRoutes = require('./functionalityRoutes');

router.post('/', createScopeValidator, scopeController.createScope);
router.put('/sync', scopeController.syncModules);
router.get('/tree', scopeController.getModulesTree);

// Single GET /scopes/:id or /quotations/:quotationId/scopes/:id (0 = get all, >0 = get by ID)
router
  .route('/:id')
  .get(idParamValidator, scopeController.getScope)
  .put(updateScopeValidator, scopeController.updateScope)
  .delete(idParamValidator, scopeController.deleteScope);

router.use('/:scopeId/functionalities', functionalityRoutes);

module.exports = router;
