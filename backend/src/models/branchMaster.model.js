const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const CompanyMaster = require('./companyMaster.model');

const BranchMaster = sequelize.define('BranchMaster', {
  branchId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tblCompanyMaster',
      key: 'companyId',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  branchName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  addressLine1: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  addressLine2: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  pincode: {
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
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
}, {
  tableName: 'tblBranchMaster',
  timestamps: true, // Adds createdAt and updatedAt
});

module.exports = BranchMaster;
