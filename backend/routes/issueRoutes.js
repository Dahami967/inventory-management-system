const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const auth = require('../middleware/auth');

// Issue an item
router.post('/', auth, issueController.issueItem);

// Get all issued items
router.get('/', auth, issueController.getIssuedItems);

module.exports = router;
