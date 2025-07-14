const db = require('../config/db');

exports.issueItem = async (req, res) => {

    const { itemId, quantity, notes } = req.body;
    const issuedBy = req.user.id; // From JWT token

    if (!itemId || !quantity) {
        return res.status(400).json({ message: 'Item ID and quantity are required.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Check if item exists and has sufficient quantity
        const [items] = await connection.query(
            'SELECT id, quantity, itemName FROM items WHERE id = ? AND quantity >= ?',
            [itemId, quantity]
        );

        if (items.length === 0) {
            await connection.rollback();
            return res.status(404).json({ 
                message: 'Item not found or insufficient quantity available.' 
            });
        }

        const item = items[0];


        // Create issue record
        const [issueResult] = await connection.query(
            `INSERT INTO issued_items (itemId, quantity, issueDate, issuedBy, notes) 
             VALUES (?, ?, CURDATE(), ?, ?)`,
            [itemId, quantity, issuedBy, notes]
        );

        // Update item quantity
        await connection.query(
            'UPDATE items SET quantity = quantity - ? WHERE id = ?',
            [quantity, itemId]
        );


        // Record in stock history
        await connection.query(
            `INSERT INTO stock_history (itemId, quantity, type, reason, updatedBy) 
             VALUES (?, ?, 'out', ?, ?)`,
            [itemId, quantity, 'Issued', issuedBy]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Item issued successfully',
            issueId: issueResult.insertId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error issuing item:', error);
        res.status(500).json({ message: 'Server error while issuing item.' });
    } finally {
        connection.release();
    }
};

exports.getIssuedItems = async (req, res) => {
    try {
        const [items] = await db.query(
            `SELECT i.*, it.itemName, u.username as issuedByUser
             FROM issued_items i
             JOIN items it ON i.itemId = it.id
             JOIN users u ON i.issuedBy = u.id
             ORDER BY i.issueDate DESC`
        );
        
        res.json(items);
    } catch (error) {
        console.error('Error fetching issued items:', error);
        res.status(500).json({ message: 'Server error while fetching issued items.' });
    }
};
