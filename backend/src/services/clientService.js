const clientRepository = require('../repositories/clientRepository');
const ApiError = require('../utils/ApiError');

class ClientService {
  async createClient(clientData) {
    const existing = await clientRepository.findByEmail(clientData.email);
    if (existing) {
      throw ApiError.conflict(`Client with email '${clientData.email}' already exists`);
    }
    return await clientRepository.create(clientData);
  }

  async getAllClients(queryParams) {
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const { clients, total } = await clientRepository.findAll({ limit, offset });
    return {
      clients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getClientById(id) {
    const client = await clientRepository.findById(id);
    if (!client) {
      throw ApiError.notFound(`Client with ID ${id} not found`);
    }
    return client;
  }

  async updateClient(id, updateData) {
    await this.getClientById(id);

    if (updateData.email) {
      const existing = await clientRepository.findByEmail(updateData.email);
      if (existing && existing.id !== parseInt(id, 10)) {
        throw ApiError.conflict(`Email '${updateData.email}' is already in use by another client`);
      }
    }

    return await clientRepository.update(id, updateData);
  }

  async deleteClient(id) {
    await this.getClientById(id);
    return await clientRepository.delete(id);
  }
}

module.exports = new ClientService();
