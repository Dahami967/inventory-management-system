const db = require('../config/db');

// Utility: Convert dateRange string to actual dates
const getDateRangeFromString = (range) => {
  const toDate = new Date();
  const fromDate = new Date();

  switch (range) {
    case 'lastWeek':
      fromDate.setDate(toDate.getDate() - 7);
      break;
    case 'lastMonth':
      fromDate.setMonth(toDate.getMonth() - 1);
      break;
    case 'last3Months':
      fromDate.setMonth(toDate.getMonth() - 3);
      break;
    case 'lastYear':
      fromDate.setFullYear(toDate.getFullYear() - 1);
      break;
    default:
      return { fromDate: null, toDate: null };
  }

  return { fromDate, toDate };
};

// Utility: Convert DB reports to frontend-ready chart data
function processReportData(reports) {
  const stockData = reports.map(r => {
    let snap = {};
    if (r.snapshot_data) {
      try {
        snap = typeof r.snapshot_data === 'string'
          ? JSON.parse(r.snapshot_data)
          : r.snapshot_data;
      } catch (e) {
        console.warn('Invalid snapshot_data JSON for row', r.id);
        snap = {};
      }
    }

    return {
      date: r.date,
      totalItems: r.total_items,
      lowStockItems: r.low_stock_items,
      value: Number(r.total_value),
      categories: Array.isArray(snap.categories) ? snap.categories : [],
    };
  });

  const latest = stockData.at(-1);
  const categoryDistribution = Array.isArray(latest?.categories)
    ? latest.categories.map(c => ({
        name: c.name,
        value: Number(c.count),
      }))
    : [];

  return { stockData, categoryDistribution };
}

// Reusable internal snapshot function (for API and internal use)
const takeInventorySnapshot = async () => {
  const [items] = await db.query('SELECT * FROM items');

  if (!items.length) throw new Error('No items in stock to snapshot.');

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const lowStockItems = items.filter(item => item.quantity <= item.minimumStock).length;
  const totalValue = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

  const categoryCounts = {};
  for (let item of items) {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + item.quantity;
  }

  const categories = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
  const snapshotData = { categories, timestamp: new Date().toISOString() };

  await db.query(
    `INSERT INTO inventory_history 
     (date, total_items, low_stock_items, total_value, snapshot_data) 
     VALUES (NOW(), ?, ?, ?, ?)`,
    [totalItems, lowStockItems, totalValue, JSON.stringify(snapshotData)]
  );
};

// Public API endpoint: /api/reports/snapshot
const createSnapshot = async (req, res) => {
  try {
    await takeInventorySnapshot();
    res.json({ message: 'Snapshot saved successfully with timestamp.' });
  } catch (err) {
    console.error('[createSnapshot]', err);
    res.status(500).json({ message: err.message });
  }
};

// Public API endpoint: /api/reports
const getInventoryReports = async (req, res) => {
  try {
    const dateRange = req.query.dateRange || '';

    // Get current items with their details
    const [items] = await db.query('SELECT id, itemName, category, quantity FROM items');
    
    // Group items by category with full item details
    const categoryMap = {};
    items.forEach(item => {
      if (!categoryMap[item.category]) {
        categoryMap[item.category] = {
          name: item.category,
          value: 0, // Total quantity in category
          items: [] // Array to store item details
        };
      }
      categoryMap[item.category].value += item.quantity;
      categoryMap[item.category].items.push({
        id: item.id,
        name: item.itemName,
        quantity: item.quantity
      });
    });

    const categoryDistribution = Object.values(categoryMap)
      .sort((a, b) => b.value - a.value);

    let stockData = [];
    if (dateRange === '') {
      const [reports] = await db.query('SELECT * FROM inventory_history ORDER BY date ASC');
      ({ stockData } = processReportData(reports));
    } else {
      const { fromDate, toDate } = getDateRangeFromString(dateRange);
      if (!fromDate || !toDate) {
        return res.status(400).json({ message: 'Invalid date range' });
      }

      const [reports] = await db.query(
        'SELECT * FROM inventory_history WHERE date BETWEEN ? AND ? ORDER BY date ASC',
        [fromDate, toDate]
      );
      ({ stockData } = processReportData(reports));
    }

    res.json({
      data: {
        stockData,
        categoryDistribution,
      },
    });
  } catch (err) {
    console.error('[getInventoryReports]', err);
    res.status(500).json({ message: 'Error fetching report data' });
  }
};

// Optional export for other controllers (e.g., createItem)
module.exports = {
  getInventoryReports,
  createSnapshot,
  takeInventorySnapshot,
};
