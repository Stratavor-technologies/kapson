const membership = require("../src/admin/routes/membership");
const invoiceService = require("../src/admin/services/invoice");
const stripe = require("stripe")(
  process.env.STRIPE_SECRET_KEY
);

const frontEndUrl = process.env.FRONT_END_URL;


exports.createMembership = async (body, user) => {
  // Check for existing membership
  const existingMembership = await db.membership.findOne({ membershipName: body.membershipName });
  if (existingMembership) {
    throw new Error("membership already exist");
  }

  // Add creator's ID to the body
  body.createdBy = user.id;

  // Validate membershipDuration input
  const durationMapping = {
    Yearly: { interval: "year", interval_count: 1 },
    Monthly: { interval: "month", interval_count: 1 },
  };

  const durationOption = durationMapping[body.membershipDuration];
  if (!durationOption) {
    throw new Error("Invalid membership duration");
  }

  // Create membership entity in the database
  const data = await db.membership.newEntity(body);
  const entity = await db.membership.create(data);

  return { entity, durationOption };
};

exports.createStripeMembershipResources = async (entity, membershipDuration) => {
  try {
    // Determine the interval and interval_count based on membershipDuration
    let durationOption;
    if (membershipDuration === "Monthly") {
      durationOption = { interval: "month", interval_count: 1 };
    } else if (membershipDuration === "Yearly") {
      durationOption = { interval: "year", interval_count: 1 };
    } else {
      throw new Error("Invalid membership duration type");
    }

    // Create Stripe Product
    const product = await stripe.products.create({
      name: entity.membershipName,
      description: `Membership Limit: ${entity.membershipDescription.join(", ")}, Duration: ${membershipDuration}.`,
    });

    // Create Stripe Price
    const price = await stripe.prices.create({
      unit_amount: Math.round(entity.price * 100), // Convert to cents
      currency: "usd",
      recurring: {
        interval: durationOption.interval,
        interval_count: durationOption.interval_count,
      },
      product: product.id,
    });

    // Link Stripe Price ID to the membership entity
    entity.stripePriceId = price.id;
    await entity.save();

    return entity;
  } catch (error) {
    console.error("Error creating Stripe membership resources:", error.message);
    throw new Error("Failed to create Stripe membership resources.");
  }
};

exports.createCheckoutMembershipSession = async (membership, user) => {
  try {
    if (!membership) {
      throw new Error('membership not found');
    }

    if (!user) {
      throw new Error('User not found');
    }

    let customerId = user.stripeCustomerId; // Check if the user already has a Stripe customer ID
    if (!customerId) {
      // If no customer ID, search in Stripe for an existing customer
      const customer = await stripe.customers.search({
        query: `metadata['userId']:'${user.id}'`,
      });
      if (customer.data.length > 0) {
        // Use existing Stripe customer
        customerId = customer.data[0].id;
        user.stripeCustomerId = customerId;
        user.save();
      } else {
        // Create a new Stripe customer
        const newCustomer = await stripe.customers.create({
          email: user.email, // Use email for communication
          metadata: { userId: user.id }, // Store your userId in metadata
        });
        customerId = newCustomer.id;
        // Save the customerId to the User model
        user.stripeCustomerId = customerId;
        await user.save();
      }
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId, // Associate the session with the customer
      payment_method_types: ["card"],
      line_items: [
        {
          price: membership.stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${frontEndUrl}/MembershipBought?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontEndUrl}/MembershipNotBought`,
    });

    // Return the session URL to be handled by the calling function

    return { url: session.url };
  } catch (error) {
    throw new Error("Failed to create checkout session");
  }
};

exports.createCheckoutProductSession = async (productDetails) => {
  try {
    if (!productDetails) {
      throw new Error('Product details are required');
    }
    const {
      medicineId,
      quantity = 1,
      totalPrice,
      userId,
      orderId = productDetails.orderId,
      successUrl,
      cancelUrl
    } = productDetails;

    if (!totalPrice) {
      throw new Error('Missing required product details: totalPrice');
    }

    let userInfo = await db.user.findById(userId)

    if(!userInfo.stripeSessionId){
      // then create new
      const newCustomer = await stripe.customers.create({
        email: userInfo.email,
        metadata: { 
          orderId, 
          userId, 
          medicineId 
        }})
      userInfo.stripeCustomerId = newCustomer.id;
      await userInfo.save();
      
    }
  
    const session = await stripe.checkout.sessions.create({
      customer: userInfo.stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Medicine Order - ${medicineId || 'Product'}`,
          },
          unit_amount: Math.round(totalPrice * 100), // Convert to cents
        },
         quantity: 1,
      }],
      mode: "payment",
      success_url: successUrl ||`${frontEndUrl}/productconfirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl ||`${frontEndUrl}/ordernotconfirmed`,
      metadata: {
        orderId,
        userId,
        medicineId,
        quantity
      }
    });


    return {
      id: session.id,
      url: session.url
    };

  } catch (error) {
    console.error('Checkout Session Creation Error:', error);
    throw new Error(`Payment session creation failed: ${error.message}`);
  }
};

exports.handleSuccess = async (sessionId) => {
  try {
    if (!sessionId) {
     throw "Session ID is required"
    }
    // Fetch session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    // Extract important details
    const customerId = session.customer; // Stripe Customer ID
    const stripeMembershipId = session.subscription; // Subscription ID (if applicable)
    const paymentStatus = session.payment_status; // e.g., 'paid'

    // Find the user associated with the customerId
    const user = await db.user.findOne({ stripeCustomerId: customerId });
    if (!user) {
      throw new Error("user not found");
      
    }
    // Find the subscription associated with the subscriptionId
    const userMembership = await db.userMembership.findOne({ userId: user.id });
    if (!userMembership) {
     throw new Error("subscription not found");
     
    }
    // Update subscription status
    userMembership.status = paymentStatus === "paid" ? "active" : "inactive";
    userMembership.paymentStatus = paymentStatus === "paid" ? true : false;
    userMembership.isPaymentDone = paymentStatus === "paid" ? true : false;
    userMembership.stripeMembershipId=stripeMembershipId
    
    //userMembership.paymentStatus=true
    await userMembership.save();
    user.membership = userMembership.id
    await user.save()

    
const invoiceDetails = {
    userId: user.id,
    invoiceType: "Membership",
    membership: userMembership._id,
    totalAmount: session.amount_total / 100,
    paymentStatus: paymentStatus,
    invoiceDate: new Date(2025, 0, 20),
};

const invoiceData = await invoiceService.create(invoiceDetails, user);

await invoiceData.save()
    // Return success data
    return {
      message: "Payment successful!",
      userMembership,
      stripeMembershipId,
      customerId,
      invoiceData
    };
  } catch (error) {
    return { error: "Failed to retrieve session details" };
  }
};


exports.handleOneTimePayment = async (sessionId) => {
  try {
    if (!sessionId) {
   throw "Session ID is required"
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const customerId = session.customer; // Stripe Customer ID
    const paymentStatus = session.payment_status; // e.g., 'paid'
    const amountTotal = session.amount_total; // Total amount paid (in cents)
    const currency = session.currency; // Currency of the payment

    if (paymentStatus !== "paid") {
     throw "Payment not successful"
    }

    const user = await db.user.findOne({ stripeCustomerId: customerId });
    if (!user) {
      throw "User not found"
    }

    const isOrder = await db.order.findById(session.metadata.orderId);
    if (!isOrder) {
      throw "order not found"
    }

    isOrder.isPaymentDone = true;
    await isOrder.save();

    const paymentRecord = await db.payment.create({
      userId: user.id,
      orderId: session.metadata.orderId,
      stripeSessionId: sessionId,
      amount: amountTotal,
      currency,
      status: paymentStatus,
      paymentMethod: session.payment_method_types[0], // e.g., 'card'
      createdAt: new Date(session.created * 1000), // Convert timestamp to date
    });

    const invoiceDetails = {
      userId: user.id,
      invoiceType: "Order",
      orderId: session.metadata.orderId,
      totalAmount: session.amount_total / 100,
      paymentStatus: paymentStatus,
      invoiceDate: new Date(2025, 0, 20),
    };

    const invoiceData = await invoiceService.create(invoiceDetails, user);
    await invoiceData.save();

    // **Clear Cart After Payment**
    await db.cart.deleteMany({ userId: user.id });

    return {
      invoiceData,
      message: "One-time payment successful!",
      paymentRecord,
      customerId,
    };
  } catch (error) {
    console.error("Error handling one-time payment:", error);
   throw "Failed to handle one-time payment" 
  }
};


// exports.handleOneTimePayment = async (sessionId) => {
//   try {
//     if (!sessionId) {
//       return { error: "Session ID is required" };
//     }

//     const session = await stripe.checkout.sessions.retrieve(sessionId);

//     const customerId = session.customer; // Stripe Customer ID
//     const paymentStatus = session.payment_status; // e.g., 'paid'
//     const amountTotal = session.amount_total; // Total amount paid (in cents)
//     const currency = session.currency; // Currency of the payment

//     if (paymentStatus !== "paid") {
//       return { error: "Payment not successful" };
//     }
    
//     const user = await db.user.findOne({ stripeCustomerId: customerId });
//     if (!user) {
//       return { error: "User not found" };
//     }
//     const isOrder = await db.order.findById(session.metadata.orderId)

//     if(!isOrder){
//        return { error: "order not found"}
//     }
//     isOrder.isPaymentDone = true
//     await isOrder.save();

//     const paymentRecord = await db.payment.create({
//       userId: user.id,
//       orderId: session.metadata.orderId,
//       stripeSessionId: sessionId,
//       amount: amountTotal,
//       currency,
//       status: paymentStatus,
//       paymentMethod: session.payment_method_types[0], // e.g., 'card'
//       createdAt: new Date(session.created * 1000), // Convert timestamp to date
//     });
//     const invoiceDetails = {
//       userId: user.id,
//       invoiceType: "Order",
//       orderId: session.metadata.orderId,
//       totalAmount: session.amount_total / 100,
//       paymentStatus: paymentStatus,
//       invoiceDate: new Date(2025, 0, 20),
//   };
  
//   const invoiceData = await invoiceService.create(invoiceDetails, user);
  
//   await invoiceData.save()
//     return {
//       invoiceData,
//       message: "One-time payment successful!",
//       paymentRecord,
//       customerId,
//     };
//   } catch (error) {
//     console.error("Error handling one-time payment:", error);
//     return { error: "Failed to handle one-time payment" };
//   }
// };

exports.cancelMembership = async (membershipId) => {
  try {
    if (!membershipId) {
     throw new Error("membership id is required");
     
    }

    const canceledMembership = await stripe.subscriptions.cancel(membershipId);

    console.log("Membership canceled:", canceledMembership);
    return canceledMembership;

  } catch (error) {
   console.log(error)
  }
};

// exports.cancelOrderAndRefund = async (orderId) => {
//   try {
//     if (!orderId) {
//       throw new Error("Order ID is required");
//     }

//     // Fetch order details from your database
//     const order = await db.order.findOne({ orderId });

//     if (!order) {
//       throw new Error("Order not found");
//     }

//     if (order.status === "canceled") {
//       throw new Error("Order is already canceled");
//     }

//     // Retrieve the Stripe payment session
//     const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);

//     if (!session.payment_intent) {
//       throw new Error("No payment found for this order");
//     }

//     // Refund the payment
//     const refund = await stripe.refunds.create({
//       payment_intent: session.payment_intent, // Use PaymentIntent ID
//       amount: order.totalAmount * 100, // Convert to cents
//     });

//     // Update order status in the database
//     order.status = "canceled";
//     order.refundStatus = "refunded";
//     order.stripeRefundId = refund.id;
//     await order.save();

//     console.log(`Order ${orderId} has been refunded successfully.`);
    
//     return {
//       message: "Order canceled and refunded successfully",
//       refund,
//     };

//   } catch (error) {
//     console.error("Error canceling order and issuing refund:", error);
//     throw new Error("Failed to cancel order and refund payment.");
//   }
// };
