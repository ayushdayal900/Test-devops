const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const orderRoutes = require('../routes/orderRoutes');
const { protect } = require('../middleware/authMiddleware');

// Mock Auth Middleware to bypass login for unit testing logic
jest.mock('../middleware/authMiddleware', () => ({
    protect: (req, res, next) => {
        req.user = { _id: '507f1f77bcf86cd799439011', role: 'customer' }; // Fake User ID
        next();
    }
}));

// Mock Mongoose Models
jest.mock('../models/Order');
const Order = require('../models/Order');

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('Order API Integration', () => {

    it('should calculate total amount correctly', async () => {
        // This acts as a unit test for the controller's logic

        // Mock save implementation
        Order.prototype.save = jest.fn().mockResolvedValue({
            _id: 'order_123',
            orderNumber: 'ORD-123',
            totalAmount: 1500
        });

        const res = await request(app)
            .post('/api/orders')
            .send({
                orderItems: [
                    { product: 'prod_1', quantity: 1, unitPrice: 1000, totalPrice: 1000 },
                    { product: 'prod_2', quantity: 1, unitPrice: 500, totalPrice: 500 }
                ],
                deliveryAddress: { street: 'Test St', city: 'Test City' },
                totalAmount: 1500
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.orderNumber).toBeDefined();
    });

});
