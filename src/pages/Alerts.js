import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon, 
  Chip, Divider, LinearProgress
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { itemService } from '../services/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const items = await itemService.getLowStockItems();
        const data = items.map(item => ({
          id: item.id,
          name: item.itemName,
          quantity: item.quantity,
          minimumStock: item.minimumStock,
          category: item.category,
          type: item.quantity === 0 ? 'critical' : 
                item.quantity <= item.minimumStock / 2 ? 'warning' : 'info',
          percentage: Math.round((item.quantity / item.minimumStock) * 100),
          timestamp: new Date().toLocaleString(),
          status: 'unread',
        }));
        setAlerts(data);
      } catch (err) {
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'critical': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'info': return <InfoIcon color="info" />;
      default: return null;
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Stock Alerts</Typography>
      <Paper>
        {loading ? (
          <Box p={2}>
            <LinearProgress />
          </Box>
        ) : (
          <List>
            {alerts.length === 0 ? (
              <Typography p={2}>All stock levels are normal.</Typography>
            ) : alerts.map((alert, index) => (
              <React.Fragment key={alert.id}>
                <ListItem>
                  <ListItemIcon>{getIcon(alert.type)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography component="span" sx={{ fontWeight: 'bold' }}>
                          {alert.name}
                        </Typography>
                        <Typography component="div" variant="body2" color="error">
                          Current Stock: {alert.quantity} items 
                          (Minimum required: {alert.minimumStock})
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={alert.percentage}
                          color={alert.type === 'critical' ? 'error' : 
                                alert.type === 'warning' ? 'warning' : 'info'}
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          Category: {alert.category} | Stock Level: {alert.percentage}%
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip
                    label={alert.type.toUpperCase()}
                    color={alert.type === 'critical' ? 'error' : 
                           alert.type === 'warning' ? 'warning' : 'info'}
                    size="small"
                  />
                </ListItem>
                {index < alerts.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default Alerts;
