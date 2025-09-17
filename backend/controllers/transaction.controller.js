const Order = require('../models/order.model');
const OrderStatus = require('../models/orderStatus.model');

// @desc    Get all transactions (Simplified Logic)
// @route   GET /api/transactions
exports.getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, schoolId } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (status) {
            query.status = status;
        }
        if (schoolId) {
            // We need to find the order first to filter by schoolId
            const orders = await Order.find({ school_id: schoolId }).select('_id');
            const orderIds = orders.map(o => o._id);
            query.collect_id = { $in: orderIds };
        }

        const statuses = await OrderStatus.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('collect_id') // IMPORTANT: This joins the data
            .lean();

        const total = await OrderStatus.countDocuments(query);

        const formattedData = statuses.map(s => ({
            collect_id: s.collect_id._id,
            school_id: s.collect_id.school_id,
            gateway: s.collect_id.gateway_name,
            order_amount: s.order_amount,
            transaction_amount: s.transaction_amount,
            status: s.status,
            custom_order_id: s.collect_id.custom_order_id,
        }));

        res.status(200).json({
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
            data: formattedData,
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get transaction status by its custom order ID
// @route   GET /api/transactions/status/:custom_order_id
exports.getTransactionStatus = async (req, res) => {
    try {
        const { custom_order_id } = req.params;
        const order = await Order.findOne({ custom_order_id });

        if (!order) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const orderStatus = await OrderStatus.findOne({ collect_id: order._id });

        if (!orderStatus) {
            return res.status(404).json({ message: 'Transaction status not found' });
        }

        res.status(200).json({
            custom_order_id: order.custom_order_id,
            status: orderStatus.status,
            order_amount: orderStatus.order_amount,
            transaction_amount: orderStatus.transaction_amount,
            payment_time: orderStatus.payment_time
        });
    } catch (error) {
        console.error('Error fetching transaction status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};