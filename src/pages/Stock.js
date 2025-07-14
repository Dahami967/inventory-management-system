import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import { itemService } from '../services/api';
import axios from 'axios';

const Stock = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStockSummary();
  }, []);

  const fetchStockSummary = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/items/stock-summary'
      );
      setItems(response.data);
    } catch (error) {
      setError('Failed to fetch stock summary');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (!term) {
      fetchStockSummary();
    } else {
      // Simple client-side filter
      setItems((prev) =>
        prev.filter((item) =>
          item.itemName.toLowerCase().includes(term.toLowerCase())
        )
      );
    }
  };

  const columns = [
    { field: 'itemName', headerName: 'Item Name', flex: 1, minWidth: 180 },
    { field: 'totalQuantity', headerName: 'Total Stock', type: 'number', width: 130 },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Stock
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
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
            <Box sx={{ height: 500 }}>
              <DataGrid
                rows={items}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                loading={loading}
                getRowId={(row) => row.itemName}
                sx={{
                  '& .MuiDataGrid-row': {
                    cursor: 'pointer',
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
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
    </Box>
  );
};

export default Stock;
