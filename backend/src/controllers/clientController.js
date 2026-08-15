const clientService = require('../services/clientService');
const asyncWrapper = require('../helpers/asyncWrapper');
const ApiResponse = require('../utils/ApiResponse');
const HTTP_STATUS = require('../constants/statusCodes');

const createClient = asyncWrapper(async (req, res) => {
  const client = await clientService.createClient(req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, client, 'Client created successfully'));
});

/**
 * Single GET endpoint for Clients
 * If id == 0: returns all clients
 * If id > 0: returns client by specific ID
 */
const getClient = asyncWrapper(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id === 0) {
    const result = await clientService.getAllClients(req.query);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, result, 'Clients fetched successfully'));
  }
  const client = await clientService.getClientById(id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, client, 'Client details fetched successfully'));
});

const updateClient = asyncWrapper(async (req, res) => {
  const client = await clientService.updateClient(req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, client, 'Client updated successfully'));
});

const deleteClient = asyncWrapper(async (req, res) => {
  const client = await clientService.deleteClient(req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, client, 'Client deleted successfully'));
});

module.exports = {
  createClient,
  getClient,
  updateClient,
  deleteClient,
};
