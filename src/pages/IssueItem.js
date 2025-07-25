import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
  Snackbar,
  Divider,
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useNavigate } from 'react-router-dom';
import { itemService, issueService } from '../services/api';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import axios from 'axios';

const IssueItem = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    notes: '',
    issueDate: new Date()
  });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStockSummary();
    // eslint-disable-next-line
  }, []);

  const fetchStockSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/items/stock-summary');
      // Only show items with stock > 0
      setItems(response.data.filter(item => item.totalQuantity > 0));
    } catch (error) {
      setAlert({
        open: true,
        message: 'Error fetching items',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'itemName') {
      const selected = items.find(item => item.itemName === value);
      setSelectedItem(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.quantity) {
      setAlert({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }
    if (selectedItem && Number(formData.quantity) > selectedItem.totalQuantity) {
      setAlert({
        open: true,
        message: 'Requested quantity exceeds available stock',
        severity: 'error'
      });
      return;
    }
    setLoading(true);
    try {
      await issueService.issueItem({
        itemId: formData.itemName, // send as itemId for backend compatibility
        quantity: formData.quantity,
        notes: formData.notes,
        issueDate: formData.issueDate
      });
      setAlert({
        open: true,
        message: 'Item issued successfully',
        severity: 'success'
      });
      setFormData({
        itemName: '',
        quantity: '',
        notes: '',
        issueDate: new Date()
      });
      setSelectedItem(null);
      fetchStockSummary();
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.message || 'Error issuing item',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, background: '#f4f6fa', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ maxWidth: 600, mx: 'auto', p: 4, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <AssignmentReturnIcon color="primary" sx={{ fontSize: 36, mr: 1 }} />
          <Typography variant="h5" fontWeight={600} color="primary.main">
            Issue Inventory Item
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <form onSubmit={handleSubmit} autoComplete="off">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Select Item</InputLabel>
                <Select
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  label="Select Item"
                  disabled={loading}
                >
                  {items.length === 0 && <MenuItem value="">No items in stock</MenuItem>}
                  {items.map((item) => (
                    <MenuItem key={item.itemName} value={item.itemName}>
                      {item.itemName} (In Stock: {item.totalQuantity})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Quantity to Issue"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                inputProps={{ min: 1, max: selectedItem?.totalQuantity || 1 }}
                required
                disabled={loading || !formData.itemName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Issue Date"
                  value={formData.issueDate}
                  onChange={(newValue) => {
                    setFormData(prev => ({ ...prev, issueDate: newValue }));
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth required disabled={loading} />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes (optional)"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Issue Item'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/view-inventory')}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar
        open={alert.open}
        autoHideDuration={5000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          variant="filled"
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IssueItem;
