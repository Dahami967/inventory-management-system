const express = require('express');
const router = express.Router();
const {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    searchItems,
    getLowStockItems,
    updateStock
} = require('../controllers/itemController');

// Get all items and search
router.get('/', getItems);
router.get('/search', searchItems);
router.get('/low-stock', getLowStockItems);
// Stock summary (sum of quantities for each item name)
const { getStockSummary } = require('../controllers/itemController');
router.get('/stock-summary', getStockSummary);

// CRUD operations
router.get('/:id', getItem);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

// Stock management
router.put('/:id/stock', updateStock);

module.exports = router;