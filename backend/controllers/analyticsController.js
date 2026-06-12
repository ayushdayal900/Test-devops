const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get Advanced Analytics Data
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalyticsDashboard = async (req, res) => {
    try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Huge Aggregation Pipeline using Facets
        const analytics = await Order.aggregate([
            {
                $facet: {
                    // 1. Revenue & Orders Trend (Daily - Last 30 Days)
                    dailyTrend: [
                        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                                revenue: { $sum: "$totalAmount" },
                                orders: { $sum: 1 },
                                aov: { $avg: "$totalAmount" }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    // 2. Order Status Distribution
                    statusDistribution: [
                        { $group: { _id: "$status", count: { $sum: 1 } } }
                    ],
                    // 3. Payment Method Split
                    paymentMethods: [
                        { $group: { _id: "$paymentMethod", count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } }
                    ],
                    // 4. City Distribution (Top 10)
                    topCities: [
                        { $match: { "deliveryAddress.city": { $exists: true, $ne: "" } } },
                        { $group: { _id: "$deliveryAddress.city", count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 10 }
                    ],
                    // 5. Popular Fabrics (from Order Items)
                    popularFabrics: [
                        { $unwind: "$orderItems" },
                        { $match: { "orderItems.selectedFabric": { $exists: true, $ne: null } } },
                        { $group: { _id: "$orderItems.selectedFabric", count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 8 }
                    ],
                    // 6. Orders by Day of Week
                    dayOfWeekStats: [
                        {
                            $project: {
                                dayOfWeek: { $dayOfWeek: "$createdAt" }, // 1 (Sun) - 7 (Sat)
                                totalAmount: 1
                            }
                        },
                        {
                            $group: {
                                _id: "$dayOfWeek",
                                count: { $sum: 1 },
                                revenue: { $sum: "$totalAmount" }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    // 7. Monthly Revenue (Last 6 Months)
                    monthlyRevenue: [
                        { $match: { createdAt: { $gte: sixMonthsAgo } } },
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                                revenue: { $sum: "$totalAmount" },
                                orders: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    // 8. Order Value Price Brackets
                    priceBrackets: [
                        {
                            $bucket: {
                                groupBy: "$totalAmount",
                                boundaries: [0, 1000, 2500, 5000, 10000, 50000],
                                default: "50000+",
                                output: {
                                    count: { $sum: 1 }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        // Separate Aggregations for Users and Products (as they are different collections)

        // 9. Customer Growth (New Users per month - Last 6 months)
        const customerGrowth = await User.aggregate([
            { $match: { role: 'customer', createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 10. Category Distribution (Products)
        const categoryStats = await Product.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "catDetails"
                }
            },
            {
                $group: {
                    _id: { $arrayElemAt: ["$catDetails.name", 0] },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Refine Data Structure for Frontend
        const data = analytics[0];

        res.json({
            dailyTrend: data.dailyTrend,
            statusDistribution: data.statusDistribution,
            paymentMethods: data.paymentMethods,
            topCities: data.topCities,
            popularFabrics: data.popularFabrics,
            dayOfWeekStats: data.dayOfWeekStats,
            monthlyRevenue: data.monthlyRevenue,
            priceBrackets: data.priceBrackets,
            customerGrowth,
            categoryStats
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
