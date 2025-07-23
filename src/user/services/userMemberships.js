const utils = require("../../../helpers/utils");
const _ = require("underscore");
const { query } = require("express");
const payment = require('../../../helpers/paymentGateway');
const mongoose = require("mongoose")
const populate = [
    { path: "userId" },
    { path: "membershipId" },
    { path: "invoiceId" }
];

const getById = async (id) => {
    return await db.userMembership.findById(id).populate(populate);
};

const getByCondition = async (condition) => {
    return await db.userMembership.findOne(condition).populate(populate);
};


exports.create = async (body, user) => {

    console.log(user + ">>>>>>>>>>>>>>>>>>>>>>>>>>>");
    const membership = await db.membership.findOne({ _id: body.membershipId });
    if (!membership) {
        throw new Error("Membership not found");
    }
    // Check if the user already has an existing membership
    let existingUserMembership = await db.userMembership.findOne({ userId: user._id });
    if (existingUserMembership && existingUserMembership.status === "active") {
        throw new Error("userMembership already active");

    }
    if (existingUserMembership && existingUserMembership.status === "expired") {
        // Create a payment checkout session
        const session = await payment.createCheckoutMembershipSession(membership, user);
        console.log(session);

        // Return the Stripe session URL for existing memberships
        return {
            stripeSessionUrl: session.url,
        };
    } else {
        //for new user
        // Create a payment checkout session
        const createPrice = await payment.createStripeMembershipResources(membership, membership.membershipDuration);
        const session = await payment.createCheckoutMembershipSession(membership, user);
        console.log(session);
        // Determine `membershipFrom` and `membershipTo` based on current date and membership duration
        const currentDate = new Date();
        const membershipFrom = currentDate.toISOString(); // Start from today
        let membershipTo;

        if (membership.membershipDuration === "Monthly") {
            membershipTo = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                currentDate.getDate()
            ).toISOString();
        } else if (membership.membershipDuration === "Yearly") {
            membershipTo = new Date(
                currentDate.getFullYear() + 1,
                currentDate.getMonth(),
                currentDate.getDate()
            ).toISOString();
        } else {
            throw new Error("Invalid membership duration type");
        }

        // Prepare the new userMembership data
        const newUserMembershipData = {
            userId: user.id,
            membershipId: body.membershipId,
            membershipFrom: membershipFrom,
            membershipTo: membershipTo,
            price: membership.price,            // Use the price from the membership details
            status: "active",                   // Default status
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Create a new userMembership entity
        const newUserMembershipEntity = await db.userMembership.newEntity(newUserMembershipData);
        const createdUserMembership = await db.userMembership.create(newUserMembershipEntity);
        createdUserMembership.save();
        // Return the Stripe session URL after creation
        return {
            createPrice,
            stripeSessionUrl: session.url,
        };
    }
    // } catch (error) {
    //     console.error("Error creating membership:", error.message);
    //     throw new Error("Failed to create memberships.");
    // }
};


exports.handleSession = async (sessionId) => {
    try {
        if (!sessionId) {
            throw new Error("Session ID is required");
        }
        const success = await payment.handleSuccess(sessionId);
        console.log("Payment Success Response:", success)

        return success;
    } catch (error) {
        console.error("Error in handleSession:", error);
        throw new Error(error.message || "Failed to handle session");
    }
};

exports.cancelUserMembership = async (membershipId, userId) => {
    try {
        if (!membershipId) {
            throw new Error("Membership ID is required");
        }
        let memberShipDetails = await db.userMembership.findById(membershipId)


        const success = await payment.cancelMembership(memberShipDetails.stripeMembershipId);
        console.log("Payment Success Response:", success)
        const updatedMembership = await db.userMembership.findByIdAndUpdate(
            membershipId,
            { status: 'cancelled' },
            { new: true }
        );

        if (!updatedMembership) {
            throw new Error("Membership not found");
        }
        const findUser = await db.user.findById(userId)
        findUser.membership = null
        await findUser.save();
        return updatedMembership;
    } catch (error) {
        console.error("Error in handleSession:", error);
        throw new Error(error.message || "Failed to handle session");
    }
};



exports.get = async (query) => {
    if (typeof query === "string" && query.isObjectId()) {
        return getById(query);
    }

    if (query.id) {
        return getById(query.id);
    }
    if (query.name) {
        return getByCondition({ name: query.name });
    }

    return null;
};

exports.search = async (query, page) => {
    let where = {};
    if (query.userId) {
        where["userId"] = new mongoose.Types.ObjectId(query.userId);
    }

    if (query.status) {
        where["status"] = query.status;
    }


    if (query.search) {
        where["$or"] = [
            { userMembershipId: new RegExp(query.search, "i") },
            { userId: new RegExp(query.search, "i") },
        ];
    }
        where["isPaymentDone"]=true

    const count = await db.userMembership.countDocuments(where);
    let items;

    if (page) {
        items = await db.userMembership
            .find(where)
            .sort({ createdAt: -1 })
            .skip((page - 1) * 10)
            .limit(10)
            .populate(populate);
    } else {
        items = await db.userMembership.find(where).sort({ createdAt: -1 }).populate(populate);
    }

    return {
        items,
        count,
        page: page || 1,
        pageSize: 10,
    };
};

exports.remove = async (id) => {
    const entity = await getById(id);
    if (entity) {
        return await db.userMembership.deleteOne({ _id: id });
    }
    return null;
};
