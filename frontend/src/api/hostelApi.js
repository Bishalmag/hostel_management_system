// frontend/src/api/hostelApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/hostel';

// Fetch dashboard statistics
export const getDashboardStats = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/rooms/dashboard_stats/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

// You can add other API functions here
export const getRooms = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/rooms/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching rooms:', error);
        throw error;
    }
};

export const getHostels = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/hostels/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching hostels:', error);
        throw error;
    }
};