const teamService = require('../services/teamService');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

const assignTeamMember = asyncWrapper(async (req, res) => {
  const member = await teamService.assignTeamMember(req.params.quotationId, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, member, 'Team member assigned successfully'));
});

/**
 * Single GET endpoint for Team Assignment
 * If teamId == 0: returns all team members assigned to quotation
 * If teamId > 0: returns specific team member assignment by teamId
 */
const getTeamMember = asyncWrapper(async (req, res) => {
  const quotationId = parseInt(req.params.quotationId, 10);
  const teamId = parseInt(req.params.teamId, 10);

  if (teamId === 0) {
    const team = await teamService.getTeamByQuotationId(quotationId);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, team, 'Team members fetched successfully'));
  }

  const member = await teamService.getTeamMemberById(teamId);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, member, 'Team assignment fetched successfully'));
});

const updateTeamMember = asyncWrapper(async (req, res) => {
  const member = await teamService.updateTeamMember(req.params.teamId, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, member, 'Team assignment updated successfully'));
});

const removeTeamMember = asyncWrapper(async (req, res) => {
  const member = await teamService.removeTeamMember(req.params.teamId);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, member, 'Team member removed successfully'));
});

module.exports = {
  assignTeamMember,
  getTeamMember,
  updateTeamMember,
  removeTeamMember,
};
