import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import { itemService } from '../services/api';

const UpdateStock = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [updateType, setUpdateType] = useState('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await itemService.getAllItems();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    try {
      if (term) {
        const data = await itemService.searchItems(term);
        setItems(data);
      } else {
        fetchItems();
      }
    } catch (error) {
      console.error('Error searching items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !quantity) return;

    try {
      await itemService.updateStock(selectedItem.id, {
        quantity: parseInt(quantity),
        type: updateType,
        reason
      });

      setOpenSnackbar(true);
      setError('');
      setSelectedItem(null);
      setQuantity('');
      setReason('');
      fetchItems(); // Refresh the items list
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating stock');
    }
  };

  const columns = [
    {
      field: 'itemName',
      headerName: 'Item Name',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'quantity',
      headerName: 'Current Stock',
      type: 'number',
      width: 130
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'minimumStock',
      headerName: 'Minimum Stock',
      type: 'number',
      width: 130,
    }
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Update Stock
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search items..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon />,
              }}
              sx={{ mb: 2 }}
            />

            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={items}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                onRowClick={(params) => setSelectedItem(params.row)}
                loading={loading}
                sx={{
                  '& .MuiDataGrid-row': {
                    cursor: 'pointer',
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Update Stock Details
            </Typography>

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Selected Item:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {selectedItem ? selectedItem.itemName : 'No item selected'}
                </Typography>
              </Box>

              <FormControl sx={{ mb: 3 }}>
                <FormLabel>Update Type</FormLabel>
                <RadioGroup
                  row
                  value={updateType}
                  onChange={(e) => setUpdateType(e.target.value)}
                >
                  <FormControlLabel
                    value="add"
                    control={<Radio />}
                    label="Add Stock"
                  />
                  <FormControlLabel
                    value="remove"
                    control={<Radio />}
                    label="Remove Stock"
                  />
                </RadioGroup>
              </FormControl>

              <TextField
                fullWidth
                required
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                sx={{ mb: 3 }}
                disabled={!selectedItem}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason for Update"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                sx={{ mb: 3 }}
                disabled={!selectedItem}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                startIcon={<SaveIcon />}
                disabled={!selectedItem || !quantity}
              >
                Update Stock
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar || !!error}
        autoHideDuration={6000}
        onClose={() => {
          setOpenSnackbar(false);
          setError('');
        }}
      >
        <Alert
          onClose={() => {
            setOpenSnackbar(false);
            setError('');
          }}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || 'Stock updated successfully!'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UpdateStock;
