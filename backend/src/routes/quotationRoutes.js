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

const authMiddleware = require('../middlewares/authMiddleware');
const authorizePermission = require('../middlewares/permissionMiddleware');

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

// Export Quotations Route (MUST be before /:id)
router.get('/export', authorizePermission('QUOTATIONS', 'can_export'), quotationController.exportQuotations);

// Summary Route
router.get('/:id/summary', idParamValidator, quotationController.getQuotationSummary);



// Commercial Details Routes (Step 6)
router.route('/:id/commercial')
  .get(idParamValidator, authorizePermission('QUOTATIONS', 'can_view'), quotationController.getCommercial)
  .put(idParamValidator, authorizePermission('QUOTATIONS', 'can_edit'), quotationController.updateCommercial);

// Quotation PDF Download Routes
router.get('/:id/download', idParamValidator, authorizePermission('QUOTATIONS', 'can_export'), quotationController.exportQuotationPdf);
router.get('/:id/pdf', idParamValidator, authorizePermission('QUOTATIONS', 'can_export'), quotationController.exportQuotationPdf);

// Quotation Timeline Excel Download Route (Single API)
router.get('/:id/timeline/excel', idParamValidator, authorizePermission('QUOTATIONS', 'can_export'), quotationController.exportTimelineExcel);

router.post('/', createQuotationValidator, authorizePermission('QUOTATIONS', 'can_add'), quotationController.createQuotation);

// Single GET /quotations/:id (0 = get all, >0 = get by ID)
router
  .route('/:id')
  .get(idParamValidator, authorizePermission('QUOTATIONS', 'can_view'), quotationController.getQuotation)
  .put(updateQuotationValidator, authorizePermission('QUOTATIONS', 'can_edit'), quotationController.updateQuotation)
  .delete(idParamValidator, authorizePermission('QUOTATIONS', 'can_delete'), quotationController.deleteQuotation);

// Nested resource mounting
router.use('/:quotationId/scopes', scopeRoutes);
router.use('/:quotationId/team', teamRoutes);
router.use('/:quotationId/milestones', milestoneRoutes);

const followUpRoutes = require('./followUpRoutes');

// Mount follow up routes
router.use('/:quotationId', followUpRoutes);

module.exports = router;

