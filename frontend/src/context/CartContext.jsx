import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cartItems');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Error reading cart from local storage", error);
            return [];
        }
    });
    const [cartTotal, setCartTotal] = useState(0);

    // Removed the initial useEffect that loaded data, as we now do it in useState initialization

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        calculateTotal();
    }, [cartItems]);

    const calculateTotal = () => {
        const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setCartTotal(total);
    };

    const addToCart = (product) => {
        setCartItems(prevItems => {
            // New logic: Check if item with same uniqueId exists (unlikely given how we generate it, but good for safety)
            // Or if passed product doesn't have uniqueId, generate one (fallback for designs page add)
            const itemToAdd = {
                ...product,
                uniqueId: product.uniqueId || `${product._id}-${new Date().getTime()}`,
                quantity: product.quantity || 1
            };
            return [...prevItems, itemToAdd];
        });
    };

    const removeFromCart = (uniqueId) => {
        setCartItems(prevItems => prevItems.filter(item => item.uniqueId !== uniqueId));
    };

    const updateQuantity = (uniqueId, quantity) => {
        if (quantity < 1) return;
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.uniqueId === uniqueId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
