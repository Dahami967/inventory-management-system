import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon, Chip, Divider
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/items/low-stock')
      .then(res => {
        console.log("Fetched items:", res.data); // helpful for debugging
        const data = res.data.map(item => ({
          id: item.id ?? item._id,
          name: item.itemName || 'Unnamed Item',  // FIXED HERE
          quantity: item.quantity ?? 0,
          type: item.quantity <= 3 ? 'critical' : 'warning',
          timestamp: new Date().toLocaleString(),
          status: 'unread',
        }));
        setAlerts(data);
      })
      .catch(err => console.error('Error fetching alerts:', err));
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
      <Typography variant="h4" gutterBottom>Alerts</Typography>
      <Paper>
        <List>
          {alerts.length === 0 ? (
            <Typography p={2}>No alerts at the moment.</Typography>
          ) : alerts.map((alert, index) => (
            <React.Fragment key={alert.id}>
              <ListItem>
                <ListItemIcon>{getIcon(alert.type)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Typography component="span">
                      <span style={{ fontWeight: 'bold' }}>{alert.name}</span> stock is low ({alert.quantity} remaining)
                    </Typography>
                  }
                  secondary={alert.timestamp}
                />
                <Chip
                  label={alert.status}
                  color={alert.status === 'unread' ? 'secondary' : 'default'}
                />
              </ListItem>
              {index < alerts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Alerts;
