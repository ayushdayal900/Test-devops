import axios from 'axios';

axios.defaults.withCredentials = true;


let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Ensure baseURL ends with /api
if (baseURL && !baseURL.endsWith('/api') && !baseURL.endsWith('/api/')) {
    baseURL = baseURL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
    baseURL,
    withCredentials: true, // Allow cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response Interceptor for Token Refresh
api.interceptors.request.use(
    (config) => {
        const auth = config.headers['Authorization'];
        if (auth && (auth.includes('null') || auth.includes('undefined'))) {
            delete config.headers['Authorization'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loops
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/logout') && !originalRequest.url.includes('/auth/refresh') && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/register')) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh token
                const storedRefreshToken = localStorage.getItem('refreshToken');
                console.log('DEBUG: Frontend Interceptor - Refresh Token:', storedRefreshToken ? 'Present' : 'Missing');
                const res = await api.post('/auth/refresh', { refreshToken: storedRefreshToken });
                const newAccessToken = res.data.token;

                if (newAccessToken) {
                    // Update default header
                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - User must login again
                document.dispatchEvent(new Event('auth:logout'));
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const getProducts = async () => {
    try {
        const response = await api.get('/products');
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

// Get Single Product by ID
export const getProductById = async (id) => {
    try {
        const response = await api.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        throw error;
    }
};

export const getCategories = async () => {
    try {
        const response = await api.get('/categories');
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};

// Measurements API
export const getAppointments = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.get('/appointments', config);
    return response.data;
};

export const getMeasurements = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.get('/measurements', config);
    return response.data;
};

export const updateMeasurements = async (data, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.post('/measurements', data, config);
    return response.data;
};

// Wishlist API
export const getWishlist = async () => {
    const response = await api.get('/wishlist');
    return response.data;
};

export const toggleWishlist = async (productId, type = 'Product') => {
    const response = await api.post('/wishlist/toggle', { productId, type });
    return response.data;
};

// Reviews API
export const addReview = async (data) => {
    const response = await api.post('/reviews', data);
    return response.data;
};

export const getProductReviews = async (productId) => {
    const response = await api.get(`/reviews/${productId}`);
    return response.data;
};

// Appointment API
export const bookAppointment = async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
};



export const getAllAppointments = async () => {
    const response = await api.get('/appointments/admin/all');
    return response.data;
};

export const updateAppointmentStatus = async (id, status) => {
    const response = await api.put(`/appointments/${id}/status`, { status });
    return response.data;
};

export default api;
