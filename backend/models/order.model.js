const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    school_id: { type: String, required: true, index: true },
    trustee_id: { type: String },
    student_info: {
        name: { type: String, required: true },
        id: { type: String },
        email: { type: String }
    },
    gateway_name: { type: String, default: 'EduVanz' },
    // This will be our custom, unique ID for the payment link
    custom_order_id: { type: String, required: true, unique: true, index: true },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;