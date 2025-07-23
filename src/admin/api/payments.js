"use strict";
const path = require("path");
const coreDirname = path.join(
    __dirname,
    "..",
    "..",
    "core",
    "api",

);
const base = require("../../../api/api-base")(__dirname, 'payment', "payment", coreDirname);
const service = require('../services/payment')
const paymentServices = require('../../../helpers/paymentGateway');

exports.create = async (req, res) => {
    let retVal = await base.create(req);
    return res.data(retVal);
};

exports.update = async (req, res) => {
    let retVal = await base.update(req);
    return res.data(retVal);
};

exports.search = async (req, res) => {
    let retVal = await base.search(req);
    return res.page(retVal);
};

exports.get = async (req, res) => {
    let retVal = await base.get(req);
    return res.data(retVal);
};

exports.delete = async (req, res) => {
    let retVal = await base.delete(req);
    return res.success(retVal);
};
exports.createOrderPayment = async(req,res)=>{
    try {
        const{orderId}= req.body
        const order = await db.order.findById({ _id:orderId });
        if (!order) {
            throw new Error("order not found");
        }
        if (order.isPaymentDone === true) {
            throw new Error("payment already done");     
        }
        const productDetails = {
            medicineId: order.items[0].medicineId, // Assuming 'medicineId' is part of each item
            quantity: order.items[0].quantity || 1, // Default to 1 if quantity is not specified
            totalPrice: order.totalAmount,
            userId: req.user.id, // Assuming userId is available as req.user.id
            customerEmail: req.user.email,
            orderId: order.id, // Matches productDetails._id
          };
          
        
        const paymentSession = await paymentServices.createCheckoutProductSession(productDetails);
        
        await db.order.findByIdAndUpdate(orderId, { 
            paymentSessionId: paymentSession.id 
        });
        
        return res.data({
            paymentSession,
            orderId: order._id
        });
        
    } catch (error) {
        console.error('Create Order Payment Error:', error);
        return res.send('Failed to create payment session', error);
    }
}

exports.handlePayment = async (req, res) => {
    try {
        const { sessionId } = req.query;

        const paymentResult = await paymentServices.handleOneTimePayment(sessionId);

       if(!paymentResult){
        throw new Error("payment result can`t handle");
        
       }

        // Update order status
        await db.order.findOneAndUpdate(
            { stripeSessionId: sessionId },
            { 
                isPaymentDone: true, 
                paymentStatus: 'completed',
                paidAt: new Date()
            }
        );

        return res.success('Payment processed successfully');
    } catch (error) {
        console.error('Payment error:', error);
        throw new Error("processing failed");
        
    }
};
