const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const CompanyMaster = sequelize.define('CompanyMaster', {
  companyId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  companyName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  pan: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  gstin: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
}, {
  tableName: 'tblCompanyMaster',
  timestamps: true, // Adds createdAt and updatedAt
});

module.exports = CompanyMaster;
