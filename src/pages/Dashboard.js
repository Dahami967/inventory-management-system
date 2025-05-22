import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { formatLKR } from '../utils/formatters';
import { itemService } from '../services/api';

const StatCard = ({ title, value, icon, color, isCurrency }) => (
  <Paper
    sx={{
      p: 3,
      display: 'flex',
      alignItems: 'center',
      bgcolor: color,
      color: 'white',
    }}
  >
    <Box sx={{ mr: 2 }}>{icon}</Box>
    <Box>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="h4">{isCurrency ? formatLKR(value) : value}</Typography>
    </Box>
  </Paper>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [allItems, lowStockItems] = await Promise.all([
        itemService.getAllItems(),
        itemService.getLowStockItems()
      ]);

      const totalValue = allItems.reduce((sum, item) => 
        sum + (item.unitPrice * item.quantity), 0
      );

      setStats({
        totalItems: allItems.length,
        lowStockItems: lowStockItems.length,
        totalValue: totalValue
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Items"
            value={stats.totalItems}
            icon={<InventoryIcon fontSize="large" />}
            color="#1a237e"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockItems}
            icon={<WarningIcon fontSize="large" />}
            color="#c62828"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Inventory Value"
            value={stats.totalValue}
            icon={<TrendingUpIcon fontSize="large" />}
            color="#2e7d32"
            isCurrency={true}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Recent Activity"
            value={stats.lowStockItems > 0 ? 'Attention Needed' : 'All Good'}
            icon={<ShoppingCartIcon fontSize="large" />}
            color="#1565c0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Activities
            </Typography>
            {/* Add activity list here */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Low Stock Items
            </Typography>
            {/* Add low stock items list here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
