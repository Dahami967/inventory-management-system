import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import { itemService } from '../services/api';
import { formatLKR } from '../utils/formatters';

const ViewInventory = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await itemService.getAllItems();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
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

  const handleDelete = async () => {
    try {
      if (!itemToDelete || !itemToDelete.id) {
        throw new Error('Invalid item selected for deletion');
      }
      
      const response = await itemService.deleteItem(itemToDelete.id);
      if (response) {
        setSnackbar({
          open: true,
          message: 'Item deleted successfully',
          severity: 'success',
        });
        await fetchItems(); // Refresh the list
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || 'Error deleting item',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
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
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            setItemToDelete(params.row);
            setDeleteDialogOpen(true);
          }}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        View Inventory
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper sx={{ height: 600 }}>
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
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {itemToDelete?.itemName}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ViewInventory;
