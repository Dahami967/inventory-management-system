import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { formatLKR } from '../utils/formatters';
import { reportService, itemService } from '../services/api';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { Chip } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const getDateRange = (range) => {
  const today = new Date();
  switch (range) {
    case 'lastWeek':
      return { start: format(subDays(today, 7), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') };
    case 'lastMonth':
      return { start: format(subMonths(today, 1), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') };
    case 'last3Months':
      return { start: format(subMonths(today, 3), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') };
    case 'lastYear':
      return { start: format(subYears(today, 1), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') };
    default:
      return { start: format(subMonths(today, 1), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') };
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1 }}>
        <Typography>{label}</Typography>
        {payload.map((entry) => (
          <Typography key={entry.name} sx={{ color: entry.color }}>
            {entry.name}: {entry.name.includes('Value') ? formatLKR(entry.value) : entry.value}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

const Reports = () => {
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState('lastMonth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    stockData: [],
    categoryDistribution: [],
    items: []
  });
  const [items, setItems] = useState([]);

  const columns = [
    {
      field: 'itemName',
      headerName: 'Item Name',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      type: 'number',
      width: 100,
    },
    {
      field: 'unitPrice',
      headerName: 'Unit Price (LKR)',
      type: 'number',
      flex: 1,
      minWidth: 130,
      renderCell: (params) => formatLKR(params.value),
    },
    {
      field: 'supplier',
      headerName: 'Supplier',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={
            params.row.quantity <= params.row.minimumStock
              ? 'Low Stock'
              : 'In Stock'
          }
          color={
            params.row.quantity <= params.row.minimumStock ? 'error' : 'success'
          }
          size="small"
        />
      ),
    },
  ];
  useEffect(() => {
    if (reportType === 'items') {
      fetchItems();
    } else {
      fetchReportData();
    }
  }, [dateRange, reportType]);  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { start, end } = getDateRange(dateRange);
      
      // Fetch all types of data needed for reports
      const [reportResponse, itemsData] = await Promise.all([
        reportService.getInventoryReports(dateRange),
        itemService.getAllItems()
      ]);
      
      // Process data for category distribution
      const categoryMap = {};
      itemsData.forEach(item => {
        categoryMap[item.category] = (categoryMap[item.category] || 0) + item.quantity;
      });
      
      const categoryDistribution = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value
      }));
      
      // Set all data
      setData({
        stockData: reportResponse.stockData || [],
        categoryDistribution,
        items: itemsData
      });
      
      console.log('Report data processed:', categoryDistribution); // For debugging
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const itemsData = await itemService.getAllItems();
      
      // Add an id field if it doesn't exist
      const itemsWithId = itemsData.map(item => ({
        ...item,
        id: item.id || Math.random().toString(36).substr(2, 9)
      }));
      
      setItems(itemsWithId);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to fetch items data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      await reportService.createSnapshot();
      await fetchReportData();
    } catch (error) {
      console.error('Error creating snapshot:', error);
      setError('Failed to create snapshot. Please try again.');
    }
  };

  const getChartData = () => {
    if (!data || !data.stockData) return [];

    switch (reportType) {
      case 'stock':
        return data.stockData.map(item => ({
          name: new Date(item.date).toLocaleDateString(),
          totalItems: item.totalItems,
          lowStockItems: item.lowStockItems
        }));
      case 'value':
        return data.stockData.map(item => ({
          name: new Date(item.date).toLocaleDateString(),
          value: item.value
        }));
      case 'movement':
        return data.stockData.map(item => ({
          name: new Date(item.date).toLocaleDateString(),
          inStock: item.totalItems,
          lowStock: item.lowStockItems
        }));
      case 'all':
      default:
        return data.categoryDistribution;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Reports</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Report Type"
            value={reportType}            onChange={(e) => setReportType(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="all">Category Distribution</MenuItem>
            <MenuItem value="stock">Stock Levels</MenuItem>
            <MenuItem value="value">Inventory Value</MenuItem>
            <MenuItem value="movement">Stock Movement</MenuItem>
            <MenuItem value="items">All Items</MenuItem>
          </TextField>
          <TextField
            select
            label="Date Range"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="lastWeek">Last Week</MenuItem>
            <MenuItem value="lastMonth">Last Month</MenuItem>
            <MenuItem value="last3Months">Last 3 Months</MenuItem>
            <MenuItem value="lastYear">Last Year</MenuItem>
          </TextField>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
          >
            Create Snapshot
          </Button>
        </Box>
      </Box>

      {error ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>          {reportType === 'all' && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Stock Distribution by Category
                </Typography>
                {data.categoryDistribution && data.categoryDistribution.length > 0 ? (
                  <PieChart width={400} height={300}>
                    <Pie
                      data={data.categoryDistribution}
                      cx={200}
                      cy={150}
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.categoryDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                ) : (
                  <Typography align="center">No category distribution data available</Typography>
                )}
              </Paper>
            </Grid>
          )}

          {reportType === 'movement' && data.stockData && data.stockData.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Stock Movement Trend
                </Typography>
                <BarChart
                  width={900}
                  height={300}
                  data={getChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="inStock" fill="#8884d8" name="In Stock" />
                  <Bar dataKey="lowStock" fill="#82ca9d" name="Low Stock" />
                </BarChart>
              </Paper>
            </Grid>
          )}

          {reportType === 'value' && data.stockData && data.stockData.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Total Inventory Value Trend
                </Typography>
                <LineChart
                  width={900}
                  height={300}
                  data={getChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatLKR(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    name="Total Value (LKR)"
                  />
                </LineChart>
              </Paper>
            </Grid>
          )}

          {reportType === 'stock' && data.stockData && data.stockData.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Stock Levels Trend
                </Typography>
                <LineChart
                  width={900}
                  height={300}
                  data={getChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalItems"
                    stroke="#8884d8"
                    name="Total Items"
                  />
                  <Line
                    type="monotone"
                    dataKey="lowStockItems"
                    stroke="#82ca9d"
                    name="Low Stock Items"
                  />
                </LineChart>
              </Paper>
            </Grid>          )}

          {reportType === 'items' && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  All Items Report
                </Typography>
                <Box sx={{ height: 600 }}>
                  <DataGrid
                    rows={items}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    checkboxSelection
                    disableSelectionOnClick
                    loading={loading}
                    sx={{
                      '& .MuiDataGrid-cell:focus': {
                        outline: 'none',
                      },
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          )}

          {(!data.stockData || data.stockData.length === 0) && 
           (!data.categoryDistribution || data.categoryDistribution.length === 0) && 
           reportType !== 'items' && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" align="center">
                  No data available for the selected time period
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default Reports;
