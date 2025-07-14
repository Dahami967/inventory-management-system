const db = require('../config/db');

class Item {
    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM items');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM items WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(item) {
        const [result] = await db.execute(
            'INSERT INTO items (itemName, category, unitPrice, quantity, minimumStock, supplier, purchaseDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                item.itemName,
                item.category,
                item.unitPrice,
                item.quantity,
                item.minimumStock,
                item.supplier,
                item.purchaseDate
            ]
        );
        return { id: result.insertId, ...item };
    }

    static async update(id, item) {
        const [result] = await db.execute(
            'UPDATE items SET itemName = ?, category = ?, unitPrice = ?, quantity = ?, minimumStock = ?, supplier = ?, purchaseDate = ? WHERE id = ?',
            [
                item.itemName,
                item.category,
                item.unitPrice,
                item.quantity,
                item.minimumStock,
                item.supplier,
                item.purchaseDate,
                id
            ]
        );
        return result.affectedRows > 0;
    }

    static async findByName(itemName) {
        const [rows] = await db.execute('SELECT * FROM items WHERE itemName = ?', [itemName]);
        return rows[0];
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM items WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async updateById(id, updates) {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const query = `UPDATE items SET ${setClause} WHERE id = ?`;
        
        const [result] = await db.execute(query, [...values, id]);
        return result.affectedRows > 0;
    }

    static async search(query) {
        const searchPattern = `%${query}%`;
        const [rows] = await db.execute(
            'SELECT * FROM items WHERE itemName LIKE ? OR category LIKE ? OR supplier LIKE ?',
            [searchPattern, searchPattern, searchPattern]
        );
        return rows;
    }

    static async getLowStock() {
        const [rows] = await db.execute('SELECT * FROM items WHERE quantity <= minimumStock');
        return rows;
    }

    static async updateStock(id, quantity, type, reason, userId) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const updateQuantity = type === 'in' ? 
                'quantity = quantity + ?' : 
                'quantity = quantity - ?';
            
            await connection.execute(
                `UPDATE items SET ${updateQuantity} WHERE id = ?`,
                [Math.abs(quantity), id]
            );

            await connection.execute(
                'INSERT INTO stock_history (itemId, quantity, type, reason, updatedBy) VALUES (?, ?, ?, ?, ?)',
                [id, Math.abs(quantity), type, reason, userId]
            );

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Item;