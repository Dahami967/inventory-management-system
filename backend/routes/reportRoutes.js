const express = require('express');
const router = express.Router();
const { getInventoryReports, createSnapshot } = require('../controllers/reportController');

// Get reports
router.get('/', getInventoryReports);

// Create snapshot
router.post('/snapshot', createSnapshot);

module.exports = router;
