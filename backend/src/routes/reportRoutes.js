const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { dashboardReportValidator, exportReportValidator } = require('../validations/reportValidation');

// GET /api/v1/reports/dashboard endpoint
router.get('/dashboard', dashboardReportValidator, reportController.getDashboardReport);

// GET /api/v1/reports/export endpoint (format = pdf | excel)
router.get('/export', exportReportValidator, reportController.exportReport);

module.exports = router;
