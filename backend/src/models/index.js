const sequelize = require('../config/sequelize');
const TaxMaster = require('./taxMaster.model');
const DropdownMaster = require('./dropdownMaster.model');
const DropdownOption = require('./dropdownOption.model');

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

module.exports = {
  sequelize,
  TaxMaster,
  DropdownMaster,
  DropdownOption,
};
