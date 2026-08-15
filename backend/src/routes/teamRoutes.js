const express = require('express');
const router = express.Router({ mergeParams: true });
const teamController = require('../controllers/teamController');
const {
  assignTeamMemberValidator,
  updateTeamMemberValidator,
  teamIdParamValidator,
} = require('../validations/teamValidation');

router.post('/', assignTeamMemberValidator, teamController.assignTeamMember);

// Single GET /quotations/:quotationId/team/:teamId (0 = get all team members, >0 = get by teamId)
router
  .route('/:teamId')
  .get(teamIdParamValidator, teamController.getTeamMember)
  .put(updateTeamMemberValidator, teamController.updateTeamMember)
  .delete(teamIdParamValidator, teamController.removeTeamMember);

module.exports = router;
