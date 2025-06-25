// routes/reportRoutes.js
const router = require('express').Router();
const {
  getInventoryReports,
  createSnapshot,
} = require('../controllers/reportController');

// GET  /api/reports
router.get('/', getInventoryReports);

// POST /api/reports/snapshot
router.post('/snapshot', createSnapshot);

module.exports = router;
