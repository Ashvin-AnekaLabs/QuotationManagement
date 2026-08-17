const { Op } = require('sequelize');
const { BranchMaster, CompanyMaster } = require('../models');
const ApiError = require('../utils/ApiError');

class BranchMasterService {
  async _handleIsDefault(companyId, branchId = null) {
    // If a branch is set to default, unset isDefault for all other branches of this company
    const where = { companyId };
    if (branchId) {
      where.branchId = { [Op.ne]: branchId };
    }
    
    await BranchMaster.update(
      { isDefault: false },
      { where }
    );
  }

  async createBranch(branchData) {
    // Verify company exists and is active
    const company = await CompanyMaster.findByPk(branchData.companyId);
    if (!company || !company.isActive) {
        throw ApiError.badRequest('Invalid or inactive company ID');
    }

    // Check for duplicate branch name under the same company
    const existing = await BranchMaster.findOne({
      where: {
        companyId: branchData.companyId,
        branchName: branchData.branchName,
      },
    });

    if (existing) {
      throw ApiError.conflict(`Branch with name '${branchData.branchName}' already exists for this company`);
    }

    const branch = await BranchMaster.create(branchData);

    if (branch.isDefault) {
      await this._handleIsDefault(branch.companyId, branch.branchId);
    }

    return branch;
  }

  async getAllActiveBranches() {
    return await BranchMaster.findAll({
        where: { isActive: true },
        include: [{ model: CompanyMaster, as: 'company', attributes: ['companyName'] }],
        order: [['branchName', 'ASC']]
    });
  }

  async getBranchesByCompanyId(companyId) {
    return await BranchMaster.findAll({
        where: { companyId, isActive: true },
        order: [['branchName', 'ASC']]
    });
  }

  async getBranchById(id) {
    const branch = await BranchMaster.findByPk(id, {
        include: [{ model: CompanyMaster, as: 'company', attributes: ['companyName'] }]
    });
    if (!branch) {
      throw ApiError.notFound(`Branch with ID ${id} not found`);
    }
    return branch;
  }

  async updateBranch(id, branchData) {
    const branch = await this.getBranchById(id);

    if (branchData.companyId && branchData.companyId !== branch.companyId) {
        const company = await CompanyMaster.findByPk(branchData.companyId);
        if (!company || !company.isActive) {
            throw ApiError.badRequest('Invalid or inactive company ID');
        }
    }

    const checkCompanyId = branchData.companyId || branch.companyId;
    const checkBranchName = branchData.branchName || branch.branchName;

    if (branchData.branchName && branchData.branchName !== branch.branchName) {
      const existing = await BranchMaster.findOne({
        where: {
          companyId: checkCompanyId,
          branchName: checkBranchName,
          branchId: { [Op.ne]: id },
        },
      });
      if (existing) {
        throw ApiError.conflict(`Another branch with name '${checkBranchName}' already exists for this company`);
      }
    }

    const updatedBranch = await branch.update(branchData);

    if (branchData.isDefault === true) {
      await this._handleIsDefault(updatedBranch.companyId, updatedBranch.branchId);
    }

    return updatedBranch;
  }

  async deleteBranch(id) {
    const branch = await this.getBranchById(id);
    return await branch.update({
      isActive: false,
    });
  }
}

module.exports = new BranchMasterService();
