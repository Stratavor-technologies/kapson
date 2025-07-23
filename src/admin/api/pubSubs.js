// Handle Pub/Sub notifications

const {
  listMessages,
  fetchThread,
  getLabelsWithCounts,
} = require("../services/email");
//const { authorize } = require("../../../utils/googleAuth");
const { getIO } = require("../../socket");
const { google } = require("googleapis");
const processedHashes = new Set();

const handleNotifications = async (req, res) => {
  try {
    const pubSubMessage = req.body;

    if (
      !pubSubMessage ||
      !pubSubMessage.message ||
      !pubSubMessage.message.data
    ) {
      console.error("Invalid Pub/Sub message format");
      return res.status(400).send("Invalid Pub/Sub message format");
    }

    // Decode the Pub/Sub message
    const decodedMessage = Buffer.from(
      pubSubMessage.message.data,
      "base64"
    ).toString("utf8");
    const { historyId, emailAddress } = JSON.parse(decodedMessage);

    console.log("Received email address:", emailAddress);
    // Generate a unique hash for the message
    const messageHash = historyId; // Or use a cryptographic hash function like SHA-256

    // Check if the hash has already been processed
    if (processedHashes.has(messageHash)) {
      console.log("Duplicate message detected. Skipping:", historyId);
      return res.status(200).send("Duplicate message. Skipping.");
    }

    // Add the hash to the Set
    processedHashes.add(messageHash);

    // Optional: Remove the hash after a certain period (TTL)
    setTimeout(() => processedHashes.delete(messageHash), 60000); // Remove after 1 minute

    // Process the notification logic...
    console.log("Processing historyId:", historyId);

    // Fetch user data
    const user = await User.findOne({ email: emailAddress });

    if (!user) {
      console.error("User not found");
      return res.status(404).send("User not found");
    }

    // Check subscription
    const subscription = await Subscription.findOne({
      userId: user.id,
      isActive: true,
    }).populate("planId");

    if (
      !subscription ||
      subscription.aiResponsesUsed >= subscription.planId.aiResponseLimit
    ) {
      console.log(
        "No active subscription or AI response limit reached for user:",
        emailAddress
      );

      // Update labels and emit events even if subscription is not active or limit is reached
      const auth = await authorize();
      const labelsWithCounts = await fetchAllLabelsSocket({ auth });
      const io = getIO();
      io.emit("labelsUpdated", labelsWithCounts); // Emit event to all connected clients

      const fetchMessagesByLabelInfo = await fetchMessagesByLabelSocket({
        auth,
      });
      io.emit("emailsUpdate", fetchMessagesByLabelInfo); // Emit event to all connected clients

      return res
        .status(200)
        .send("No active subscription or AI response limit reached");
    }

    if (!user.isAiAutoPilotEnable) {
      console.log("AI AutoPilot is disabled for user:", emailAddress);

      // Update labels and emit events even if autopilot is disabled
      const auth = await authorize();
      const labelsWithCounts = await fetchAllLabelsSocket({ auth });
      const io = getIO();
      io.emit("labelsUpdated", labelsWithCounts); // Emit event to all connected clients

      const fetchMessagesByLabelInfo = await fetchMessagesByLabelSocket({
        auth,
      });
      io.emit("emailsUpdate", fetchMessagesByLabelInfo); // Emit event to all connected clients

      return res.status(200).send("AI AutoPilot is disabled");
    }

    console.log("AI AutoPilot is enabled for user:", emailAddress);

    console.log("Received historyId:", historyId);

    // Authorization logic
    const auth = await authorize();

    // Fetch all threads from the inbox
    const latestThread = await fetchLatestThread(auth);
    if (!latestThread) {
      console.log("No latest thread found");

      // Update labels and emit events
      const labelsWithCounts = await fetchAllLabelsSocket({ auth });
      const io = getIO();
      io.emit("labelsUpdated", labelsWithCounts);

      const fetchMessagesByLabelInfo = await fetchMessagesByLabelSocket({
        auth,
      });
      io.emit("emailsUpdate", fetchMessagesByLabelInfo);

      return res.status(200).send("No threads to process");
    }

    console.log("Latest thread:", latestThread);

    // Fetch details of the latest thread
    const messageDetails = await fetchThread(auth, latestThread.id);
    if (!messageDetails || messageDetails.length === 0) {
      console.log("No messages in the latest thread");

      // Update labels and emit events
      const labelsWithCounts = await fetchAllLabelsSocket({ auth });
      const io = getIO();
      io.emit("labelsUpdated", labelsWithCounts);

      const fetchMessagesByLabelInfo = await fetchMessagesByLabelSocket({
        auth,
      });
      io.emit("emailsUpdate", fetchMessagesByLabelInfo);

      return res.status(200).send("No messages to process");
    }

    // Check if the last email in the thread is already our reply
    const latestEmailInThread = messageDetails[messageDetails.length - 1];
    const emailRegex = /<([^>]+)>/;
    const match = latestEmailInThread.from.match(emailRegex);
    const extractedEmail = match ? match[1] : latestEmailInThread.from;

    const isOurReply = extractedEmail === user.email;

    if (isOurReply) {
      console.log("Latest email is already our reply. Skipping.");

      // Update labels and emit events
      const labelsWithCounts = await fetchAllLabelsSocket({ auth });
      const io = getIO();
      io.emit("labelsUpdated", labelsWithCounts);

      const fetchMessagesByLabelInfo = await fetchMessagesByLabelSocket({
        auth,
      });
      io.emit("emailsUpdate", fetchMessagesByLabelInfo);

      return res.status(200).send("Already replied to the latest email");
    }

    // Generate AI reply for the latest email
    const aiReply = await generateReplyForEmail({
      subject: latestEmailInThread.subject,
      from: latestEmailInThread.from,
      to: latestEmailInThread.to,
      body: latestEmailInThread.body,
      threadHistory: messageDetails,
    });

    console.log("Generated AI Reply:", aiReply);
    // let aiReply = "RECOVER"
    // Send the reply
    await sendEmailWithReply(auth, {
      to: latestEmailInThread.from, // Reply to the sender
      from: latestEmailInThread.to, // Replace with your email
      subject: `Re: ${latestEmailInThread.subject}`,
      body: aiReply,
      parentMessageId: latestEmailInThread.id, // Pass the latest email ID for threading
    });

    console.log("Reply sent to:", latestEmailInThread.from);

    // Update AI responses used
    subscription.aiResponsesUsed += 1;
    await subscription.save();

    // Update labels and emit events
    const labelsWithCounts = await fetchAllLabelsSocket({ auth });
    const io = getIO();
    io.emit("labelsUpdated", labelsWithCounts);

    const fetchMessagesByLabelInfo = await fetchMessagesByLabelSocket({ auth });
    io.emit("emailsUpdate", fetchMessagesByLabelInfo);

    res
      .status(200)
      .send("Notification processed and replied to the latest email");
  } catch (error) {
    console.error("Error processing notification:", error);
    res.status(500).send("Failed to process notification");
  }
};

const fetchLatestThread = async (auth) => {
  const gmail = google.gmail({ version: "v1", auth });

  const response = await gmail.users.threads.list({
    userId: "me",
    labelIds: ["INBOX"],
    maxResults: 1, // Fetch only the latest thread
  });

  const threads = response.data.threads || [];
  return threads.length > 0 ? threads[0] : null;
};

const fetchMessagesByLabelSocket = async ({ auth }) => {
  try {
    const auth = await authorize();
    const messages = await listMessages(auth, "INBOX");

    // const io = getIO();
    // io.emit("labelsUpdated", messages); // Emit event to all connected clients

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
};

// Send new email or reply
const sendEmailWithReply = async (
  auth,
  { to, from, subject, body, parentMessageId }
) => {
  const gmail = google.gmail({ version: "v1", auth });

  // Start constructing the raw email
  let rawEmail = [`To: ${to}`, `From: ${from}`, `Subject: ${subject}`];
  let threadId = null;

  // If parentMessageId is provided, include threading headers
  if (parentMessageId) {
    const originalMessage = await gmail.users.messages.get({
      userId: "me",
      id: parentMessageId,
      format: "metadata",
      metadataHeaders: ["Message-ID", "Thread-ID"],
    });

    // Extract Message-ID
    const originalMessageId = originalMessage.data.payload.headers.find(
      (header) => header.name === "Message-ID"
    )?.value;

    if (!originalMessageId) {
      throw new Error("Could not retrieve original Message-ID for reply.");
    }

    // Extract Thread-ID
    threadId = originalMessage.data.threadId;

    // Add Reply Headers
    rawEmail.push(`In-Reply-To: ${originalMessageId}`);
    rawEmail.push(`References: ${originalMessageId}`);
  }

  // Add body to the email
  rawEmail = rawEmail.concat(["", body]).join("\r\n");

  // Encode the email
  const encodedMessage = Buffer.from(rawEmail)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  // Send the email, include threadId if it exists
  const requestBody = {
    raw: encodedMessage,
    ...(threadId && { threadId }), // Include threadId only if replying
  };

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody,
  });

  return response.data;
};

const fetchAllLabelsSocket = async ({ auth }) => {
  try {
    const labelsWithCounts = await getLabelsWithCounts(auth);

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

module.exports = {
  handleNotifications,
};
