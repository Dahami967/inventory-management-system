// Get stock summary (sum of quantity for each item name)
exports.getStockSummary = async (req, res) => {
    try {
        const summary = await Item.getStockSummary();
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const Item = require('../models/Item');

// Get all items
exports.getItems = async (req, res) => {
    try {
        const items = await Item.findAll();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single item
exports.getItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new item
exports.createItem = async (req, res) => {
    try {
        const { itemName, category, unitPrice, quantity, minimumStock, supplier, purchaseDate } = req.body;

        // Validate required fields
        if (!itemName || !category || !unitPrice || quantity === undefined || !minimumStock || !supplier || !purchaseDate) {
            return res.status(400).json({
                message: 'Missing required fields. Please provide: itemName, category, unitPrice, quantity, minimumStock, supplier, and purchaseDate'
            });
        }


        // Duplicate item names are allowed

        // Validate numeric fields
        if (isNaN(unitPrice) || unitPrice <= 0) {
            return res.status(400).json({
                message: 'Unit price must be a positive number'
            });
        }

        if (isNaN(quantity) || quantity < 0) {
            return res.status(400).json({
                message: 'Quantity must be zero or greater'
            });
        }

        if (isNaN(minimumStock) || minimumStock < 0) {
            return res.status(400).json({
                message: 'Minimum stock must be zero or greater'
            });
        }

        // Validate date format
        if (!Date.parse(purchaseDate)) {
            return res.status(400).json({
                message: 'Invalid purchase date format. Please use YYYY-MM-DD format'
            });
        }

        const newItem = await Item.create(req.body);
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(400).json({ 
            message: error.message || 'Failed to create item',
            details: error.code || 'Unknown error'
        });
    }
};

// Update item
exports.updateItem = async (req, res) => {
    try {
        const success = await Item.update(req.params.id, req.body);
        if (!success) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete item
exports.deleteItem = async (req, res) => {
    try {
        const success = await Item.delete(req.params.id);
        if (!success) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search items
exports.searchItems = async (req, res) => {
    try {
        const { query } = req.query;
        const items = await Item.search(query);
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get low stock items
exports.getLowStockItems = async (req, res) => {
    try {
        const items = await Item.getLowStock();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update stock
exports.updateStock = async (req, res) => {
    try {
        const { quantity, type, reason } = req.body;
        const itemId = req.params.id;

        if (!quantity || !type || !reason) {
            return res.status(400).json({
                message: 'Missing required fields. Please provide: quantity, type, and reason'
            });
        }

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        let newQuantity;
        if (type === 'add') {
            newQuantity = item.quantity + parseInt(quantity);
        } else if (type === 'remove') {
            newQuantity = item.quantity - parseInt(quantity);
            if (newQuantity < 0) {
                return res.status(400).json({
                    message: 'Cannot remove more items than available in stock'
                });
            }
        }

        await Item.updateById(itemId, { quantity: newQuantity });

        res.json({ 
            message: 'Stock updated successfully',
            newQuantity
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};