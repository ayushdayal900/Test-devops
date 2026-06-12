const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        // Basic Counts
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalCustomers = await User.countDocuments({ role: 'customer' });

        // Specific Status Counts
        const pendingPaymentCount = await Order.countDocuments({ paymentStatus: 'pending' });
        const inStitchingCount = await Order.countDocuments({ status: 'in_stitching' });

        // Total Revenue (Paid Orders)
        const paidOrders = await Order.find({ paymentStatus: 'paid' });
        const totalSales = paidOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

        // Revenue Trend (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revenueTrend = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Orders by Status
        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Popular Designs (Top 5)
        // Note: orderItems.product is an ObjectId. We need to lookup product details.
        const popularDesigns = await Order.aggregate([
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.product",
                    count: { $sum: "$orderItems.quantity" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    productName: { $arrayElemAt: ["$productDetails.name", 0] },
                    price: { $arrayElemAt: ["$productDetails.price", 0] }
                }
            }
        ]);

        // Recent Orders (Last 10)
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('customer', 'firstName lastName');

        res.json({
            totalOrders,
            totalProducts,
            totalCustomers,
            totalSales,
            pendingPaymentCount,
            inStitchingCount,
            revenueTrend,
            ordersByStatus,
            popularDesigns,
            recentOrders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get All Orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Order Status
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status;
            order.statusTimeline.push({
                status,
                changedBy: req.user._id,
                notes: `Status updated to ${status} by Admin`
            });

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get All Customers (with stats)
// @route   GET /api/admin/customers
// @access  Private/Admin
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await User.aggregate([
            { $match: { role: 'customer' } },
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'customer',
                    as: 'orders'
                }
            },
            {
                $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    phone: 1,
                    createdAt: 1,
                    orderCount: { $size: "$orders" },
                    totalSpent: { $sum: "$orders.totalAmount" }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        res.json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get All Payments/Transactions
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getAllPayments = async (req, res) => {
    try {
        // Fetch orders that have any payment activity (paid or pending)
        const orders = await Order.find()
            .populate('customer', 'firstName lastName email')
            .sort({ createdAt: -1 });

        // Calculate Totals
        const totalRevenue = orders
            .filter(o => o.paymentStatus === 'paid')
            .reduce((acc, o) => acc + o.totalAmount, 0);

        const pendingPayments = orders
            .filter(o => o.paymentStatus === 'pending')
            .reduce((acc, o) => acc + o.totalAmount, 0);

        // Map to standard transaction format
        const transactions = orders.map(order => ({
            _id: order._id, // Using Order ID as Transaction ID reference for now
            orderNumber: order.orderNumber,
            customer: `${order.customer?.firstName} ${order.customer?.lastName}`,
            amount: order.totalAmount,
            date: order.createdAt,
            status: order.paymentStatus,
            paymentMethod: order.paymentMethod
        }));

        res.json({
            totalRevenue,
            pendingPayments,
            transactions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete User
// @route   DELETE /api/admin/customers/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
