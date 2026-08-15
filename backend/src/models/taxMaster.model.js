const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const TaxMaster = sequelize.define('TaxMaster', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  taxName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  taxType: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0.00,
      max: 100.00,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
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
  tableName: 'tblTaxMaster',
  timestamps: true,
});

module.exports = TaxMaster;
