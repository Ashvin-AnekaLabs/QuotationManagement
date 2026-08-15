const express = require('express');
const router = express.Router();
const dropdownMasterController = require('../controllers/dropdownMaster.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const {
  createDropdownValidator,
  updateDropdownValidator,
  createOptionValidator,
  updateOptionValidator,
} = require('../validators/dropdownMaster.validator');

// Dropdown Master CRUD
router.post('/dropdown-masters', authMiddleware, authorizeRoles('Admin'), createDropdownValidator, dropdownMasterController.createDropdown);
router.get('/dropdown-masters', authMiddleware, dropdownMasterController.getDropdowns);
router.get('/dropdown-masters/:id', authMiddleware, dropdownMasterController.getDropdownById);
router.put('/dropdown-masters/:id', authMiddleware, authorizeRoles('Admin'), updateDropdownValidator, dropdownMasterController.updateDropdown);
router.delete('/dropdown-masters/:id', authMiddleware, authorizeRoles('Admin'), dropdownMasterController.deleteDropdown);

// Dropdown Options CRUD
router.post('/dropdown-masters/:dropdownMasterId/options', authMiddleware, authorizeRoles('Admin'), createOptionValidator, dropdownMasterController.addOption);
router.get('/dropdown-masters/:dropdownMasterId/options', authMiddleware, dropdownMasterController.getOptionsByDropdownId);
router.put('/dropdown-options/:optionId', authMiddleware, authorizeRoles('Admin'), updateOptionValidator, dropdownMasterController.updateOption);
router.delete('/dropdown-options/:optionId', authMiddleware, authorizeRoles('Admin'), dropdownMasterController.deleteOption);

module.exports = router;
