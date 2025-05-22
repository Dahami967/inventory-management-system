import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import SaveIcon from '@mui/icons-material/Save';
import dayjs from 'dayjs';
import { itemService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const categories = [
  'Electronics',
  'Clothing',
  'Food & Beverages',
  'Office Supplies',
  'Other',
];

const AddItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    description: '',
    unitPrice: '',
    quantity: '',
    minimumStock: '',
    supplier: '',
    purchaseDate: dayjs(),
  });

  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.itemName.trim()) newErrors.itemName = 'Item name is required';
    if (!formData.category) newErrors.category = 'Category is required';

    const unitPrice = parseFloat(formData.unitPrice);
    if (isNaN(unitPrice) || unitPrice <= 0) {
      newErrors.unitPrice = 'Enter a valid price greater than 0';
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity < 0) {
      newErrors.quantity = 'Enter a valid quantity (0 or greater)';
    }

    const minimumStock = parseInt(formData.minimumStock);
    if (isNaN(minimumStock) || minimumStock < 0) {
      newErrors.minimumStock = 'Enter a valid minimum stock (0 or greater)';
    }

    if (!formData.supplier.trim()) newErrors.supplier = 'Supplier is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      purchaseDate: date,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    setLoading(true);
    setError('');

    try {
      // Format the data for the API
      const itemData = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        quantity: parseInt(formData.quantity),
        minimumStock: parseInt(formData.minimumStock),
        purchaseDate: formData.purchaseDate.format('YYYY-MM-DD'),
      };

      await itemService.createItem(itemData);
      setOpenSnackbar(true);

      // Reset form after successful submission
      setFormData({
        itemName: '',
        category: '',
        description: '',
        unitPrice: '',
        quantity: '',
        minimumStock: '',
        supplier: '',
        purchaseDate: dayjs(),
      });

      // Navigate to inventory view after short delay
      setTimeout(() => {
        navigate('/view-inventory');
      }, 2000);
    } catch (error) {
      console.error('Error creating item:', error);
      setError(error.response?.data?.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Add New Item
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Item Name"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                error={!!errors.itemName}
                helperText={errors.itemName}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                error={!!errors.category}
                helperText={errors.category}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit Price (LKR)"
                name="unitPrice"
                type="number"
                value={formData.unitPrice}
                onChange={handleChange}
                error={!!errors.unitPrice}
                helperText={errors.unitPrice}
                InputProps={{
                  inputProps: { min: 0, step: "0.01" }
                }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Initial Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                error={!!errors.quantity}
                helperText={errors.quantity}
                InputProps={{
                  inputProps: { min: 0 }
                }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Stock Level"
                name="minimumStock"
                type="number"
                value={formData.minimumStock}
                onChange={handleChange}
                error={!!errors.minimumStock}
                helperText={errors.minimumStock}
                InputProps={{
                  inputProps: { min: 0 }
                }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                error={!!errors.supplier}
                helperText={errors.supplier}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Purchase Date"
                value={formData.purchaseDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth />}
                maxDate={dayjs()}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={loading}
                fullWidth
              >
                {loading ? 'Saving...' : 'Save Item'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Item added successfully!
        </Alert>
      </Snackbar>

      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert
            onClose={() => setError('')}
            severity="error"
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default AddItem;
