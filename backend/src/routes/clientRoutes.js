const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const {
  createClientValidator,
  updateClientValidator,
  idParamValidator,
} = require('../validations/clientValidation');

router.post('/', createClientValidator, clientController.createClient);

// Single GET /clients/:id (0 = get all, >0 = get by ID)
router
  .route('/:id')
  .get(idParamValidator, clientController.getClient)
  .put(updateClientValidator, clientController.updateClient)
  .delete(idParamValidator, clientController.deleteClient);

module.exports = router;
