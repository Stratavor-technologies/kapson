//const { authorize } = require("../../../utils/googleAuth");
const { getIO } = require("../../socket");
const { google } = require("googleapis");
const emailService = require("../services/email");
// const {

//   modifyEmailLabels,
//   sendEmailWithReply,
//   deleteEmailService,
// } = require("../services/email");

// Fetch all labels with counts

const fetchAllLabels = async (req, res) => {
  try {
    const auth = await authorize();
    const labelsWithCounts = await emailService.getLabelsWithCounts(auth); // Fetch labels with counts

    // Find the unread label and extract its count
    const unreadLabel = labelsWithCounts.find((label) => label.id === "UNREAD");
    const unreadEmailCount = unreadLabel ? unreadLabel.count : 0;

    // Separate system and custom labels
    const systemLabels = labelsWithCounts.filter(
      (label) => label.type === "system"
    );
    const customLabels = labelsWithCounts.filter(
      (label) => label.type === "user"
    );

    // Define Gmail's default priority order for system labels
    const labelOrder = [
      "INBOX",
      "STARRED",
      "SENT",
      "DRAFT",
      "IMPORTANT",
      "CATEGORY_PERSONAL",
      "CATEGORY_SOCIAL",
      "CATEGORY_UPDATES",
      "CATEGORY_FORUMS",
      "CATEGORY_PROMOTIONS",
      "CHAT",
      "TRASH",
      "SPAM",
      "UNREAD",
    ];

    // Reorder system labels based on the priority list
    const orderedSystemLabels = systemLabels.sort((a, b) => {
      const indexA = labelOrder.indexOf(a.id);
      const indexB = labelOrder.indexOf(b.id);
      if (indexA === -1) return 1; // Move unrecognized labels to the end
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    // Extract all category labels
    const categoryLabels = orderedSystemLabels.filter((label) =>
      label.id.startsWith("CATEGORY_")
    );

    // Remove category labels from system labels
    const nonCategorySystemLabels = orderedSystemLabels.filter(
      (label) => !label.id.startsWith("CATEGORY_")
    );

    // Combine the final structure
    const responseStructure = {
      systemLabels: nonCategorySystemLabels,
      categories: categoryLabels,
      customLabels: customLabels,
      unreadEmailCount: unreadEmailCount, // Include unread email count
    };

    return res.json(
      responseStructure
      // "Labels and unread email count fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching labels:", error);
    res.error("Failed to fetch labels", 500, error.message);
  }
};

// Fetch messages for a specific label
const fetchMessagesByLabel = async (req, res) => {
  try {
    const auth = await authorize();
    const { labelId } = req.params;
    let maxResults = req.body.maxResults || 10;

    // Fetch all messages with the given label
    const messages = await emailService.listMessages(auth, labelId, maxResults);

    // Filter out reply emails and associate them with their respective thread histories
    const mainMessages = [];
    const threadMap = new Map();

    messages.forEach((message) => {
      const { threadId, id } = message;

      // Check if this message is a reply (already part of threadHistory)
      if (threadMap.has(threadId)) {
        const thread = threadMap.get(threadId);
        thread.threadHistory.push(message); // Append reply to the thread history
      } else {
        // If it's a new thread, initialize it
        message.threadHistory = message.threadHistory || [];
        threadMap.set(threadId, message);
        mainMessages.push(message); // Add to main messages
      }
    });

    // Convert the map back into an array for the response
    const finalMessages = mainMessages.map((message) => ({
      ...message,
      threadHistory: message.threadHistory.sort(
        (a, b) => new Date(a.date) - new Date(b.date) // Sort thread history by date
      ),
    }));

    return res.data(
      finalMessages
      // `Messages and thread history for label '${labelId}' fetched successfully`
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.error("Failed to fetch messages", 500, error.message);
  }
};

// Fetch details of a specific email
const fetchMessageDetails = async (req, res) => {
  try {
    const auth = await authorize();
    const { id } = req.params;
    const message = await emailService.getMessageDetails(auth, id);
    res.success(message, "Message details fetched successfully");
  } catch (error) {
    console.error("Error fetching message details:", error);
    res.error("Failed to fetch message details", 500, error.message);
  }
};

const createNewLabel = async (req, res) => {
  try {
    const auth = await authorize();
    const { labelName } = req.body;

    if (!labelName) {
      return res.error("Label name is required", 400);
    }

    const newLabel = await emailService.createLabels(auth, labelName);

    // Fetch all labels and send them via Socket.IO
    const labelsWithCounts = await fetchAllLabelsSocket({ auth });
    const io = getIO();
    io.emit("labelsUpdated", labelsWithCounts); // Emit event to all connected clients

    const fetchMessagesByLabelInfo = await fetchMessagesByLabelSocket({ auth });
    io.emit("emailsUpdate", fetchMessagesByLabelInfo); // Emit event to all connected clients

    res.success(newLabel, `Label '${labelName}' created successfully`);
  } catch (error) {
    console.error("Error creating label:", error);

    // Return specific error message to the frontend
    res.error(error.message || "Failed to create label", 400);
  }
};

// Register for Gmail Push Notifications
const registerWatchHandler = async (req, res) => {
  try {
    const auth = await authorize();
    const { topicName } = req.body;

    if (!topicName) {
      return res.error("Missing required field: 'topicName'", 400);
    }

    const response = await emailService.registerWatch(auth, topicName);
    res.success(response, "Push notifications registered successfully");
  } catch (error) {
    console.error("Error registering watch:", error);
    res.error("Failed to register watch", 500, error.message);
  }
};

// Fetch mailbox history
const getHistoryHandler = async (req, res) => {
  try {
    const auth = await authorize();
    const { startHistoryId } = req.query;

    if (!startHistoryId) {
      return res.error(
        "Missing required query parameter: 'startHistoryId'",
        400
      );
    }

    const history = await emailService.listHistory(auth, startHistoryId);
    res.success(history, "Mailbox history fetched successfully");
  } catch (error) {
    console.error("Error fetching history:", error);
    res.error("Failed to fetch mailbox history", 500, error.message);
  }
};

const fetchThreadById = async (req, res) => {
  try {
    const auth = await authorize();
    const { threadId } = req.params;

    if (!threadId) {
      return res.error("Thread ID is required", 400);
    }

    const thread = await emailService.fetchThread(auth, threadId);
    res.success(thread, `Thread '${threadId}' fetched successfully`);
  } catch (error) {
    console.error("Error fetching thread:", error);
    res.error("Failed to fetch thread", 500, error.message);
  }
};

const deleteCustomLabel = async (req, res) => {
  try {
    const auth = await authorize();
    const { labelId } = req.params;

    if (!labelId) {
      return res.error("Label ID is required", 400);
    }

    const result = await emailService.deleteLabel(auth, labelId);

    // Fetch all labels and send them via Socket.IO
    const labelsWithCounts = await fetchAllLabelsSocket({ auth });
    const io = getIO();
    io.emit("labelsUpdated", labelsWithCounts); // Emit event to all connected clients

    const fetchMessagesByLabelInfo = await fetchMessagesByLabelSocket({ auth });
    io.emit("emailsUpdate", fetchMessagesByLabelInfo); // Emit event to all connected clients

    res.success(result, "Label deleted successfully");
  } catch (error) {
    console.error("Error deleting label:", error);
    res.error("Failed to delete label", 500, error.message);
  }
};

const updateLabelInfo = async (req, res) => {
  try {
    const auth = await authorize();
    const { labelId } = req.params;
    const { labelListVisibility, messageListVisibility } = req.body;

    if (!labelId) {
      return res.error("Label ID is required", 400);
    }

    if (!labelListVisibility && !messageListVisibility) {
      return res.error(
        "At least one of 'labelListVisibility' or 'messageListVisibility' must be provided",
        400
      );
    }

    const updateData = {
      ...(labelListVisibility && { labelListVisibility }),
      ...(messageListVisibility && { messageListVisibility }),
    };

    const updatedLabel = await emailService.updateLabel(
      auth,
      labelId,
      updateData
    );
    const labelsWithCounts = await fetchAllLabelsSocket({ auth });
    const io = getIO();

    io.emit("labelsUpdated", labelsWithCounts); // Emit event to all connected clients
    res.success(updatedLabel, "Label updated successfully");

    const fetchMessagesByLabelInfo = await fetchMessagesByLabelSocket({ auth });
    io.emit("emailsUpdate", fetchMessagesByLabelInfo); // Emit event to all connected clients
  } catch (error) {
    console.error("Error updating label:", error);
    res.error("Failed to update label", 500, error.message);
  }
};

const fetchAllLabelsSocket = async ({ auth }) => {
  try {
    const labelsWithCounts = await emailService.getLabelsWithCounts(auth);

    const systemLabels = labelsWithCounts.filter(
      (label) => label.type === "system"
    );
    const customLabels = labelsWithCounts.filter(
      (label) => label.type === "user"
    );

    const labelOrder = [
      "INBOX",
      "STARRED",
      "SENT",
      "DRAFT",
      "IMPORTANT",
      "CATEGORY_PERSONAL",
      "CATEGORY_SOCIAL",
      "CATEGORY_UPDATES",
      "CATEGORY_FORUMS",
      "CATEGORY_PROMOTIONS",
      "CHAT",
      "TRASH",
      "SPAM",
      "UNREAD",
    ];

    const orderedSystemLabels = systemLabels.sort((a, b) => {
      const indexA = labelOrder.indexOf(a.id);
      const indexB = labelOrder.indexOf(b.id);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    const categoryLabels = orderedSystemLabels.filter((label) =>
      label.id.startsWith("CATEGORY_")
    );
    const nonCategorySystemLabels = orderedSystemLabels.filter(
      (label) => !label.id.startsWith("CATEGORY_")
    );

    return {
      systemLabels: nonCategorySystemLabels,
      categories: categoryLabels,
      customLabels: customLabels,
    };
  } catch (error) {
    console.error("Error fetching labels:", error);
    throw error;
  }
};

const fetchMessagesByLabelSocket = async ({ auth }) => {
  try {
    const auth = await authorize();
    const messages = await emailService.listMessages(auth, "INBOX");

    // const io = getIO();
    // io.emit("labelsUpdated", messages); // Emit event to all connected clients

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
};

const updateEmailStatus = async (req, res) => {
  try {
    const auth = await authorize();

    const { messageId } = req.params;
    const { addLabels, removeLabels } = req.body;

    // Validate input
    if (!messageId) {
      return res.error("Message ID is required", 400);
    }
    if (!Array.isArray(addLabels) || !Array.isArray(removeLabels)) {
      return res.error("'addLabels' and 'removeLabels' should be arrays", 400);
    }

    // Call the service to modify email labels
    const updatedEmail = await modifyEmailLabels(
      auth,
      messageId,
      addLabels,
      removeLabels
    );

    // Fetch all labels and send them via Socket.IO
    const labelsWithCounts = await fetchAllLabelsSocket({ auth });
    const io = getIO();
    io.emit("labelsUpdated", labelsWithCounts); // Emit event to all connected clients

    const fetchMessagesByLabelInfo = await fetchMessagesByLabelSocket({ auth });
    io.emit("emailsUpdate", fetchMessagesByLabelInfo); // Emit event to all connected clients

    res.success(updatedEmail, "Email status updated successfully");
  } catch (error) {
    console.error("Error updating email status:", error);
    res.error("Failed to update email status", 500, error.message);
  }
};

const sendUserEmail = async (req, res) => {
  try {
    const auth = await authorize();
    const { to, from, subject, body, parentMessageId } = req.body;

    // Validate required fields
    if (!to || !from || !subject || !body) {
      return res.failure(
        "Missing required fields: 'to', 'from', 'subject', or 'body'",
        400
      );
    }

    const emailResponse = await emailService.sendEmailWithReply(auth, {
      to,
      from,
      subject,
      body,
      parentMessageId, // Optional: Include this for replies
    });

    // const io = getIO();

    // const fetchMessagesByLabelInfo = await fetchMessagesByLabelSocket({ auth });
    // io.emit("emailsUpdate", fetchMessagesByLabelInfo); // Emit event to all connected clients

    res.data(
      emailResponse,
      parentMessageId
      // ? "Reply sent successfully"
      // : "New email sent successfully"
    );
  } catch (error) {
    console.error("Error sending email:", error);
    res.error("Failed to send email", 500, error.message);
  }
};

// Delete an email by ID

const deleteEmail = async (req, res) => {
  try {
    const auth = await authorize(); // Authorize user
    const { messageId } = req.params; // Extract message ID from request params

    // Validate input
    if (!messageId) {
      return res.error("Message ID is required", 400);
    }

    // Call the service to delete the email
    const deletedEmail = await deleteEmailService(auth, messageId);

    // Return a success response
    res.success(
      deletedEmail,
      `Email with ID '${messageId}' deleted successfully`
    );
  } catch (error) {
    console.error("Error deleting email:", error);
    res.error("Failed to delete email", 500, error.message);
  }
};

// Run the test
// testGoogleProfile();

// const initializeGmailService = (auth) => google.gmail({ version: "v1", auth });

// const registerWatch2 = async (topicName="projects/ai-powered-inbox/topics/email-notifications") => {
//   const auth = await authorize();

//   const gmail = initializeGmailService(auth);
//   const response = await gmail.users.watch({
//     userId: "me",
//     requestBody: {
//       labelIds: ["INBOX"], // Only watch for changes in the inbox
//       topicName,
//     },
//   });
//   return response.data;
// };

// registerWatch2();

const fetchUserProfile = async (req, res) => {
  try {
    const email = req.decodedToken.email;

    let company = "Default Company";
    let plan = "No current plan"; // Default plan when no subscription is found
    let name = "Default Name";

    // Use default values if name or company are missing
    const userName = name || "Default Name"; // Default name
    const userCompany = company || "Default Company"; // Default company

    // Validate email is provided
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email
    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: "User not found with this email" });
    }

    // Find user's subscription details
    let userSubscription = await Subscription.findOne({
      userId: user.id,
    }).populate("planId");

    let aiQuotaTotal = 0;
    let aiQuotaUsed = 0;

    // If user has a subscription, use the values from the subscription
    if (userSubscription) {
      aiQuotaTotal = userSubscription.planId.aiResponseLimit;
      aiQuotaUsed = userSubscription.aiResponsesUsed;
      plan = userSubscription.planId.name; // Use the plan name from the subscription
    }

    // Construct the response object
    let response = {
      name: userName, // Use the provided or default name
      email: email,
      company: userCompany, // Use the provided or default company
      plan: plan, // If no subscription, "No current plan"
      aiQuota: {
        used: aiQuotaUsed, // Use provided or default AI quota used
        total: aiQuotaTotal, // Use provided or default AI quota total
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
const fetchShopifyStores = async (req, res) => {
  try {
    const email = req.decodedToken.email;
    // Validate email is provided
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email
    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: "User not found with this email" });
    }

    // Get all Shopify store info (all stores)
    let shopifyStores = user.shopifyTokens || [];

    // Construct response with the list of stores and their statuses
    let response = shopifyStores.map((store) => ({
      storeName: store.storeName,
      isActive: store.isActive,
    }));

    console.log(response);
    res.json(response); // Return list of stores with status
  } catch (error) {
    console.error("Error fetching Shopify stores:", error);
    res.status(500).json({
      error: "Failed to fetch Shopify stores",
      message: error.message,
    });
  }
};

// fetchUserProfile();

module.exports = {
  fetchAllLabels,
  fetchMessagesByLabel,
  fetchMessageDetails,
  registerWatchHandler,
  getHistoryHandler,
  createNewLabel,
  fetchThreadById,
  deleteCustomLabel,
  updateLabelInfo,
  updateEmailStatus,
  sendUserEmail,
  deleteEmail,
  fetchUserProfile,
  fetchShopifyStores,
};
