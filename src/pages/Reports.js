import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, MenuItem, TextField,
  Button, CircularProgress, Snackbar, Alert, Chip,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { DataGrid } from '@mui/x-data-grid';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip,
  LineChart, Line, CartesianGrid, XAxis, YAxis, Legend,
  BarChart, Bar,
} from 'recharts';
import { formatLKR } from '../utils/formatters';
import { reportService, itemService } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Tooltip component without "type" prop
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <Paper sx={{ p: 1 }}>
      <Typography variant="subtitle2">{label}</Typography>
      {payload.map(e => (
        <Typography key={e.name} sx={{ color: e.color }}>
          {e.name}: {e.name.includes('Value') ? formatLKR(e.value) : e.value}
        </Typography>
      ))}
    </Paper>
  );
};

const getChartData = (type, stockData, categoryDist) => {
  switch (type) {
    case 'stock':
      return stockData.map(d => ({
      name: new Date(d.date).toISOString().split('T')[0],
   'Total Items': d.totalItems, 'Low Stock': d.lowStockItems,
      }));
    case 'value':
      return stockData.map(d => ({
        name: new Date(d.date).toISOString().split('T')[0],
 'Total Value': d.value,
      }));
    case 'movement':
      return stockData.map(d => ({
        name: new Date(d.date).toISOString().split('T')[0],
 InStock: d.totalItems, LowStock: d.lowStockItems,
      }));
    default:
      return categoryDist;
  }
};

export default function Reports() {
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState('lastMonth');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState(false);
  const [error, setError] = useState(null);
  const [stockData, setStockData] = useState([]);
  const [catDist, setCatDist] = useState([]);
  const [items, setItems] = useState([]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await reportService.getInventoryReports(
        reportType === 'items' ? '' : dateRange
      );
      setStockData(res?.data?.stockData || []);
setCatDist(res?.data?.categoryDistribution || []);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Unable to load reports');
      setStockData([]);
      setCatDist([]);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const list = await itemService.getAllItems();
      setItems(list.map(i => ({ ...i, id: i.id })));
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Unable to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType === 'items') loadItems();
    else loadReport();
  }, [reportType, dateRange]);

  const handleSnapshot = async () => {
    setLoading(true);
    try {
      await reportService.createSnapshot();
      setSnackbar(true);
      if (reportType !== 'items') await loadReport();
    } catch (e) {
      console.error(e);
      setError('Snapshot failed');
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(
    () => getChartData(reportType, stockData, catDist),
    [reportType, stockData, catDist]
  );

  const columns = [
    { field: 'itemName', headerName: 'Name', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    { field: 'quantity', headerName: 'Qty', type: 'number', width: 100 },
    {
      field: 'unitPrice',
      headerName: 'Unit Price (LKR)',
      type: 'number',
      flex: 1,
      renderCell: ({ value }) => formatLKR(value),
    },
    { field: 'supplier', headerName: 'Supplier', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }) => (
        <Chip
          label={row.quantity <= row.minimumStock ? 'Low' : 'In Stock'}
          color={row.quantity <= row.minimumStock ? 'error' : 'success'}
          size="small"
        />
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ mt: 10, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Inventory Reports</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Report Type"
            value={reportType}
            onChange={e => setReportType(e.target.value)}
          >
            <MenuItem value="all">Category Distribution</MenuItem>
            <MenuItem value="stock">Stock Levels</MenuItem>
            <MenuItem value="value">Inventory Value</MenuItem>
            <MenuItem value="movement">Stock Movement</MenuItem>
            <MenuItem value="items">All Items</MenuItem>
          </TextField>

          {reportType !== 'items' && (
            <TextField
              select
              label="Date Range"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
            >
              <MenuItem value="lastWeek">Last Week</MenuItem>
              <MenuItem value="lastMonth">Last Month</MenuItem>
              <MenuItem value="last3Months">Last 3 Months</MenuItem>
              <MenuItem value="lastYear">Last Year</MenuItem>
              <MenuItem value="">All Time</MenuItem>
            </TextField>
          )}

          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleSnapshot}
          >
            Snapshot
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {reportType === 'items' ? (
        <Paper sx={{ height: 600 }}>
          <DataGrid
            rows={items}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </Paper>
      ) : (
        <>
          {reportType === 'all' && catDist.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Categories</Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip content={<CustomTooltip />} />
              </PieChart>
            </Paper>
          )}

          {['stock', 'value', 'movement'].includes(reportType) &&
            stockData.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">
                  {reportType === 'stock'
                    ? 'Stock Levels'
                    : reportType === 'value'
                    ? 'Inventory Value'
                    : 'Stock Movement'}
                </Typography>

                {reportType === 'stock' && (
                  <LineChart width={800} height={300} data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ReTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="Total Items" stroke="#8884d8" />
                    <Line type="monotone" dataKey="Low Stock" stroke="#82ca9d" />
                  </LineChart>
                )}

                {reportType === 'value' && (
                  <LineChart width={800} height={300} data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatLKR} />
                    <ReTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="Total Value" stroke="#8884d8" />
                  </LineChart>
                )}

                {reportType === 'movement' && (
                  <BarChart width={800} height={300} data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ReTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="InStock" fill="#8884d8" />
                    <Bar dataKey="LowStock" fill="#82ca9d" />
                  </BarChart>
                )}
              </Paper>
            )}

          {chartData.length === 0 && (
            <Typography align="center">No data to display</Typography>
          )}
        </>
      )}

      <Snackbar
        open={snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(false)}
      >
        <Alert severity="success">Snapshot created!</Alert>
      </Snackbar>
    </Box>
  );
}
