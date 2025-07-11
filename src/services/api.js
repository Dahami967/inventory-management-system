import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: BASE_URL
});

export const itemService = {
    // Get all items
    getAllItems: async () => {
        const response = await api.get('/items');
        return response.data;
    },

    // Get single item
    getItem: async (id) => {
        const response = await api.get(`/items/${id}`);
        return response.data;
    },

    // Create new item
    createItem: async (itemData) => {
        const response = await api.post('/items', itemData);
        return response.data;
    },

    // Update item
    updateItem: async (id, itemData) => {
        const response = await api.put(`/items/${id}`, itemData);
        return response.data;
    },

    // Delete item
    deleteItem: async (id) => {
        const response = await api.delete(`/items/${id}`);
        return response.data;
    },

    // Search items
    searchItems: async (query) => {
        const response = await api.get(`/items/search?query=${query}`);
        return response.data;
    },

    // Get low stock items
    getLowStockItems: async () => {
        const response = await api.get('/items/low-stock');
        return response.data;
    },

    // Update stock
    updateStock: async (id, updateData) => {
        const response = await api.put(`/items/${id}/stock`, updateData);
        return response.data;
    }
};

export const reportService = {
  getInventoryReports: (dateRange) => {
    const url = dateRange ? `/reports?dateRange=${dateRange}` : '/reports';
    return api.get(url).then(r => r.data);
  },

  createSnapshot: () =>
    api.post('/reports/snapshot').then(r => r.data),
};

// User authentication
export const loginUser = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};



