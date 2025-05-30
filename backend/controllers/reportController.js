const db = require('../config/db');

// Get inventory history reports
const getInventoryReports = async (req, res) => {
    try {
        const { dateRange } = req.query;
        let query = 'SELECT * FROM inventory_history';
        
        // Apply date filtering
        if (dateRange === 'lastMonth') {
            query += ' WHERE date >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)';
        } else if (dateRange === 'last3Months') {
            query += ' WHERE date >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)';
        } else if (dateRange === 'lastYear') {
            query += ' WHERE date >= DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR)';
        }
        
        query += ' ORDER BY date DESC';
        const [reports] = await db.query(query);
        
        // Debug logging
        console.log('Reports from DB:', reports);

        // Process the data
        const result = processReportData(reports);
        res.json(result);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
};

// Process report data for different chart types
function processReportData(reports) {
    try {
        const stockData = reports.map(report => {
            // Ensure snapshot_data is parsed properly
            let parsedSnapshot;
            try {
                parsedSnapshot = typeof report.snapshot_data === 'string' 
                    ? JSON.parse(report.snapshot_data || '{}')
                    : (report.snapshot_data || {});
            } catch (error) {
                console.error('Error parsing snapshot data:', error);
                parsedSnapshot = {};
            }
            
            return {
                date: report.date,
                totalItems: report.total_items || 0,
                lowStockItems: report.low_stock_items || 0,
                categories: parsedSnapshot.categories || [],
                value: Number(report.total_value || 0)
            };
        });

        // Get latest snapshot for category distribution
        const latestReport = reports[0];
        if (!latestReport) {
            return {
                stockData,
                categoryDistribution: []
            };
        }

        // Process and validate the snapshot data
        let categoryData = [];
        try {
            const latestSnapshotData = typeof latestReport.snapshot_data === 'string'
                ? JSON.parse(latestReport.snapshot_data || '{}')
                : (latestReport.snapshot_data || {});

            if (Array.isArray(latestSnapshotData.categories)) {
                categoryData = latestSnapshotData.categories
                    .filter(category => category && typeof category === 'object')
                    .map(category => ({
                        name: category.name || 'Unknown',
                        value: Number(category.count || 0)
                    }));
            }
        } catch (error) {
            console.error('Error processing category data:', error);
        }

        return {
            stockData,
            categoryDistribution: categoryData
        };
    } catch (error) {
        console.error('Error processing report data:', error);
        return {
            stockData: [],
            categoryDistribution: []
        };
    }
}

// Create a new inventory snapshot
const createSnapshot = async (req, res) => {
    try {
        // Get current inventory state
        const [items] = await db.query('SELECT * FROM items');
        
        // Calculate total items and low stock items
        const totalItems = items.length;
        const lowStockItems = items.filter(item => item.quantity <= item.minimum_stock).length;
        
        // Calculate total value
        const totalValue = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
        
        // Group items by category
        const categoryCounts = items.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + item.quantity;
            return acc;
        }, {});
        
        // Create categories array for snapshot
        const categories = Object.entries(categoryCounts).map(([name, count]) => ({
            name,
            count
        }));
        
        // Create snapshot
        const snapshot = {
            categories,
            timestamp: new Date().toISOString()
        };
        
        // Insert into inventory_history
        const query = `
            INSERT INTO inventory_history 
            (date, total_items, low_stock_items, total_value, snapshot_data) 
            VALUES (NOW(), ?, ?, ?, ?)
        `;
        
        await db.query(query, [
            totalItems,
            lowStockItems,
            totalValue,
            JSON.stringify(snapshot)
        ]);
        
        res.json({ message: 'Snapshot created successfully' });
    } catch (error) {
        console.error('Error creating snapshot:', error);
        res.status(500).json({ message: 'Error creating snapshot', error: error.message });
    }
};

module.exports = {
    getInventoryReports,
    createSnapshot
};
