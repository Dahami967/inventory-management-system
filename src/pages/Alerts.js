import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Divider,
  TextField,
  MenuItem,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';

// Sample data - replace with actual API call
const sampleAlerts = [
  {
    id: 1,
    type: 'critical',
    message: 'Laptop stock below minimum threshold (2 remaining)',
    timestamp: '2025-05-22 09:30',
    status: 'unread',
  },
  {
    id: 2,
    type: 'warning',
    message: 'Office chairs reaching minimum stock level (5 remaining)',
    timestamp: '2025-05-22 08:45',
    status: 'unread',
  },
  {
    id: 3,
    type: 'info',
    message: 'New shipment of electronics arriving tomorrow',
    timestamp: '2025-05-21 16:20',
    status: 'read',
  },
  {
    id: 4,
    type: 'success',
    message: 'Stock update completed successfully',
    timestamp: '2025-05-21 15:15',
    status: 'read',
  },
];

const getAlertIcon = (type) => {
  switch (type) {
    case 'critical':
      return <ErrorIcon color="error" />;
    case 'warning':
      return <WarningIcon sx={{ color: 'orange' }} />;
    case 'success':
      return <CheckCircleIcon color="success" />;
    default:
      return <InfoIcon color="info" />;
  }
};

const getAlertColor = (type) => {
  switch (type) {
    case 'critical':
      return 'error';
    case 'warning':
      return 'warning';
    case 'success':
      return 'success';
    default:
      return 'info';
  }
};

const Alerts = () => {
  const [alerts, setAlerts] = useState(sampleAlerts);
  const [filter, setFilter] = useState('all');

  const handleDeleteAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return alert.status === 'unread';
    return alert.type === filter;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Alerts</Typography>
        <TextField
          select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ width: 200 }}
        >
          <MenuItem value="all">All Alerts</MenuItem>
          <MenuItem value="unread">Unread</MenuItem>
          <MenuItem value="critical">Critical</MenuItem>
          <MenuItem value="warning">Warnings</MenuItem>
          <MenuItem value="info">Information</MenuItem>
        </TextField>
      </Box>

      <Paper>
        <List>
          {filteredAlerts.map((alert, index) => (
            <React.Fragment key={alert.id}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  backgroundColor:
                    alert.status === 'unread' ? 'action.hover' : 'inherit',
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteAlert(alert.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>{getAlertIcon(alert.type)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {alert.message}
                      {alert.status === 'unread' && (
                        <Chip
                          label="New"
                          size="small"
                          color={getAlertColor(alert.type)}
                        />
                      )}
                    </Box>
                  }
                  secondary={alert.timestamp}
                />
              </ListItem>
            </React.Fragment>
          ))}
          {filteredAlerts.length === 0 && (
            <ListItem>
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{ textAlign: 'center', color: 'text.secondary' }}
                  >
                    No alerts to display
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default Alerts;
