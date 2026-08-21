const { Op } = require('sequelize');
const { TaxMaster } = require('../models');
const ApiError = require('../utils/ApiError');

class TaxMasterService {
  async createTax(taxData, userId = null) {
    // Prevent duplicate tax definitions where name, type, and rate are the same
    const existing = await TaxMaster.findOne({
      where: {
        taxName: taxData.taxName,
        taxType: taxData.taxType,
        taxRate: taxData.taxRate,
      },
    });

    if (existing) {
      throw ApiError.conflict(`Tax definition with name '${taxData.taxName}', type '${taxData.taxType}', and rate ${taxData.taxRate}% already exists`);
    }

    return await TaxMaster.create({
      ...taxData,
      createdBy: userId,
      updatedBy: userId,
    });
  }

  async getTaxes(queryParams) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};

    if (queryParams.status !== undefined) {
      where.status = queryParams.status === 'true';
    }

    if (queryParams.taxType) {
      where.taxType = queryParams.taxType;
    }

    if (queryParams.search) {
      where.taxName = { [Op.iLike]: `%${queryParams.search}%` };
    }

    const { rows, count } = await TaxMaster.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getTaxById(id) {
    const tax = await TaxMaster.findByPk(id);
    if (!tax) {
      throw ApiError.notFound(`Tax master record with ID ${id} not found`);
    }
    return tax;
  }

  async updateTax(id, taxData, userId = null) {
    const tax = await this.getTaxById(id);

    // If updating name, type, and rate, check duplication
    const checkName = taxData.taxName || tax.taxName;
    const checkType = taxData.taxType || tax.taxType;
    const checkRate = taxData.taxRate !== undefined ? taxData.taxRate : tax.taxRate;

    if (taxData.taxName || taxData.taxType || taxData.taxRate !== undefined) {
      const existing = await TaxMaster.findOne({
        where: {
          taxName: checkName,
          taxType: checkType,
          taxRate: checkRate,
          id: { [Op.ne]: id },
        },
      });
      if (existing) {
        throw ApiError.conflict('Another tax definition with same name, type, and rate already exists');
      }
    }

    return await tax.update({
      ...taxData,
      updatedBy: userId,
    });
  }

  async deleteTax(id, userId = null) {
    const tax = await this.getTaxById(id);
    await tax.destroy();
    return tax;
  }
}

module.exports = new TaxMasterService();
