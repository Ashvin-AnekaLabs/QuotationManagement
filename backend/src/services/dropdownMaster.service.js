const { Op } = require('sequelize');
const { sequelize, DropdownMaster, DropdownOption } = require('../models');
const ApiError = require('../utils/ApiError');

class DropdownMasterService {
  async createDropdown(dropdownData, userId = null) {
    const existing = await DropdownMaster.findOne({
      where: { dropdownName: dropdownData.dropdownName },
    });
    if (existing) {
      throw ApiError.conflict(`Dropdown Master with name '${dropdownData.dropdownName}' already exists`);
    }

    const transaction = await sequelize.transaction();
    try {
      // 1. Create Dropdown Master
      const master = await DropdownMaster.create({
        dropdownName: dropdownData.dropdownName,
        description: dropdownData.description,
        status: dropdownData.status !== undefined ? dropdownData.status : true,
        createdBy: userId,
        updatedBy: userId,
      }, { transaction });

      // 2. Create Options
      if (dropdownData.options && dropdownData.options.length > 0) {
        const optionsToCreate = dropdownData.options.map((opt, index) => ({
          dropdownMasterId: master.id,
          optionLabel: opt.optionLabel,
          optionValue: opt.optionValue,
          displayOrder: opt.displayOrder !== undefined ? opt.displayOrder : index + 1,
          status: opt.status !== undefined ? opt.status : true,
          createdBy: userId,
          updatedBy: userId,
        }));
        await DropdownOption.bulkCreate(optionsToCreate, { transaction });
      }

      await transaction.commit();

      // Return complete created record
      return await this.getDropdownById(master.id);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async getDropdowns(queryParams) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};

    if (queryParams.status !== undefined) {
      where.status = queryParams.status === 'true';
    }

    if (queryParams.search) {
      where.dropdownName = { [Op.iLike]: `%${queryParams.search}%` };
    }

    // Retrieve dropdown masters and calculate totalOptions using Sequelize include or count
    const { rows, count } = await DropdownMaster.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
      include: [{
        model: DropdownOption,
        as: 'options',
        attributes: ['id'],
      }],
    });

    const data = rows.map((row) => {
      const plain = row.get({ plain: true });
      return {
        id: plain.id,
        dropdownName: plain.dropdownName,
        description: plain.description,
        totalOptions: plain.options ? plain.options.length : 0,
        status: plain.status,
        createdAt: plain.createdAt,
      };
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getDropdownById(id) {
    const dropdown = await DropdownMaster.findByPk(id, {
      include: [{
        model: DropdownOption,
        as: 'options',
        order: [['displayOrder', 'ASC']],
      }],
    });

    if (!dropdown) {
      throw ApiError.notFound(`Dropdown master with ID ${id} not found`);
    }

    return dropdown;
  }

  async updateDropdown(id, updateData, userId = null) {
    const master = await this.getDropdownById(id);

    // Uniqueness check if updating name
    if (updateData.dropdownName && updateData.dropdownName !== master.dropdownName) {
      const existing = await DropdownMaster.findOne({
        where: { dropdownName: updateData.dropdownName, id: { [Op.ne]: id } },
      });
      if (existing) {
        throw ApiError.conflict(`Dropdown Master with name '${updateData.dropdownName}' already exists`);
      }
    }

    const transaction = await sequelize.transaction();
    try {
      // 1. Update Master
      await master.update({
        dropdownName: updateData.dropdownName || master.dropdownName,
        description: updateData.description !== undefined ? updateData.description : master.description,
        status: updateData.status !== undefined ? updateData.status : master.status,
        updatedBy: userId,
      }, { transaction });

      // 2. Synchronize Options if provided
      if (updateData.options) {
        const requestOptions = updateData.options;
        const existingOptions = await DropdownOption.findAll({
          where: { dropdownMasterId: id },
        });

        const existingIds = existingOptions.map(o => o.id);
        const requestIds = requestOptions.filter(o => o.id).map(o => o.id);

        // Delete/Deactivate options no longer present in request
        const idsToDelete = existingIds.filter(eid => !requestIds.includes(eid));
        if (idsToDelete.length > 0) {
          await DropdownOption.destroy({
            where: { id: idsToDelete },
            transaction,
          });
        }

        // Add or Update remaining options
        for (let i = 0; i < requestOptions.length; i++) {
          const opt = requestOptions[i];
          const displayOrder = opt.displayOrder !== undefined ? opt.displayOrder : i + 1;

          if (opt.id && existingIds.includes(opt.id)) {
            // Update
            await DropdownOption.update({
              optionLabel: opt.optionLabel,
              optionValue: opt.optionValue,
              displayOrder,
              status: opt.status !== undefined ? opt.status : true,
              updatedBy: userId,
            }, {
              where: { id: opt.id },
              transaction,
            });
          } else {
            // Add
            await DropdownOption.create({
              dropdownMasterId: id,
              optionLabel: opt.optionLabel,
              optionValue: opt.optionValue,
              displayOrder,
              status: opt.status !== undefined ? opt.status : true,
              createdBy: userId,
              updatedBy: userId,
            }, { transaction });
          }
        }
      }

      await transaction.commit();
      return await this.getDropdownById(id);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async deleteDropdown(id, userId = null) {
    const dropdown = await this.getDropdownById(id);

    const transaction = await sequelize.transaction();
    try {
      // Hard delete child options first, then the master record
      await DropdownOption.destroy({ where: { dropdownMasterId: id }, transaction });
      await dropdown.destroy({ transaction });
      
      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async getOptionsByDropdownId(dropdownMasterId) {
    await this.getDropdownById(dropdownMasterId);
    return await DropdownOption.findAll({
      where: { dropdownMasterId },
      order: [['displayOrder', 'ASC']],
    });
  }

  async addOption(dropdownMasterId, optionData, userId = null) {
    await this.getDropdownById(dropdownMasterId);
    return await DropdownOption.create({
      ...optionData,
      dropdownMasterId,
      createdBy: userId,
      updatedBy: userId,
    });
  }

  async updateOption(optionId, optionData, userId = null) {
    const option = await DropdownOption.findByPk(optionId);
    if (!option) {
      throw ApiError.notFound(`Dropdown Option with ID ${optionId} not found`);
    }
    return await option.update({
      ...optionData,
      updatedBy: userId,
    });
  }

  async deleteOption(optionId, userId = null) {
    const option = await DropdownOption.findByPk(optionId);
    if (!option) {
      throw ApiError.notFound(`Dropdown Option with ID ${optionId} not found`);
    }
    // Soft deactivation
    return await option.update({
      status: false,
      updatedBy: userId,
    });
  }
}

module.exports = new DropdownMasterService();
