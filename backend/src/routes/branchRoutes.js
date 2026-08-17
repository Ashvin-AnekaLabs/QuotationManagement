const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchMaster.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const { 
  createBranchValidator, 
  updateBranchValidator, 
  idParamValidator,
  companyIdParamValidator
} = require('../validations/branchValidation');

router.use(authMiddleware);

router.get('/company/:companyId', companyIdParamValidator, branchController.getBranchesByCompany);
router.get('/:id', idParamValidator, branchController.getBranches);

router.post(
  '/', 
  authorizeRoles('Admin'), 
  createBranchValidator, 
  branchController.createBranch
);

router.put(
  '/:id', 
  authorizeRoles('Admin'), 
  updateBranchValidator, 
  branchController.updateBranch
);

router.delete(
  '/:id', 
  authorizeRoles('Admin'), 
  idParamValidator, 
  branchController.deleteBranch
);

module.exports = router;
