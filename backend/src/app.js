const express = require('express');
const cors = require('cors');
const setupSwagger = require('./config/swagger');
const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFound');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Swagger UI Documentation Route
setupSwagger(app);

// Root & Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Quotation Management System API',
    swagger: '/api-docs',
    api_v1: '/api/v1',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Quotation Management API server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Main API Router Mounting
app.use('/api/v1', apiRoutes);

// Master Modules Mounting
const taxMasterRoutes = require('./routes/taxMaster.routes');
const dropdownMasterRoutes = require('./routes/dropdownMaster.routes');
app.use('/api', taxMasterRoutes);
app.use('/api', dropdownMasterRoutes);

// 404 Route Not Found Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
