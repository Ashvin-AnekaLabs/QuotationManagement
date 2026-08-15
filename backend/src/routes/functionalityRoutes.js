const express = require('express');
const router = express.Router({ mergeParams: true });
const functionalityController = require('../controllers/functionalityController');
const {
  createFunctionalityValidator,
  updateFunctionalityValidator,
  idParamValidator,
} = require('../validations/functionalityValidation');

router.post('/', createFunctionalityValidator, functionalityController.createFunctionality);

// Single GET /functionalities/:id or /scopes/:scopeId/functionalities/:id (0 = get all, >0 = get by ID)
router
  .route('/:id')
  .get(idParamValidator, functionalityController.getFunctionality)
  .put(updateFunctionalityValidator, functionalityController.updateFunctionality)
  .delete(idParamValidator, functionalityController.deleteFunctionality);

module.exports = router;
