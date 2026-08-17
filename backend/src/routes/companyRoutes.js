const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyMaster.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const { 
  createCompanyValidator, 
  updateCompanyValidator, 
  idParamValidator 
} = require('../validations/companyValidation');

router.use(authMiddleware);

router.get('/:id', idParamValidator, companyController.getCompanies);

router.post(
  '/', 
  authorizeRoles('Admin'), 
  createCompanyValidator, 
  companyController.createCompany
);

router.put(
  '/:id', 
  authorizeRoles('Admin'), 
  updateCompanyValidator, 
  companyController.updateCompany
);

router.delete(
  '/:id', 
  authorizeRoles('Admin'), 
  idParamValidator, 
  companyController.deleteCompany
);

module.exports = router;
