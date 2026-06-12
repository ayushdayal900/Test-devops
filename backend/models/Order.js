const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    selectedFabric: String,
    selectedCustomizations: {
        type: Map,
        of: String
    },
    referenceImages: [{
        url: String,
        uploadedAt: Date
    }],
    unitPrice: Number,
    totalPrice: Number,
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderItems: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    status: {
        type: String,
        enum: ['pending', 'measurements_confirmed', 'in_stitching', 'ready', 'dispatched', 'completed', 'cancelled'],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Online'],
        default: 'Online'
    },
    // We can store a snapshot or reference an address ID. Storing snapshot is better for history.
    measurementProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Measurement',
    },
    specialNotes: String,
    expectedDeliveryDate: Date,
    statusTimeline: [{
        status: { type: String },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: String,
        changedAt: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        index: true // Index for date filtering
    }

}, {
    timestamps: true,
});

// Indexes for common queries
orderSchema.index({ customer: 1, createdAt: -1 }); // Optimize "My Orders"
// orderSchema.index({ orderNumber: 1 }); // Already indexed by unique: true
orderSchema.index({ status: 1 }); // Optimize Admin Status Filters

module.exports = mongoose.model('Order', orderSchema);
