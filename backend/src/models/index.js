const sequelize = require('../config/sequelize');
const TaxMaster = require('./taxMaster.model');
const DropdownMaster = require('./dropdownMaster.model');
const DropdownOption = require('./dropdownOption.model');
const CompanyMaster = require('./companyMaster.model');
const BranchMaster = require('./branchMaster.model');

// Define Relationships
DropdownMaster.hasMany(DropdownOption, {
  foreignKey: 'dropdownMasterId',
  as: 'options',
  onDelete: 'CASCADE',
});

DropdownOption.belongsTo(DropdownMaster, {
  foreignKey: 'dropdownMasterId',
  as: 'dropdown',
});

CompanyMaster.hasMany(BranchMaster, {
  foreignKey: 'companyId',
  as: 'branches',
  onDelete: 'CASCADE',
});

BranchMaster.belongsTo(CompanyMaster, {
  foreignKey: 'companyId',
  as: 'company',
});

module.exports = {
  sequelize,
  TaxMaster,
  DropdownMaster,
  DropdownOption,
  CompanyMaster,
  BranchMaster,
};
