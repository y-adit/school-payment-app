const mongoose = require('mongoose');

const orderStatusSchema = new mongoose.Schema({
    collect_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    order_amount: { type: Number, required: true },
    transaction_amount: { type: Number },
    payment_mode: { type: String },
    payment_details: { type: String },
    bank_reference: { type: String },
    payment_message: { type: String },
    status: { type: String, required: true, default: 'pending', index: true }, // pending, success, failed
    error_message: { type: String },
    payment_time: { type: Date },
}, { timestamps: true });

const OrderStatus = mongoose.model('OrderStatus', orderStatusSchema);
module.exports = OrderStatus;