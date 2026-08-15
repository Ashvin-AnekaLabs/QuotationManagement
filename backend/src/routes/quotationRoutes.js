const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const {
  createQuotationValidator,
  updateQuotationValidator,
  idParamValidator,
} = require('../validations/quotationValidation');

// Sub-routers for nested resources
const scopeRoutes = require('./scopeRoutes');
const teamRoutes = require('./teamRoutes');
const milestoneRoutes = require('./milestoneRoutes');

// Summary Route
router.get('/:id/summary', idParamValidator, quotationController.getQuotationSummary);



// Commercial Details Routes (Step 6)
router.route('/:id/commercial')
  .get(idParamValidator, quotationController.getCommercial)
  .put(idParamValidator, quotationController.updateCommercial);

// Quotation PDF Download Routes
router.get('/:id/download', idParamValidator, quotationController.exportQuotationPdf);
router.get('/:id/pdf', idParamValidator, quotationController.exportQuotationPdf);

// Quotation Timeline Excel Download Route (Single API)
router.get('/:id/timeline/excel', idParamValidator, quotationController.exportTimelineExcel);

router.post('/', createQuotationValidator, quotationController.createQuotation);

// Single GET /quotations/:id (0 = get all, >0 = get by ID)
router
  .route('/:id')
  .get(idParamValidator, quotationController.getQuotation)
  .put(updateQuotationValidator, quotationController.updateQuotation)
  .delete(idParamValidator, quotationController.deleteQuotation);

// Nested resource mounting
router.use('/:quotationId/scopes', scopeRoutes);
router.use('/:quotationId/team', teamRoutes);
router.use('/:quotationId/milestones', milestoneRoutes);

module.exports = router;

