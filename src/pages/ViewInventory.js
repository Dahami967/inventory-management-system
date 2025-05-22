import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import { itemService } from '../services/api';
import { formatLKR } from '../utils/formatters';

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

const ViewInventory = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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
    </Box>
  );
};

export default ViewInventory;
