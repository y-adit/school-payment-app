const axios = require("axios");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid"); // To generate unique order IDs
const Order = require("../models/order.model");
const OrderStatus = require("../models/orderStatus.model");
const WebhookLog = require("../models/webhookLog.model");

// Decide API endpoint based on env
const PAYMENT_GATEWAY_URL =
  process.env.PAYMENT_ENV === "production"
    ? process.env.PAYMENT_GATEWAY_PROD
    : process.env.PAYMENT_GATEWAY_SANDBOX;

// @desc    Create a new payment request
// @route   POST /api/payment/create
exports.createPayment = async (req, res) => {
  const { student_info, order_amount } = req.body;

  // 1. Validate input
  if (!student_info || !student_info.name || !student_info.email || !order_amount) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // 2. Create a unique custom order ID
    const custom_order_id = uuidv4();

    // 3. Save initial order data to our DB
    const newOrder = new Order({
      school_id: process.env.SCHOOL_ID,
      student_info,
      custom_order_id,
    });
    const savedOrder = await newOrder.save();

    const newOrderStatus = new OrderStatus({
      collect_id: savedOrder._id,
      order_amount: order_amount,
      status: "pending",
    });
    await newOrderStatus.save();

    // 4. Construct the payload for the payment gateway
    const payload = {
      pg_key: process.env.PG_KEY,
      school_id: process.env.SCHOOL_ID,
      collect_id: savedOrder._id.toString(), // The ID from our Order schema
      custom_order_id: custom_order_id,
      order_amount: order_amount.toString(),
    };

    // 5. Sign the payload with the API key
    const signedPayload = jwt.sign(payload, process.env.PAYMENT_API_KEY);

    // 6. Send request to payment gateway
    const response = await axios.post(PAYMENT_GATEWAY_URL, { data: signedPayload });

    // 7. Return the payment link to the client
    if (response.data && response.data.status === "Success") {
      res.status(200).json({ payment_url: response.data.data });
    } else {
      // If the gateway fails, update our status
      await OrderStatus.findOneAndUpdate(
        { collect_id: savedOrder._id },
        { status: "failed", error_message: response.data.message || "Gateway error" }
      );
      res
        .status(400)
        .json({ message: response.data.message || "Failed to create payment link" });
    }
  } catch (error) {
    console.error(
      "Payment creation error:",
      error.response?.status,
      error.response?.statusText,
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Payment gateway unreachable or misconfigured",
      error: error.response?.data || error.message,
    });
  }
};

// @desc    Handle incoming webhooks from the payment gateway
// @route   POST /api/payment/webhook
exports.handleWebhook = async (req, res) => {
  const payload = req.body;

  try {
    // 1. Log the entire payload for auditing
    await WebhookLog.create({ payload });

    // 2. Extract key information from the payload
    const { order_id, transaction_amount, status, bank_ref_num, message } = payload;

    // The 'order_id' from the webhook corresponds to our 'collect_id'
    if (!order_id) {
      return res.status(400).send("Webhook received without order_id.");
    }

    // 3. Find and update the order status in our DB
    const updatedStatus = await OrderStatus.findOneAndUpdate(
      { collect_id: order_id },
      {
        transaction_amount: transaction_amount,
        status: status.toLowerCase(), // e.g., 'Success' -> 'success'
        bank_reference: bank_ref_num,
        payment_message: message,
        payment_time: new Date(),
      },
      { new: true } // Return the updated document
    );

    if (!updatedStatus) {
      console.warn(`Webhook received for non-existent collect_id: ${order_id}`);
      // Still send a 200 so the gateway doesn't retry
      return res
        .status(200)
        .send(`Order with collect_id ${order_id} not found, but webhook acknowledged.`);
    }

    console.log(`Successfully updated status for collect_id: ${order_id} to ${status}`);

    // 4. Respond with a 200 OK to acknowledge receipt
    res.status(200).send("Webhook received successfully.");
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Error processing webhook.");
  }
};
