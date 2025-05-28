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
