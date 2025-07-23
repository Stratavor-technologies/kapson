const utils = require("../../../helpers/utils");
const _ = require("underscore");
const user = require("../routes/user");
const constants = require("../../../constants");
const populate = [
  {
    path: "distributerId",
  },
  {
    path: "createdBy",
  },
];


const getById = async (id) => {
  let val =  await db.user.findById(id).populate(populate);
  return val;
};

const getByCondition = async (condition) => {
  return await db.user.findOne(condition);
};

const get = async (query) => {
  if (typeof query === "string") {
    if (query.isObjectId()) {
      return getById(query);
    }
  }
  if (query.id) {
    return getById(query.id);
  }
  if (query.email) {
    return getByCondition({ email: query.email });
  }
  if (query.phone) {
    return getByCondition({ phone: query.phone });
  }
  
  if (query.username) {
    return getByCondition({ username: query.username });
  }
  return null;
};

const set = (model, entity) => {
  // Personal Info
  if (model.firstName) entity.firstName = model.firstName;
  if (model.lastName) entity.lastName = model.lastName;
  if (model.firstName && model.lastName)
    entity.fullName = model.firstName + " " + model.lastName;
  if (model.fullName) entity.fullName = model.fullName;
  if (model.username) {
    entity.username = model.username;
    entity.isProfileCompleted = true;
    entity.isEmailVerified = true;
    entity.status = "active";
  }
  if (model.imgUrl) entity.imgUrl = model.imgUrl;
  if (model.coverImgUrl) entity.coverImgUrl = model.coverImgUrl;

  // Authentication & Account Info
  if (model.deviceId) entity.deviceId = model.deviceId;
  if (model.authMethod) entity.authMethod = model.authMethod;
  if (model.countryCode) entity.countryCode = model.countryCode;
  if (model.ISOCode) entity.ISOCode = model.ISOCode;
  if (model.phone) entity.phone = model.phone;
  if (model.email) entity.email = model.email;
  if (model.activationCode) entity.activationCode = model.activationCode;
  if (model.uniqueCode) entity.uniqueCode = model.uniqueCode;
  if (model.password) entity.password = model.password;
  if (model.status) entity.status = model.status;
  if (model.role) entity.role = model.role;
  if (model.distributerId) entity.distributerId = model.distributerId;
  if (model.dealershipArea) entity.dealershipArea = model.dealershipArea;

  // Address Info
  if (model.address) entity.address = model.address;
  if (model.country) entity.country = model.country;
  if (model.state) entity.state = model.state;
  if (model.city) entity.city = model.city;
  if (model.area) entity.area = model.area;
  if (model.zipCode) entity.zipCode = model.zipCode;

  // Business Details
  if (model.firmName) entity.firmName = model.firmName;
  if (model.contactPerson) entity.contactPerson = model.contactPerson;
  if (model.contactNumber) entity.contactNumber = model.contactNumber;
  if (model.gstNumber) entity.gstNumber = model.gstNumber;
  if (model.dealershipDetails) entity.dealershipDetails = model.dealershipDetails;

  // Financial Terms
  if (model.discountPercentage !== undefined) entity.discountPercentage = model.discountPercentage;
  if (model.creditLimit !== undefined) entity.creditLimit = model.creditLimit;
  if (model.dueDays !== undefined) entity.dueDays = model.dueDays;

  // Device & Verification
  if (model.deviceType) entity.deviceType = model.deviceType;
  if (model.isEmailVerified !== undefined) entity.isEmailVerified = model.isEmailVerified;
  if (model.isPhoneVerified !== undefined) entity.isPhoneVerified = model.isPhoneVerified;
  if (model.isProfileCompleted !== undefined) entity.isProfileCompleted = model.isProfileCompleted;
  if (model.isBlocked !== undefined) entity.isBlocked = model.isBlocked;
  if (model.lastAccess) entity.lastAccess = model.lastAccess;



  return entity;
};


const create = async (body,user) => {
  let checkExist = await db.user.findOne(
    { email: body.email } || { phone: body.phone }
  );
  if (checkExist) {
    return checkExist
    //throw { message: constants.USER_ALREADY_EXIST };
  }
  body.createdBy = user.id || user._id;
  let data = await db.user.newEntity(body);
  let entity = await db.user.create(data);
  return entity;
};

 const update = async (id, model) => {
    const entity = await db.user.findById(id);
    if (!entity) {
        throw { message: constants.USER_NOT_FOUND };
    }

    set(model, entity);
    const updateUser = await entity.save();
    return updateUser;
};

// const userUpdate = async (id, model, user) => {
//   let entity = await db.user.findById(id);
//   if (model.username) {
//     let alreadyExist = await db.user.findOne({
//       username: model.username,
//       id: { $ne: entity.id },
//     });
//     if (alreadyExist) {
//       throw { message: constants.USERNAME_ALREADY_EXISTS };
//     }
//   }
//   //set(model, entity);
//   Object.assign(entity, model);
  
//   if (model.status === "blocked" || model.status === "active") {
//     let connection = await db.connection.findOne({
//       $or: [
//         { sender: user.id, receiver: id },
//         { sender: id, receiver: user.id },
//       ],
//     });
//     console.log(connection)
//     if (connection) {
//       if (model.status === "blocked") {
//         connection.status = "blocked";
//         connection.blockedById = user.id;
//         await updateConnectionCount([id, user.id], -1);
//       } else if (model.status === "active") {
//         connection.status = "accepted";
//         connection.blockedById = null;
//         await updateConnectionCount([id, user.id], 1);
//       }
//       await connection.save();
//     }
//     await user.save();
//   }

//   let val =  await entity.save();
//   console.log('Updated User Details:', {
//     id: val._id,
//     fullName: val.fullName,
//     email: val.email,
//     phone: val.phone,
//     username: val.username,
//     status: val.status,
//     role: val.role
//   });
//   return val;
// };

// const search = async (query, page, user) => {
//   let where = {
//     _id: { $ne: user._id },
//   };
//   let receiverUserIds, acceptedUserIds, senderUserIds;
//   if (query.search) {
//     where["$or"] = [
//       { fullName: new RegExp(query.search, "i") },
//       { phone: new RegExp(query.search, "i") },
//       { email: new RegExp(query.search, "i") },
//       { username: new RegExp(query.search, "i") },
//     ];
//   }
//   if (query.status) {
//     where.status = query.status;
//   }
//   if (query.filter == "connections") {
//     //only show accepted user
//     const acceptedUser = await db.connection.find({
//       $or: [{ sender: user.id }, { receiver: user.id }],
//       status: "accepted",
//     });
//     acceptedUserIds = acceptedUser.map((item) => [
//       item.receiver.toString(),
//       item.sender.toString(),
//     ]);
//     acceptedUserIds = acceptedUserIds.flat();
//     acceptedUserIds = acceptedUserIds.filter(
//       (item) => item.toString() !== user.id.toString()
//     );
//     where["_id"] = { $in: acceptedUserIds };
//   } else if (query.filter == "requested") {
//     const acceptedUser = await db.connection.find({
//       receiver: user.id,
//       status: "pending",
//     });
//     const senderUserIds = acceptedUser.flatMap((item) =>
//       item.sender.toString()
//     );
//     where["_id"] = { $in: senderUserIds };
//   } else if (query.filter == "discover") {
//     const acceptedUser = await db.connection.find({
//       $or: [{ sender: user.id }, { receiver: user.id }],
//       status: "accepted",
//     });
//     acceptedUserIds = acceptedUser.flatMap((item) => [
//       item.receiver,
//       item.sender,
//     ]);
//     acceptedUserIds = acceptedUserIds.flat();
//     const connections = await db.connection.find({
//       sender: user.id,
//       status: "pending",
//     });
//     receiverUserIds = connections.flatMap((item) => item.receiver.toString());
//     if (_.isEmpty(acceptedUserIds)) {
//       acceptedUserIds.push(user.id);
//     }
//     where["_id"] = { $nin: acceptedUserIds };
//     if (!query.search) {
//       return {
//         count: 0,
//         items: [],
//       };
//     }
//   } else if (query.filter == "blocked") {
//     const acceptedUser = await db.connection.find({
//       // $or: [{ sender: user.id }, { receiver: user.id }],
//       status: "blocked",
//       blockedById: user.id,
//     });
//     acceptedUserIds = acceptedUser.map((item) => [
//       item.receiver.toString(),
//       item.sender.toString(),
//     ]);
//     acceptedUserIds = acceptedUserIds.flat();
//     acceptedUserIds = acceptedUserIds.filter(
//       (item) => item.toString() !== user.id.toString()
//     );
//     where["_id"] = { $in: acceptedUserIds };
//   }

//   const count = await db.user.countDocuments(where);
//   let items;
//   if (page) {
//     items = await db.user
//       .find(where)
//       .sort({ createdAt: -1 })
//       .skip(page.skip)
//       .limit(page.limit)
//       .populate(populate);
//   } else {
//     items = await db.user
//       .find(where)
//       .sort({ createdAt: -1 })
//       .populate(populate);
//   }
//   if (query.filter == "discover") {
//     await sendRequestCheck(items, receiverUserIds);
//   }
//   return {
//     count,
//     items,
//   };
// };

// const search = async (query, page, user) => {
//   let where = {
//     // _id: { $ne: user._id },
//     // role: "USER", // Only include users with the role "USER"
//   };

//   let receiverUserIds, acceptedUserIds, senderUserIds;

//   if (query.search) {
//     where["$or"] = [
//       { fullName: new RegExp(query.search, "i") },
//       { phone: new RegExp(query.search, "i") },
//       { email: new RegExp(query.search, "i") },
//       { username: new RegExp(query.search, "i") },
//     ];
//   }

//   if (query.status) {
//     where.status = query.status;
//   }
//    if (query.role) {
//      where.role = query.role;
//    }
//    if (query.role==="ADMIN"){
//     where.user=user
//    }

//   if (query.filter == "connections") {
//     // Only show accepted users
//     const acceptedUser = await db.connection.find({
//       $or: [{ sender: user.id }, { receiver: user.id }],
//       status: "accepted",
//     });

//     acceptedUserIds = acceptedUser.map((item) => [
//       item.receiver.toString(),
//       item.sender.toString(),
//     ]);
//     acceptedUserIds = acceptedUserIds.flat();
//     acceptedUserIds = acceptedUserIds.filter(
//       (item) => item.toString() !== user.id.toString()
//     );
//     where["_id"] = { $in: acceptedUserIds };
//   } else if (query.filter == "requested") {
//     const acceptedUser = await db.connection.find({
//       receiver: user.id,
//       status: "pending",
//     });

//     senderUserIds = acceptedUser.flatMap((item) => item.sender.toString());
//     where["_id"] = { $in: senderUserIds };
//   } else if (query.filter == "discover") {
//     const acceptedUser = await db.connection.find({
//       $or: [{ sender: user.id }, { receiver: user.id }],
//       status: "accepted",
//     });

//     acceptedUserIds = acceptedUser.flatMap((item) => [
//       item.receiver,
//       item.sender,
//     ]);
//     acceptedUserIds = acceptedUserIds.flat();

//     const connections = await db.connection.find({
//       sender: user.id,
//       status: "pending",
//     });

//     receiverUserIds = connections.flatMap((item) => item.receiver.toString());
//     if (_.isEmpty(acceptedUserIds)) {
//       acceptedUserIds.push(user.id);
//     }

//     where["_id"] = { $nin: acceptedUserIds };

//     if (!query.search) {
//       return {
//         count: 0,
//         items: [],
//       };
//     }
//   } else if (query.filter == "blocked") {
//     const acceptedUser = await db.connection.find({
//       status: "blocked",
//       blockedById: user.id,
//     });

//     acceptedUserIds = acceptedUser.map((item) => [
//       item.receiver.toString(),
//       item.sender.toString(),
//     ]);
//     acceptedUserIds = acceptedUserIds.flat();
//     acceptedUserIds = acceptedUserIds.filter(
//       (item) => item.toString() !== user.id.toString()
//     );
//     where["_id"] = { $in: acceptedUserIds };
//   }

//   const count = await db.user.countDocuments(where);
//   let items;

//   if (page) {
//     items = await db.user
//       .find(where)
//       .sort({ createdAt: -1 })
//       .skip(page.skip)
//       .limit(page.limit)
//      .populate(populate);
//   } else {
//     items = await db.user
//       .find(where)
//       .sort({ createdAt: -1 })
//       .populate(populate);
//   }

//   if (query.filter == "discover") {
//     await sendRequestCheck(items, receiverUserIds);
//   }

//   return {
//     count,
//     items,
//   };
// };

const search = async (query, page, user) => {
  let where = {};

  // If query.role === 'ADMIN', show all users
  if (query.role === "ADMIN") {
    const count = await db.user.countDocuments();
    let items;

    if (page) {
      items = await db.user
        .find({})
        .sort({ createdAt: -1 })
        .skip(page.skip)
        .limit(page.limit)
        .populate(populate);
    } else {
      items = await db.user.find({}).sort({ createdAt: -1 }).populate(populate);
    }

    return {
      count,
      items,
    };
  }

  // If user is a distributor, only show their dealers
  if (user.role === "DISTRIBUTER") {
    where.role = "DEALER";
    where.distributerId = user._id;
  }

  // For other roles, apply filters
  if (query.search) {
    where["$or"] = [
      { fullName: new RegExp(query.search, "i") },
      { phone: new RegExp(query.search, "i") },
      { email: new RegExp(query.search, "i") },
      { username: new RegExp(query.search, "i") },
    ];
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.role) {
    where.role = query.role;
  }

  let receiverUserIds, acceptedUserIds, senderUserIds;

  if (query.filter === "connections") {
    const acceptedUser = await db.connection.find({
      $or: [{ sender: user.id }, { receiver: user.id }],
      status: "accepted",
    });

    acceptedUserIds = acceptedUser.flatMap((item) => [
      item.receiver.toString(),
      item.sender.toString(),
    ]);
    acceptedUserIds = acceptedUserIds.filter((id) => id !== user.id.toString());
    where["_id"] = { $in: acceptedUserIds };
  } else if (query.filter === "requested") {
    const pendingRequests = await db.connection.find({
      receiver: user.id,
      status: "pending",
    });

    senderUserIds = pendingRequests.map((item) => item.sender.toString());
    where["_id"] = { $in: senderUserIds };
  } else if (query.filter === "discover") {
    const acceptedUser = await db.connection.find({
      $or: [{ sender: user.id }, { receiver: user.id }],
      status: "accepted",
    });

    acceptedUserIds = acceptedUser.flatMap((item) => [
      item.receiver.toString(),
      item.sender.toString(),
    ]);

    const pendingConnections = await db.connection.find({
      sender: user.id,
      status: "pending",
    });

    receiverUserIds = pendingConnections.map((item) =>
      item.receiver.toString()
    );

    acceptedUserIds.push(user.id);
    where["_id"] = { $nin: acceptedUserIds };

    if (!query.search) {
      return {
        count: 0,
        items: [],
      };
    }
  } else if (query.filter === "blocked") {
    const blockedUsers = await db.connection.find({
      status: "blocked",
      blockedById: user.id,
    });

    acceptedUserIds = blockedUsers.flatMap((item) => [
      item.receiver.toString(),
      item.sender.toString(),
    ]);

    acceptedUserIds = acceptedUserIds.filter((id) => id !== user.id.toString());
    where["_id"] = { $in: acceptedUserIds };
  }

  // Fetch results
  const count = await db.user.countDocuments(where);
  let items;

  if (page) {
    items = await db.user
      .find(where)
      .sort({ createdAt: -1 })
      .skip(page.skip)
      .limit(page.limit)
      .populate(populate);
  } else {
    items = await db.user.find(where).sort({ createdAt: -1 }).populate(populate);
  }

  if (query.filter === "discover") {
    await sendRequestCheck(items, receiverUserIds);
  }

  return {
    count,
    items,
  };
};



const remove = async (id) => {
  let entity = await get(id);
  if (entity) {
    return await db.user.deleteOne({ _id: id });
  }
  return null;
};

const updateNotificationCount = async (userId) => {
  const user = await db.user.findById(userId);
  user.notificationCount = 0;
  await db.userNotification.updateMany({ user: userId }, { read: true });
  return await user.save();
};

const sendRequestCheck = async (items, receiverUserIds) => {
  items = items.map((item) => {
    item.requestSend = receiverUserIds.includes(item.id.toString());
    return item;
  });

  return items;
};

const updateConnectionCount = async (userIds, increment) => {
  await db.user.updateMany(
    { _id: { $in: userIds } },
    { $inc: { connectionCount: increment } }
  );
};

const getUsersByPhone = async (req) => {
  // Fetch the user's phone number and country code by their userId
  const user = await db.user
    .findById(req.body.userId)
    .select("phone countryCode")
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  // Extract phone numbers from the request, excluding the user's phone number
  const phoneToRemove = user.phone;
  const phoneArray = req.body.phones
    .map((number) => number.replace("+", "").slice(2))
    .filter((number) => number !== phoneToRemove);

  // Fetch all relevant data in parallel
  const [connectionRequests, sentInvites, usersList] = await Promise.all([
    // Fetch connection requests made by the current user
    db.connection.find({ sender: req.body.userId }).lean(),

    // Fetch invites already sent by the current user
    db.sendInvite.find({
      sender: req.body.userId,
      receiverPhoneNumber: { $in: phoneArray },
    }).lean(),

    // Fetch all users with the specified phone numbers
    db.user.find({ phone: { $in: phoneArray } }).lean(),
  ]);

  // Create a set for quick lookup of existing phone numbers
  const userMap = new Map(usersList.map((user) => [user.phone, user]));

  // Create maps for quick lookup of connection status and sent invites
  const connectionStatusMap = new Map(
    connectionRequests.map((req) => [req.receiver.toString(), req.status])
  );

  const inviteMap = new Set(sentInvites.map((invite) => invite.receiverPhoneNumber));

  // Prepare the response by iterating over the phone numbers
  const response = {
    connections: [],
    inviteUsers: [],
  };

  phoneArray.forEach((phone) => {
    const user = userMap.get(phone);

    if (user) {
      // If user exists, determine if a connection request is pending
      const status = connectionStatusMap.get(user._id.toString());
      const hasSentRequest = status === "pending";

      response.connections.push({
        userId: user._id,
        phone,
        userName: `${user.firstName} ${user.lastName}`,
        userProfile: user.imgUrl || "",
        hasSentRequest,
      });
    } else {
      // If user does not exist, check if an invite was sent
      const hasSentInvite = inviteMap.has(phone);

      response.inviteUsers.push({
        phone,
        hasSentInvite,
      });
    }
  });

  return response;
};

const getAllUsers = async () => {
const check = await db.user.find({ role: { $ne: "ADMIN" } });
return check
};  



module.exports = {
  getAllUsers,
  get,
  create,
  set,
  update,
  search,
  remove,
  updateNotificationCount,
  sendRequestCheck,
  updateConnectionCount,
  getUsersByPhone,
};
