const db = require('../config/db');

exports.issueItem = async (req, res) => {


    const { itemId, quantity, notes } = req.body;
    const issuedBy = req.user.id; // From JWT token

    if (!itemId || !quantity) {
        return res.status(400).json({ message: 'Item name and quantity are required.' });
    }


    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Find all items with the given name and quantity > 0, order by id (FIFO)
        const [items] = await connection.query(
            'SELECT id, quantity FROM items WHERE itemName = ? AND quantity > 0 ORDER BY id',
            [itemId]
        );

        const totalAvailable = items.reduce((sum, item) => sum + item.quantity, 0);
        if (totalAvailable < quantity) {
            await connection.rollback();
            return res.status(404).json({
                message: 'Item not found or insufficient quantity available.'
            });
        }

        let qtyToIssue = Number(quantity);
        let issuedItemIds = [];
        for (const item of items) {
            if (qtyToIssue <= 0) break;
            const deduct = Math.min(item.quantity, qtyToIssue);
            // Update item quantity
            await connection.query(
                'UPDATE items SET quantity = quantity - ? WHERE id = ?',
                [deduct, item.id]
            );
            // Record in stock history
            await connection.query(
                `INSERT INTO stock_history (itemId, quantity, type, reason, updatedBy) 
                 VALUES (?, ?, 'out', ?, ?)`,
                [item.id, deduct, 'Issued', issuedBy]
            );
            issuedItemIds.push({ id: item.id, qty: deduct });
            qtyToIssue -= deduct;
        }

        // Create issue record for the first item (for tracking)
        const [issueResult] = await connection.query(
            `INSERT INTO issued_items (itemId, quantity, issueDate, issuedBy, notes) 
             VALUES (?, ?, CURDATE(), ?, ?)`,
            [items[0].id, quantity, issuedBy, notes]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Item issued successfully',
            issueId: issueResult.insertId,
            issuedItemIds
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
