const Razorpay = require("razorpay");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class RazorpayService {
  async createOrder(orderData) {
    try {
      const options = {
        amount: orderData.amount * 100, // Amount in paise
        currency: "INR",
        receipt: `order_${orderData.orderId}`,
        payment_capture: 1, // Auto capture payment
      };

      const order = await razorpay.orders.create(options);
      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      };
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      throw error;
    }
  }

  async verifyPayment(paymentData) {
    try {
      const details = {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      };

      const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
      hmac.update(
        details.razorpay_order_id + "|" + details.razorpay_payment_id
      );
      const generatedSignature = hmac.digest("hex");

      if (generatedSignature === details.razorpay_signature) {
        return {
          success: true,
          paymentId: details.razorpay_payment_id,
        };
      }

      return {
        success: false,
        message: "Payment verification failed",
      };
    } catch (error) {
      console.error("Razorpay verification error:", error);
      throw error;
    }
  }
}

module.exports = new RazorpayService();
