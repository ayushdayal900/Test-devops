import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    RadialLinearScale,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie, PolarArea, Radar } from 'react-chartjs-2';
import api from '../../services/api';
import { Loader, AlertTriangle } from 'lucide-react';

// Register ChartJS Components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AnalyticsDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await api.get('/analytics/dashboard', config);
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Analytics Fetch Error:", err);
                setError("Failed to load analytics data.");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center p-12"><Loader className="animate-spin text-brand-maroon" size={32} /></div>;
    if (error) return <div className="p-8 text-red-500 bg-red-50 rounded-lg flex items-center gap-2"><AlertTriangle /> {error}</div>;
    if (!data) return null;

    // --- Helpers for Chart Data ---

    // Generic Options
    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom' },
        },
        maintainAspectRatio: false,
    };

    // 1. Daily Revenue Trend (Line)
    const revenueData = {
        labels: data.dailyTrend.map(d => d._id),
        datasets: [
            {
                label: 'Revenue (₹)',
                data: data.dailyTrend.map(d => d.revenue),
                borderColor: 'rgb(220, 38, 38)', // Red-600
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                tension: 0.4,
                fill: true,
            }
        ]
    };

    // 2. Daily Orders (Bar)
    const ordersData = {
        labels: data.dailyTrend.map(d => d._id),
        datasets: [
            {
                label: 'Orders',
                data: data.dailyTrend.map(d => d.orders),
                backgroundColor: 'rgba(59, 130, 246, 0.7)', // Blue-500
            }
        ]
    };

    // 3. Status Distribution (Doughnut)
    const statusData = {
        labels: data.statusDistribution.map(d => d._id.replace('_', ' ').toUpperCase()),
        datasets: [
            {
                data: data.statusDistribution.map(d => d.count),
                backgroundColor: [
                    '#16a34a', // Green (Completed)
                    '#eab308', // Yellow (Pending)
                    '#3b82f6', // Blue (Ready)
                    '#a855f7', // Purple (Stitching)
                    '#ef4444', // Red (Cancelled)
                    '#6366f1', // Indigo (Dispatched)
                ],
                borderWidth: 1,
            }
        ]
    };

    // 4. Payment Methods (Pie)
    const paymentData = {
        labels: data.paymentMethods.map(d => d._id || 'Unspecified'),
        datasets: [
            {
                data: data.paymentMethods.map(d => d.count),
                backgroundColor: ['#881337', '#ca8a04', '#1e3a8a', '#4b5563'], // Maroon, Gold, Navy, Gray
            }
        ]
    };

    // 5. Top Cities (Horizontal Bar - simulated by index axis y)
    const cityData = {
        labels: data.topCities.map(d => d._id),
        datasets: [{
            label: 'Orders by City',
            data: data.topCities.map(d => d.count),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        }]
    };
    const cityOptions = { ...options, indexAxis: 'y' };

    // 6. Popular Fabrics (Polar Area or Bar)
    const fabricData = {
        labels: data.popularFabrics.map(d => d._id),
        datasets: [{
            label: 'Fabric Selected',
            data: data.popularFabrics.map(d => d.count),
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)',
            ],
            borderWidth: 1,
        }]
    };

    // 7. Analysis of Week Total Revenue
    const dowLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // Map backend 1-7 (Sun-Sat) to array indices
    const dowRevenue = new Array(7).fill(0);
    const dowCount = new Array(7).fill(0);
    data.dayOfWeekStats.forEach(item => {
        dowRevenue[item._id - 1] = item.revenue;
        dowCount[item._id - 1] = item.count;
    });

    const dowData = {
        labels: dowLabels,
        datasets: [
            {
                type: 'bar',
                label: 'Revenue (₹)',
                data: dowRevenue,
                backgroundColor: 'rgba(220, 38, 38, 0.7)',
                yAxisID: 'y',
            },
            {
                type: 'line',
                label: 'Order Count',
                data: dowCount,
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
                yAxisID: 'y1',
            }
        ]
    };
    const dowOptions = {
        ...options,
        scales: {
            y: { type: 'linear', display: true, position: 'left' },
            y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } },
        }
    };

    // 8. Monthly Revenue (Bar)
    const monthlyData = {
        labels: data.monthlyRevenue.map(d => d._id),
        datasets: [{
            label: 'Monthly Revenue',
            data: data.monthlyRevenue.map(d => d.revenue),
            backgroundColor: '#881337', // Brand Dark Red
        }]
    };

    // 9. Price Brackets (Bar)
    const priceData = {
        labels: ['0-1k', '1k-2.5k', '2.5k-5k', '5k-10k', '10k-50k', '50k+'],
        // Map backend buckets to these labels is tricky without processing order, assuming they come in order of definition
        // Actually aggregate returns buckets. Let's map carefully.
        // Simplified: use data from buckets found
        // data.priceBrackets is array of { _id: lowerBound, count }
        // We'll trust the order or map manually if complex.
    };
    // Re-mapping price brackets properly
    const bracketsMap = { 0: '0-1k', 1000: '1k-2.5k', 2500: '2.5k-5k', 5000: '5k-10k', 10000: '10k-50k', 50000: '50k+' };
    const priceLabels = [];
    const priceCounts = [];

    // Sort brackets
    data.priceBrackets.sort((a, b) => a._id - b._id).forEach(b => {
        priceLabels.push(bracketsMap[b._id] || b._id);
        priceCounts.push(b.count);
    });

    const priceChartData = {
        labels: priceLabels,
        datasets: [{
            label: 'Orders by Value',
            data: priceCounts,
            backgroundColor: '#059669', // Emerald
        }]
    };

    // 10. Customer Growth (Line - Area)
    const customerData = {
        labels: data.customerGrowth.map(d => d._id),
        datasets: [{
            label: 'New Customers',
            data: data.customerGrowth.map(d => d.count),
            borderColor: '#9333ea', // Purple
            backgroundColor: 'rgba(147, 51, 234, 0.2)',
            fill: true,
            tension: 0.4
        }]
    };

    // 11. Category Distribution (Pie)
    const categoryData = {
        labels: data.categoryStats.map(d => d._id),
        datasets: [{
            data: data.categoryStats.map(d => d.count),
            backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
            ]
        }]
    };

    // 12. AOV Trend (Line)
    const aovData = {
        labels: data.dailyTrend.map(d => d._id),
        datasets: [{
            label: 'Avg Order Value (₹)',
            data: data.dailyTrend.map(d => Math.round(d.aov)),
            borderColor: '#d97706', // Amber
            backgroundColor: 'transparent',
            tension: 0.1
        }]
    };


    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-serif font-bold text-gray-800 border-b pb-4">Advanced Analytics</h2>

            {/* Row 1: Key Performance Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Revenue Trend (30 Days)</h3>
                    <Line data={revenueData} options={options} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Order Volume (30 Days)</h3>
                    <Bar data={ordersData} options={options} />
                </div>
            </div>

            {/* Row 2: Distributions (3 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Order Status</h3>
                    <Doughnut data={statusData} options={options} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Payment Methods</h3>
                    <Pie data={paymentData} options={options} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Category Sales</h3>
                    <Pie data={categoryData} options={options} />
                </div>
            </div>

            {/* Row 3: Customer & Location */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Top 10 Cities</h3>
                    <Bar data={cityData} options={cityOptions} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">New Customer Growth</h3>
                    <Line data={customerData} options={options} />
                </div>
            </div>

            {/* Row 4: Product & Weekly Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Popular Fabrics</h3>
                    <PolarArea data={fabricData} options={options} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Order Value Distribution</h3>
                    <Bar data={priceChartData} options={options} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Average Order Value Trend</h3>
                    <Line data={aovData} options={options} />
                </div>
            </div>

            {/* Row 5: Long Term & Weekly */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">This Week's Performance</h3>
                    <ChartJSType type='bar' data={dowData} options={dowOptions} />
                    {/* Note: React Chartjs 2 doesn't export 'Chart', using generic Bar with multi-type dataset works if registered controllers. Mix requires 'Chart' component usually or just Bar with type overriding */}
                    {/* Workaround for Mixed Chart: Use 'Bar' but specify type in dataset. 'Bar' component supports mixed if controller registered. */}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Monthly Revenue (6 Months)</h3>
                    <Bar data={monthlyData} options={options} />
                </div>
            </div>
        </div>
    );
};

// Helper for Mixed Chart (Day of Week)
import { Chart } from 'react-chartjs-2';
const ChartJSType = ({ type, data, options }) => {
    return <Chart type={type} data={data} options={options} />;
};


export default AnalyticsDashboard;
