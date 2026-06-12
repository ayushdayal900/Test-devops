const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET',
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
exports.createPaymentOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId).populate('customer');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const amountInPaise = Math.round(order.totalAmount * 100);

        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_${order.orderNumber}`,
            notes: {
                order_id: order._id.toString(),
                order_number: order.orderNumber
            }
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Save Payment Intent
        await Payment.create({
            order: order._id,
            razorpay_order_id: razorpayOrder.id,
            amount: order.totalAmount,
            status: 'created'
        });

        // Return details for frontend
        res.json({
            razorpay_order_id: razorpayOrder.id,
            amount: amountInPaise,
            currency: 'INR',
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
            customer_name: `${order.customer.firstName} ${order.customer.lastName}`,
            customer_email: order.customer.email,
            customer_contact: order.customer.phone,
            description: `Order #${order.orderNumber}`
        });

    } catch (error) {
        console.error("Razorpay Create Order Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET')
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        // 1. Update Payment Record
        const payment = await Payment.findOne({ razorpay_order_id });
        if (payment) {
            payment.razorpay_payment_id = razorpay_payment_id;
            payment.razorpay_signature = razorpay_signature;
            payment.status = 'captured';
            payment.paid_at = new Date();
            await payment.save();

            // 2. Update Order Status
            const order = await Order.findById(payment.order);
            if (order) {
                order.paymentStatus = 'paid';
                order.status = 'measurements_confirmed';
                order.statusTimeline.push({
                    status: 'measurements_confirmed',
                    notes: `Payment Verified (ID: ${razorpay_payment_id})`,
                    changedAt: Date.now()
                });
                await order.save();

                // TODO: Send Email Notification Logic Here
            }
        }

        return res.json({ success: true, message: "Payment verified successfully" });

    } catch (error) {
        console.error("Razorpay Verify Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Handle Razorpay Webhook
// @route   POST /api/payments/webhook
// @access  Public (Validated by Header)
exports.handleRazorpayWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'YOUR_WEBHOOK_SECRET';
        const signature = req.headers['x-razorpay-signature'];

        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (generated_signature !== signature) {
            return res.status(401).json({ message: 'Invalid webhook signature' });
        }

        const { event, payload } = req.body;

        if (event === 'payment.captured') {
            const paymentEntity = payload.payment.entity;
            const orderId = paymentEntity.notes.order_id; // Retrieve our local order ID from notes

            // Idempotency: Check if already marked paid
            const order = await Order.findById(orderId);
            if (order && order.paymentStatus !== 'paid') {
                // Update Order
                order.paymentStatus = 'paid';
                order.status = 'measurements_confirmed';
                order.statusTimeline.push({
                    status: 'measurements_confirmed',
                    notes: `Webhook: Payment Captured (ID: ${paymentEntity.id})`,
                    changedAt: Date.now()
                });
                await order.save();

                // Update Payment Record
                await Payment.findOneAndUpdate(
                    { razorpay_order_id: paymentEntity.order_id },
                    {
                        status: 'captured',
                        razorpay_payment_id: paymentEntity.id,
                        paid_at: new Date()
                    }
                );
                console.log(`Webhook: Payment captured for Order ${order.orderNumber}`);
            }
        } else if (event === 'payment.failed') {
            // Handle failure logging if needed
            const paymentEntity = payload.payment.entity;
            await Payment.findOneAndUpdate(
                { razorpay_order_id: paymentEntity.order_id },
                {
                    status: 'failed',
                    error_code: paymentEntity.error_code,
                    error_description: paymentEntity.error_description
                }
            );
        }

        res.json({ status: 'ok' });
    } catch (error) {
        console.error("Webhook Error", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
