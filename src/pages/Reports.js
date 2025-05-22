import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  MenuItem,
  TextField,
  Button,
} from '@mui/material';
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

// Sample data - replace with actual API calls
const stockData = [
  { name: 'Electronics', value: 45 },
  { name: 'Office Supplies', value: 30 },
  { name: 'Clothing', value: 15 },
  { name: 'Food & Beverages', value: 10 },
];

const monthlyData = [
  { name: 'Jan', inStock: 120, lowStock: 5 },
  { name: 'Feb', inStock: 135, lowStock: 8 },
  { name: 'Mar', inStock: 150, lowStock: 12 },
  { name: 'Apr', inStock: 145, lowStock: 10 },
  { name: 'May', inStock: 160, lowStock: 6 },
];

const valueData = [
  { name: 'Jan', value: 2500000 }, // Values in LKR
  { name: 'Feb', value: 2800000 },
  { name: 'Mar', value: 3200000 },
  { name: 'Apr', value: 3000000 },
  { name: 'May', value: 3500000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1 }}>
        <Typography>{label}</Typography>
        {payload.map((entry, index) => (
          <Typography key={index} sx={{ color: entry.color }}>
            {entry.name}:{' '}
            {entry.name.includes('Value')
              ? formatLKR(entry.value)
              : entry.value}
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

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting report:', { reportType, dateRange });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Reports</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="all">All Reports</MenuItem>
            <MenuItem value="stock">Stock Levels</MenuItem>
            <MenuItem value="value">Inventory Value</MenuItem>
            <MenuItem value="movement">Stock Movement</MenuItem>
          </TextField>
          <TextField
            select
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
            Export
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Stock Distribution by Category
            </Typography>
            <PieChart width={400} height={300}>
              <Pie
                data={stockData}
                cx={200}
                cy={150}
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stockData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Monthly Stock Levels
            </Typography>
            <BarChart
              width={400}
              height={300}
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="inStock" fill="#8884d8" name="In Stock" />
              <Bar dataKey="lowStock" fill="#82ca9d" name="Low Stock" />
            </BarChart>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Total Inventory Value Trend
            </Typography>
            <LineChart
              width={900}
              height={300}
              data={valueData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `Rs. ${value / 1000}K`} />
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
      </Grid>
    </Box>
  );
};

export default Reports;
