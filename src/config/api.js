// API Configuration
// Automatically uses the correct backend URL based on environment

const getApiUrl = () => {
    // Check if we're in development (localhost) or production (Vercel)
    if (import.meta.env.DEV) {
        // Development: Use Vite proxy
        return '/api';
    } else {
        // Production: Use Render backend
        return 'https://know-your-power.onrender.com/api';
    }
};

export const API_URL = getApiUrl();
