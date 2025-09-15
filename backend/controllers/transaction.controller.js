const Order = require('../models/order.model');
const mongoose = require('mongoose');

// @desc    Get all transactions with filtering, sorting, and pagination
// @route   GET /api/transactions
exports.getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', status, schoolId } = req.query;

        // 1. Build the initial aggregation pipeline
        const pipeline = [];

        // 2. Match stage for filtering
        const matchStage = {};
        if (status) {
             // Handle multi-select status filter (e.g., status=success,failed)
            matchStage['status.status'] = { $in: status.split(',') };
        }
        if (schoolId) {
            // Handle multi-select schoolId filter
            matchStage['school_id'] = { $in: schoolId.split(',') };
        }
        if(Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }


        // 3. $lookup to join with OrderStatus collection
        pipeline.push({
            $lookup: {
                from: 'orderstatuses', // the collection name in mongodb
                localField: '_id',
                foreignField: 'collect_id',
                as: 'status',
            },
        });
        
        // Deconstruct the status array to a single object
        pipeline.push({
             $unwind: '$status'
        });


        // 4. Add sorting
        pipeline.push({
            $sort: { [sortBy]: order === 'asc' ? 1 : -1 }
        });

        // 5. Add pagination using $facet
        pipeline.push({
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [{ $skip: (page - 1) * limit }, { $limit: parseInt(limit) }],
            }
        });

        // 6. Execute the aggregation
        const result = await Order.aggregate(pipeline);
        
        const transactions = result[0].data;
        const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;
        
        res.status(200).json({
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
            data: transactions.map(t => ({ // Shape the response data
                collect_id: t.status.collect_id,
                school_id: t.school_id,
                gateway: t.gateway_name,
                order_amount: t.status.order_amount,
                transaction_amount: t.status.transaction_amount,
                status: t.status.status,
                custom_order_id: t.custom_order_id
            }))
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

        // Find the order by custom_order_id
        const order = await Order.findOne({ custom_order_id });

        if (!order) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Find the corresponding status
        const orderStatus = await mongoose.model('OrderStatus').findOne({ collect_id: order._id });

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