const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const DropdownOption = sequelize.define('DropdownOption', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  dropdownMasterId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  optionLabel: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  optionValue: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'tblDropdownOptions',
  timestamps: true,
});

module.exports = DropdownOption;
