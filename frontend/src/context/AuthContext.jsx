import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null); // No localStorage access

    // Configure api defaults
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Load user on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                // 1. Try to get new access token via refresh token (Cookie or Body)
                const storedRefreshToken = localStorage.getItem('refreshToken');
                // Use POST for refresh to support body payload
                const res = await api.post('/auth/refresh', { refreshToken: storedRefreshToken });

                setToken(res.data.token);

                // 2. Load user data
                api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                const userRes = await api.get('/auth/me');
                setUser(userRes.data);
            } catch (error) {
                // Not logged in or refresh failed
                setToken(null);
                setUser(null);
                // Clear any leftover junk
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // Inactivity Tracker
    useEffect(() => {
        if (!user) return; // Only track if user is logged in

        const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes in milliseconds

        const updateActivity = () => {
            // Simple throttling: only update if 1 second has passed since last update
            const now = Date.now();
            const lastUpdate = parseInt(localStorage.getItem('lastActivity') || '0', 10);
            if (now - lastUpdate > 1000) {
                localStorage.setItem('lastActivity', now.toString());
            }
        };

        const checkInactivity = () => {
            const lastActivity = localStorage.getItem('lastActivity');
            if (lastActivity) {
                const diff = Date.now() - parseInt(lastActivity, 10);
                if (diff > INACTIVITY_LIMIT) {
                    console.log('User inactive for too long, logging out...');
                    logout();
                    alert('You have been logged out due to inactivity.');
                }
            } else {
                localStorage.setItem('lastActivity', Date.now().toString());
            }
        };

        // Listeners for activity
        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('click', updateActivity);
        window.addEventListener('scroll', updateActivity);

        // Check every minute
        const intervalId = setInterval(checkInactivity, 60 * 1000);

        // Initial check on mount/login
        localStorage.setItem('lastActivity', Date.now().toString());

        return () => {
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
            window.removeEventListener('click', updateActivity);
            window.removeEventListener('scroll', updateActivity);
            clearInterval(intervalId);
        };
    }, [user]); // Re-run when user status changes

    // Login
    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            setToken(res.data.token);
            setUser(res.data);
            if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken); // Save Refresh Token
            localStorage.setItem('lastActivity', Date.now().toString());
            return { success: true, role: res.data.role };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    // Register
    const register = async (userData) => {
        try {
            const res = await api.post('/auth/register', userData);
            setToken(res.data.token);
            setUser(res.data);
            if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken); // Save Refresh Token
            localStorage.setItem('lastActivity', Date.now().toString());
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    // Logout
    const logout = async (skipApi = false) => {
        if (!skipApi) {
            try {
                await api.post('/auth/logout');
            } catch (error) {
                console.error("Logout failed", error);
            }
        }
        setToken(null);
        setUser(null);
        localStorage.removeItem('refreshToken'); // Clear Refresh Token
        localStorage.removeItem('lastActivity');
    };

    // Listen for axios interceptor logout event
    useEffect(() => {
        const handleLogoutEvent = () => logout(true); // Skip API call on forced logout
        document.addEventListener('auth:logout', handleLogoutEvent);
        return () => document.removeEventListener('auth:logout', handleLogoutEvent);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser: setUser }}>
            {children}
        </AuthContext.Provider>
    );
};


