const express = require('express');
const router = express.Router({ mergeParams: true });
const milestoneController = require('../controllers/milestoneController');
const {
  createMilestoneValidator,
  updateMilestoneValidator,
  bulkMilestoneValidator,
  idParamValidator,
} = require('../validations/milestoneValidation');

router.post('/', createMilestoneValidator, milestoneController.createMilestone);
router.get('/', milestoneController.getMilestonesByQuotation);
router.post('/bulk', bulkMilestoneValidator, milestoneController.bulkSaveMilestones);

router
  .route('/:id')
  .put(updateMilestoneValidator, milestoneController.updateMilestone)
  .delete(idParamValidator, milestoneController.deleteMilestone);

module.exports = router;
