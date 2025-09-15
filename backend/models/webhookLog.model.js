const mongoose = require('mongoose');

const webhookLogSchema = new mongoose.Schema({
    payload: { type: Object },
    receivedAt: { type: Date, default: Date.now },
});

const WebhookLog = mongoose.model('WebhookLog', webhookLogSchema);
module.exports = WebhookLog;