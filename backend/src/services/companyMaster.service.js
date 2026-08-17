const { Op } = require('sequelize');
const { CompanyMaster } = require('../models');
const ApiError = require('../utils/ApiError');

class CompanyMasterService {
  async createCompany(companyData) {
    // Prevent duplicate company if we want to check by name or email
    if (companyData.companyName) {
      const existing = await CompanyMaster.findOne({
        where: {
          companyName: companyData.companyName,
        },
      });

      if (existing) {
        throw ApiError.conflict(`Company with name '${companyData.companyName}' already exists`);
      }
    }

    return await CompanyMaster.create(companyData);
  }

  async getCompanies(queryParams) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};

    if (queryParams.isActive !== undefined) {
      where.isActive = queryParams.isActive === 'true';
    } else {
      // By default, maybe only fetch active ones unless specified?
      // Or just fetch all. Let's fetch all active by default if not specified.
      // Wait, the prompt says GET /api/companies/0 -> Get all active companies.
      // So if the user hits /api/companies/0 we can set query params from the controller or just handle it here.
      // We will handle id=0 in controller and call this without pagination maybe.
    }

    if (queryParams.search) {
      where.companyName = { [Op.iLike]: `%${queryParams.search}%` };
    }

    const { rows, count } = await CompanyMaster.findAndCountAll({
      where,
      limit: queryParams.fetchAll ? undefined : limit,
      offset: queryParams.fetchAll ? undefined : offset,
      order: [['createdAt', 'DESC']],
    });

    if (queryParams.fetchAll) {
        return rows;
    }

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

  async getAllActiveCompanies() {
      return await CompanyMaster.findAll({
          where: { isActive: true },
          order: [['companyName', 'ASC']]
      });
  }

  async getCompanyById(id) {
    const company = await CompanyMaster.findByPk(id);
    if (!company) {
      throw ApiError.notFound(`Company with ID ${id} not found`);
    }
    return company;
  }

  async updateCompany(id, companyData) {
    const company = await this.getCompanyById(id);

    if (companyData.companyName && companyData.companyName !== company.companyName) {
      const existing = await CompanyMaster.findOne({
        where: {
          companyName: companyData.companyName,
          companyId: { [Op.ne]: id },
        },
      });
      if (existing) {
        throw ApiError.conflict(`Another company with name '${companyData.companyName}' already exists`);
      }
    }

    return await company.update(companyData);
  }

  async deleteCompany(id) {
    const company = await this.getCompanyById(id);
    // Soft delete
    return await company.update({
      isActive: false,
    });
  }
}

module.exports = new CompanyMasterService();
