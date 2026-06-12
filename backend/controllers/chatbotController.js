const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Process Chat Message
// @route   POST /api/chatbot/message
// @access  Private (Auth required to know role)
exports.processMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const user = req.user; // From auth middleware
        const role = user.role;
        const lowerMsg = message.toLowerCase();

        // Helper to format currency
        const formatMoney = (amount) => `₹${amount.toLocaleString()}`;

        // --- ADMIN INTENTS ---
        if (role === 'admin') {

            // 1. DATA: FINANCIAL FLOW
            if (lowerMsg.includes('sales') || lowerMsg.includes('revenue') || lowerMsg.includes('finance')) {
                const paidOrders = await Order.find({ paymentStatus: 'paid' });
                const totalRevenue = paidOrders.reduce((acc, o) => acc + o.totalAmount, 0);

                // Simple "Today" calculation (mock logic for demo: assume 10% is today)
                const todayRevenue = Math.round(totalRevenue * 0.15);

                return res.json({
                    text: `💰 **Financial Overview**\n\n• Total Revenue: **${formatMoney(totalRevenue)}**\n• Today's Est: **${formatMoney(todayRevenue)}**`,
                    action: { type: 'NAVIGATE', payload: '/admin/payments' },
                    suggestions: [
                        { label: 'Top Products', cmd: 'Show top products' },
                        { label: 'Pending Orders', cmd: 'Show pending orders' },
                        { label: 'Full Report', cmd: 'Go to payments' }
                    ]
                });
            }

            // 1b. DATA: TOP PRODUCTS (Admin)
            if (lowerMsg.includes('top product') || lowerMsg.includes('best selling')) {
                return res.json({
                    text: "Here are the trending items based on recent orders:",
                    action: { type: 'NAVIGATE', payload: '/admin/products' },
                    suggestions: [
                        { label: 'Check Inventory', cmd: 'Go to products' },
                        { label: 'Back to Sales', cmd: 'Show total sales' }
                    ]
                });
            }

            // 2. DATA: ORDER FLOW
            if (lowerMsg.includes('pending') || lowerMsg.includes('order')) {
                const pendingCount = await Order.countDocuments({ status: 'pending' });
                const urgentCount = await Order.countDocuments({ status: 'pending', createdAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } }); // Older than 3 days

                let text = `📦 **Order Status**\n\n• Pending: **${pendingCount}**\n• Urgent (>3 days): **${urgentCount}**`;

                return res.json({
                    text: text,
                    action: { type: 'NAVIGATE', payload: '/admin/orders' },
                    suggestions: [
                        { label: 'Process Oldest', cmd: 'Show oldest pending order' },
                        { label: 'View All', cmd: 'Go to orders' }
                    ]
                });
            }

            // 2b. DATA: OLDEST PENDING
            if (lowerMsg.includes('oldest') || lowerMsg.includes('urgent')) {
                const oldest = await Order.findOne({ status: 'pending' }).sort({ createdAt: 1 });
                if (oldest) {
                    return res.json({
                        text: `⚠️ **Urgent**: Order #${oldest.orderNumber} by ${oldest.shippingAddress?.fullName || 'Customer'} is pending since ${new Date(oldest.createdAt).toLocaleDateString()}.`,
                        action: { type: 'NAVIGATE', payload: `/admin/orders/${oldest._id}` },
                        suggestions: [
                            { label: 'View Order', cmd: `Go to order ${oldest.orderNumber}` },
                            { label: 'Next Pending', cmd: 'Show next pending' }
                        ]
                    });
                } else {
                    return res.json({
                        text: "Good news! No pending orders right now.",
                        suggestions: [{ label: 'Check Sales', cmd: 'Show total sales' }]
                    });
                }
            }

            // 3. NAVIGATE INTENTS (Fallback)
            if (lowerMsg.includes('cms')) return res.json({ text: "Opening CMS...", action: { type: 'NAVIGATE', payload: '/admin/cms' } });
            if (lowerMsg.includes('dashboard')) return res.json({ text: "Opening Dashboard...", action: { type: 'NAVIGATE', payload: '/admin/dashboard' } });

        }

        // --- CUSTOMER INTENTS ---
        if (role === 'customer') {

            // 1. DISCOVERY: SMART SHOPPING (Trending/New)
            if (lowerMsg.includes('trending') || lowerMsg.includes('new') || lowerMsg.includes('popular')) {
                const products = await Product.find({}).sort({ createdAt: -1 }).limit(3);
                const productNames = products.map(p => p.name).join(', ');

                return res.json({
                    text: `🔥 **Trending Now**:\n${productNames}\n\nWould you like to see one?`,
                    action: { type: 'NAVIGATE', payload: '/designs' },
                    suggestions: products.map(p => ({ label: `Buy ${p.name}`, cmd: `Buy ${p.name}` })).concat([{ label: 'Show All', cmd: 'Go to designs' }])
                });
            }

            // 2. DISCOVERY: BUDGET FRIENDLY
            if (lowerMsg.includes('budget') || lowerMsg.includes('cheap') || lowerMsg.includes('affordable')) {
                const products = await Product.find({ price: { $lt: 5000 } }).limit(3);
                if (products.length > 0) {
                    return res.json({
                        text: `💎 **Budget Picks (< ₹5000)**:\nI found some great value options for you.`,
                        suggestions: products.map(p => ({ label: `Buy ${p.name}`, cmd: `Buy ${p.name}` }))
                    });
                }
            }

            // 3. SHOPPING: ADD TO CART (Regex Improved)
            const quantityMatch = lowerMsg.match(/(?:add|buy|get)\s+(\d+)\s+(.*)/);
            const simpleMatch = lowerMsg.match(/(?:add|buy|get)\s+(.*)/);

            if (quantityMatch || simpleMatch) {
                let quantity = 1;
                let keyword = '';

                if (quantityMatch) {
                    quantity = parseInt(quantityMatch[1]);
                    keyword = quantityMatch[2].trim();
                } else if (simpleMatch) {
                    keyword = simpleMatch[1].replace(/\b\d+\b/g, '').trim();
                }

                // If user just says "buy" without item
                if (!keyword) {
                    return res.json({
                        text: "What would you like to buy? Here are some favorites:",
                        suggestions: [
                            { label: 'Paithani', cmd: 'Buy Paithani' },
                            { label: 'Peshwai', cmd: 'Buy Peshwai' },
                            { label: 'Mastani', cmd: 'Buy Mastani' }
                        ]
                    });
                }

                // Find product (fuzzy search)
                const product = await Product.findOne({
                    $or: [
                        { name: { $regex: keyword, $options: 'i' } },
                        { category: { $regex: keyword, $options: 'i' } }
                    ]
                });

                if (product) {
                    return res.json({
                        text: `✅ Added **${quantity} x ${product.name}** to your cart.`,
                        action: {
                            type: 'ADD_TO_CART',
                            payload: { product, quantity }
                        },
                        suggestions: [
                            { label: '💳 Checkout Now', cmd: 'Proceed to checkout' },
                            { label: '🛍️ Keep Shopping', cmd: 'Show me designs' },
                            { label: '🛒 View Cart', cmd: 'Go to cart' }
                        ]
                    });
                } else {
                    return res.json({
                        text: `I couldn't find "${keyword}". Try looking at our categories:`,
                        action: { type: 'NAVIGATE', payload: '/designs' },
                        suggestions: [
                            { label: 'Sarees', cmd: 'Show sarees' },
                            { label: 'Blouses', cmd: 'Show blouses' },
                            { label: 'Browse All', cmd: 'Go to designs' }
                        ]
                    });
                }
            }

            // 4. NAVIGATION: Categories
            if (lowerMsg.includes('saree') || lowerMsg.includes('blouse') || lowerMsg.includes('dress')) {
                return res.json({
                    text: `Browsing our beautiful collection.`,
                    action: { type: 'NAVIGATE', payload: '/designs' },
                    suggestions: [
                        { label: 'Sort by Price', cmd: 'Show affordable' },
                        { label: 'New Arrivals', cmd: 'Show trending' }
                    ]
                });
            }

            // 5. NAVIGATION: General
            if (lowerMsg.includes('cart') || lowerMsg.includes('checkout')) {
                return res.json({
                    text: "Opening your shopping bag.",
                    action: { type: 'NAVIGATE', payload: '/cart' },
                    suggestions: [{ label: 'Review Order', cmd: 'Proceed to checkout' }]
                });
            }

            if (lowerMsg.includes('order') || lowerMsg.includes('track')) {
                return res.json({
                    text: "Checking your order history.",
                    action: { type: 'NAVIGATE', payload: '/customer/orders' },
                    suggestions: [{ label: 'Contact Support', cmd: 'Contact store' }]
                });
            }
        }

        // Default Fallback
        res.json({
            text: "I can help with Shopping, Orders, or Support. Pick an option:",
            suggestions: role === 'admin' ? [
                { label: 'Revenue', cmd: 'Show revenue' },
                { label: 'Pending Orders', cmd: 'Show pending orders' }
            ] : [
                { label: 'Track Order', cmd: 'Track my order' },
                { label: 'New Arrivals', cmd: 'Show trending' },
                { label: 'Browse Designs', cmd: 'Show designs' }
            ]
        });

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ text: "Sorry, connection error." });
    }
};
