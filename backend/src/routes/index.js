const express = require('express');
const router = express.Router();

const dashboardRoutes = require('./dashboardRoutes');
const clientRoutes = require('./clientRoutes');
const employeeRoutes = require('./employeeRoutes');
const quotationRoutes = require('./quotationRoutes');
const scopeRoutes = require('./scopeRoutes');
const functionalityRoutes = require('./functionalityRoutes');
const milestoneRoutes = require('./milestoneRoutes');
const reportRoutes = require('./reportRoutes');
const authRoutes = require('./authRoutes');

// Mount Resource Routers
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/clients', clientRoutes);
router.use('/employees', employeeRoutes);
router.use('/quotations', quotationRoutes);
router.use('/scopes', scopeRoutes);
router.use('/functionalities', functionalityRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/reports', reportRoutes);

module.exports = router;

