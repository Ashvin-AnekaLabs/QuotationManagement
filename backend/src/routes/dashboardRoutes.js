const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { getDashboardValidator } = require('../validations/dashboardValidation');

// GET /api/v1/dashboard
router.get('/', getDashboardValidator, dashboardController.getDashboard);

module.exports = router;
