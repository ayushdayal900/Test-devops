import React, { createContext, useState, useEffect, useContext } from 'react';
import { getWishlist, toggleWishlist as apiToggleWishlist } from '../services/api';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const { token, user, loading: authLoading } = useContext(AuthContext);

    useEffect(() => {
        if (authLoading) return; // Wait for auth to initialize

        if (token && user) {
            fetchWishlist();
        } else {
            setWishlistItems([]);
            setWishlistCount(0);
        }
    }, [token, user, authLoading]);

    const fetchWishlist = async () => {
        try {
            const data = await getWishlist();
            // Assuming data.products is the array of items
            const items = data.products || [];
            setWishlistItems(items);
            setWishlistCount(items.length);
        } catch (error) {
            console.error("Error fetching wishlist in context:", error);
        }
    };

    const toggleWishlist = async (product) => {
        if (!token) {
            alert("Please login to add items to your wishlist.");
            return false;
        }

        try {
            // Optimistic update
            const exists = wishlistItems.find(item => item._id === product._id);
            let newItems;

            if (exists) {
                newItems = wishlistItems.filter(item => item._id !== product._id);
            } else {
                newItems = [...wishlistItems, product];
            }

            setWishlistItems(newItems);
            setWishlistCount(newItems.length);

            // API call
            await apiToggleWishlist(product._id);

            // Optional: re-fetch to ensure sync, or trust optimistic
            // fetchWishlist(); 
            return !exists; // Returns true if added, false if removed
        } catch (error) {
            console.error("Error toggling wishlist:", error);
            // Revert on error
            fetchWishlist();
            return null;
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item._id === productId);
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            wishlistCount,
            toggleWishlist,
            isInWishlist,
            fetchWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
