const express = require('express');
const router = express.Router();
const taxMasterController = require('../controllers/taxMaster.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const { createTaxValidator, updateTaxValidator } = require('../validators/taxMaster.validator');

router.post('/tax-masters', authMiddleware, authorizeRoles('Admin'), createTaxValidator, taxMasterController.createTax);
router.get('/tax-masters', authMiddleware, taxMasterController.getTaxes);
router.get('/tax-masters/:id', authMiddleware, taxMasterController.getTaxById);
router.put('/tax-masters/:id', authMiddleware, authorizeRoles('Admin'), updateTaxValidator, taxMasterController.updateTax);
router.delete('/tax-masters/:id', authMiddleware, authorizeRoles('Admin'), taxMasterController.deleteTax);

module.exports = router;
