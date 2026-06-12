const Order = require('../models/Order');
const Product = require('../models/Product');

const sendEmail = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const {
            orderItems,
            deliveryAddress,
            measurementProfileId,
            totalAmount,
            specialNotes,
            paymentMethod
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Generate Order Number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Determine initial status based on payment method
        let orderStatus = 'pending';
        let timeline = [{
            status: 'pending',
            notes: 'Order placed by customer',
            changedAt: Date.now()
        }];

        if (paymentMethod === 'COD') {
            orderStatus = 'measurements_confirmed';
            timeline.push({
                status: 'measurements_confirmed',
                notes: 'Auto-confirmed for COD',
                changedAt: Date.now()
            });
        }

        const order = new Order({
            orderNumber,
            customer: req.user.id,
            orderItems,
            totalAmount,
            deliveryAddress,
            measurementProfile: measurementProfileId,
            specialNotes,
            paymentMethod,
            status: orderStatus,
            statusTimeline: timeline
        });

        const createdOrder = await order.save();

        const { getEmailTemplate } = require('../utils/emailTemplates');

        // Send Confirmation Email
        try {
            await sendEmail({
                email: req.user.email,
                subject: `Order Confirmation - ${orderNumber}`,
                message: `Thank you for your order! Your order ID is ${orderNumber}. We will notify you once it ships.`,
                html: getEmailTemplate(
                    'Order Confirmed!',
                    `<p>Thank you for shopping with us. Your order <strong>${orderNumber}</strong> has been received.</p>
                     <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
                     <p>We will notify you once your stitching begins!</p>`,
                    'https://mahalaxmi-tailors.shop/customer/dashboard',
                    'View Order'
                )
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue without failing the request
        }

        res.status(201).json(createdOrder);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user.id })
            .populate('orderItems.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'firstName lastName email')
            .populate('orderItems.product')
            .populate('measurementProfile');

        if (order) {
            // Check if user is owner or admin
            if (order.customer._id.toString() !== req.user.id && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized to view this order' });
            }
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
