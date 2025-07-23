const moment = require('moment')

exports.totalUsers = async (req, res) => {
    try {
        // Get user role from token
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        
        if (user.role === "DISTRIBUTER") {
            // For distributors, count their dealers
            const dealerCount = await db.user.countDocuments({
                role: "DEALER",
                distributerId: user._id
            });
            return res.data({
                dealerCount
            });
        } else if (user.role === "DEALER") {
            // For dealers, just show their own details
            const userCount = await db.user.countDocuments({
                _id: user._id
            });
            return res.data({
                userCount
            });
        } else {
            // For admin or other roles, show all counts
            const dealerCount = await db.user.countDocuments({
                role: "DEALER"
            });

            const distributorCount = await db.user.countDocuments({
                role: "DISTRIBUTER"
            });

            const total = await db.user.countDocuments({
                role: { $in: ["DEALER", "DISTRIBUTER"] }
            });

            return res.data({
                total,
                dealerCount,
                distributorCount
            });
        }
    } catch (error) {
        console.error(error);
        res.failure(error);
    }
}

exports.totalProducts = async (req, res) => {
    try {
        let product = await db.product.countDocuments()
        res.data(product)
    } catch (error) {
        res.failure(error)
    }
}

exports.totalOrders = async (req, res) => {
    try {
        // Get user role from token
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        // Build query based on user role
        let query = {};
        
        if (user.role === "DISTRIBUTER") {
            // For distributors, filter orders by their dealers
            const dealerIds = await db.user.find({ distributerId: user._id }).select('_id');
            if (dealerIds.length > 0) {
                query.userId = { $in: dealerIds };
            } else {
                // Return 0 if distributor has no dealers
                return res.json({ total: 0, pending: 0, today: 0 });
            }
        } else if (user.role === "DEALER") {
            // For dealers, only show their own orders
            query.userId = user._id;
        }

        // Add status filter for pending orders
        const pendingQuery = { ...query, status: "PENDING" };
        const todayQuery = { ...query };

        // Get today's date range
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        todayQuery.createdAt = { $gte: startOfDay, $lte: endOfDay };

        // Count orders
        const [total, pending, today] = await Promise.all([
            db.order.countDocuments(query),
            db.order.countDocuments(pendingQuery),
            db.order.countDocuments(todayQuery)
        ]);

        res.data({ total, pending, today });
    } catch (error) {
        console.error(error);
        res.failure(error);
    }
};

exports.totalSale = async (req, res) => {
    try {
        // Get user role from token
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        // Build query based on user role
        let query = { status: "done" };
        
        if (user.role === "DISTRIBUTER") {
            // For distributors, filter payments by their dealers
            const dealerIds = await db.user.find({ distributerId: user._id }).select('_id');
            if (dealerIds.length > 0) {
                query.userId = { $in: dealerIds };
            } else {
                // Return 0 if distributor has no dealers
                return res.json({ totalAmount: 0 });
            }
        } else if (user.role === "DEALER") {
            // For dealers, only show their own payments
            query.userId = user._id;
        }

        const payments = await db.payment.find(query);

        if (!payments || payments.length === 0) {
            console.log("No payments with status 'done'.");
            return res.json({ totalAmount: 0 });
        }

        const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        res.json({ totalAmount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.salesDetail = async (req, res) => {
    try {
        // Get user from token
        const user = req.user;
        
        // Build query based on user role
        const query = {
            paymentStatus: "done",
            createdAt: {
                $gte: new Date(`${moment().year()}-01-01`),
                $lt: new Date(`${moment().year() + 1}-01-01`),
            }
        };

        // Add role-based filtering
        if (user.role === "DISTRIBUTER") {
            query.distributerId = user._id;
        } else if (user.role === "DEALER") {
            query.createdBy = user._id;
        }

        const salesOrderByMonth = await db.payment.aggregate([
            {
                $match: query,
            },
            {
                $project: {
                    month: { $month: "$createdAt" },
                },
            },
            {
                $group: {
                    _id: "$month",
                    orderCount: { $sum: 1 },
                },
            },
            {
                $project: {
                    month: "$_id",
                    orderCount: 1,
                    _id: 0,
                },
            },
            {
                $sort: { month: 1 },
            },
        ]);

        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const result = months.map((monthName, index) => {
            const monthData = salesOrderByMonth.find(item => item.month === index + 1);
            return {
                name: monthName,
                Sales: monthData ? monthData.orderCount : 0,
            };
        });

        return res.data(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving sales details");
    }
};

exports.outOfStock = async (req, res) => {
    try {
        const products = await db.product.find({ stock: { $lt: 20 } });
        const count = await db.product.countDocuments({ stock: { $lt: 20 } });
        res.data({ count, products });
    } catch (error) {
        res.failure(error);
    }
};

exports.incomeDetail = async (req, res) => {
    try {
        // Get user role from token
        const user = req.user;
        if (!user) {
            return res.status(401).json({ 
                isSuccess: false,
                code: 401,
                error: "User not authenticated"
            });
        }

        // Build base query
        let baseQuery = {};
        
        if (user.role === "ADMIN") {
            const userIds = await db.user.find({ 
                $or: [
                    { role: "DISTRIBUTER" },
                    { role: "USER" }
                ]
            }).select('_id');
            
            if (userIds.length > 0) {
                baseQuery.userId = { $in: userIds };
            } else {
                // Return zero amounts if no users found
                return res.json({ 
                    isSuccess: true,
                    code: 200,
                    message: "success",
                    data: {
                        totalAmount: 0,
                        pendingAmount: 0
                    }
                });
            }
        }

        if (user.role === "DISTRIBUTER") {
            // For distributors, filter payments by their dealers
            const dealerIds = await db.user.find({ distributerId: user._id }).select('_id');
            if (dealerIds.length > 0) {
                baseQuery.userId = { $in: dealerIds };
            } else {
                return res.json({ 
                    isSuccess: true,
                    code: 200,
                    message: "success",
                    data: {
                        totalAmount: 0,
                        pendingAmount: 0
                    }
                });
            }
        } else if (user.role === "DEALER") {
            // For dealers, only show their own payments
            baseQuery.userId = user._id;
        }

        // Get completed payments and calculate total amount
        const completedPayments = await db.payment.find({
            ...baseQuery,
            paymentStatus: "done"
        });
        
        const totalAmount = completedPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

        // Get pending payments and calculate pending amount
        const pendingPayments = await db.payment.find({
            ...baseQuery,
            paymentStatus: "pending"
        });
        
        const pendingAmount = pendingPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

        res.json({
            isSuccess: true,
            code: 200,
            message: "success",
            data: {
                totalAmount,
                pendingAmount
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            isSuccess: false,
            code: 500,
            error: "Failed to retrieve income details",
            message: error.message
        });
    }
};
