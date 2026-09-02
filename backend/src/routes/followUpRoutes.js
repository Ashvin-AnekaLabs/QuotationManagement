const express = require('express');
const router = express.Router({ mergeParams: true });
const followUpController = require('../controllers/followUpController');

// All routes here are mounted at /api/quotations/:quotationId/follow-ups
// or /api/quotations/:quotationId/status depending on index.js logic.
// We will mount this specific router at /api/quotations/:quotationId

router.post('/follow-ups', followUpController.addFollowUp);
router.get('/follow-ups', followUpController.getFollowUps);
router.put('/status', followUpController.updateQuotationStatus);

module.exports = router;
