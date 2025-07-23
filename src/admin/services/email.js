const { google } = require("googleapis");
//const { authorize } = require("../../../utils/googleAuth");
// Initialize Gmail service
const initializeGmailService = (auth) => google.gmail({ version: "v1", auth });

exports.listMessages = async (auth, labelId = "INBOX", maxResults = 10) => {
  const gmail = initializeGmailService(auth);

  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: labelId ? [labelId] : undefined,
    maxResults,
  });

  const messages = response.data.messages || [];

  const detailedMessages = await Promise.all(
    messages.map(async (message) => {
      const details = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
      });

      const threadDetails = await fetchThread(auth, details.data.threadId);

      const payload = details.data.payload;
      const headers = payload.headers || [];
      const subjectHeader = headers.find((header) => header.name === "Subject");
      const fromHeader = headers.find((header) => header.name === "From");
      const toHeader = headers.find((header) => header.name === "To");
      const dateHeader = headers.find((header) => header.name === "Date");

      let body = "";
      if (payload.parts) {
        const part = payload.parts.find(
          (part) =>
            part.mimeType === "text/plain" || part.mimeType === "text/html"
        );
        if (part && part.body && part.body.data) {
          body = Buffer.from(part.body.data, "base64").toString("utf8");
        }
      } else if (payload.body && payload.body.data) {
        body = Buffer.from(payload.body.data, "base64").toString("utf8");
      }

      return {
        id: details.data.id,
        threadId: details.data.threadId,
        subject: subjectHeader ? subjectHeader.value : "No Subject",
        from: fromHeader ? fromHeader.value : "Unknown Sender",
        to: toHeader ? toHeader.value : "Unknown Receiver",
        date: dateHeader ? new Date(dateHeader.value).toISOString() : null,
        read: details.data.labelIds
          ? !details.data.labelIds.includes("UNREAD")
          : true,
        folder: labelId.toLowerCase(),
        labels: details.data.labelIds || [],
        body,
        threadHistory: threadDetails.map((email) => ({
          id: email.id,
          threadId: email.threadId,
          subject: email.subject,
          from: email.from,
          to: email.to,
          date: email.date,
          body: email.body,
        })),
      };
    })
  );

  return detailedMessages;
};


exports.getMessageDetails = async (auth, messageId) => {
  try {
    const gmail = initializeGmailService(auth);
    const response = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full", // Ensure we get all message details
    });

    const message = response.data;
    const headers = message.payload.headers;

    // Helper function to get header value by name
    const getHeader = (name) => {
      const header = headers.find(
        (h) => h.name.toLowerCase() === name.toLowerCase()
      );
      return header ? header.value : "";
    };

    // Extract the body content
    let body = "";
    if (message.payload.parts) {
      const part = message.payload.parts.find(
        (p) => p.mimeType === "text/plain" || p.mimeType === "text/html"
      );
      if (part && part.body && part.body.data) {
        body = Buffer.from(part.body.data, "base64").toString("utf-8");
      }
    } else if (message.payload.body && message.payload.body.data) {
      body = Buffer.from(message.payload.body.data, "base64").toString("utf-8");
    }

    return {
      id: message.id,
      threadId: message.threadId,
      subject: getHeader("subject"),
      from: getHeader("from"),
      to: getHeader("to"),
      date: getHeader("date"),
      body: body.trim().substring(0, 100), // Limit body preview to 100 characters
    };
  } catch (error) {
    console.error("Error fetching message details:", error.message);
    throw error.errors; // Re-throw the error to handle it upstream if necessary
  }
};

exports.createLabels = async (auth, labelName) => {
  const gmail = initializeGmailService(auth);

  try {
    const response = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: labelName,
        labelListVisibility: "labelShow", // Options: labelShow, labelHide
        messageListVisibility: "show", // Options: show, hide
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating label:", error.message);

    // Extract error details if available
    const errorDetails =
      error.response?.data?.error?.message || "Failed to create label";

    throw new Error(errorDetails);
  }
};

// List unread emails in a specific label
exports.listUnreadEmails = async (auth, labelId = "INBOX") => {
  const gmail = initializeGmailService(auth);
  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: [labelId],
    q: "is:unread", // Filtering unread emails
  });
  return response.data.messages || [];
};

// Send an email
exports.sendEmail = async (auth, rawMessage) => {
  const gmail = initializeGmailService(auth);

  // Ensure the raw message is Base64-encoded and URL-safe
  const base64EncodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, ""); // Gmail requires URL-safe Base64 encoding

  const response = await gmail.users.messages.send({
    userId: "me",
    resource: { raw: base64EncodedMessage },
  });

  return response.data;
};

exports.getLabelsWithCounts = async (auth) => {
  const gmail = google.gmail({ version: "v1", auth });

  try {
    // Fetch all labels
    const labelsResponse = await gmail.users.labels.list({ userId: "me" });
    const labels = labelsResponse.data.labels || [];

    // Fetch unread and total counts for each label
    const labelsWithCounts = await Promise.all(
      labels.map(async (label) => {
        const unreadCount = await countUnreadEmails(gmail, label.id);
        const totalCount = await countTotalEmails(gmail, label.id);
        return {
          ...label,
          unreadCount,
          totalCount,
        };
      })
    );

    return labelsWithCounts;
  } catch (error) {
    console.error("Error fetching labels with counts:", error);
    throw new Error("Failed to fetch label counts");
  }
};

// Count unread emails for a specific label
const countUnreadEmails = async (gmail, labelId) => {
  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      labelIds: [labelId],
      q: "is:unread",
    });
    return response.data.messages ? response.data.messages.length : 0;
  } catch (error) {
    console.error(`Error counting unread emails for label ${labelId}:`, error);
    return 0;
  }
};

// Count total emails for a specific label
const countTotalEmails = async (gmail, labelId) => {
  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      labelIds: [labelId],
    });
    return response.data.messages ? response.data.messages.length : 0;
  } catch (error) {
    console.error(`Error counting total emails for label ${labelId}:`, error);
    return 0;
  }
};

// Register Gmail Push Notifications
exports.registerWatch = async (auth, topicName) => {
  const gmail = initializeGmailService(auth);
  const response = await gmail.users.watch({
    userId: "me",
    requestBody: {
      labelIds: ["INBOX"], // Only watch for changes in the inbox
      topicName,
    },
  });
  return response.data;
};

// List mailbox history based on a starting history ID
exports.listHistory = async (auth, startHistoryId) => {
  const gmail = initializeGmailService(auth);
  const response = await gmail.users.history.list({
    userId: "me",
    startHistoryId,
  });
  return response.data.history || [];
};

// Handle Pub/Sub notifications
exports.handlePubSubMessage = async (pubSubMessage) => {
  const decodedMessage = Buffer.from(
    pubSubMessage.message.data,
    "base64"
  ).toString("utf8");
  const { historyId } = JSON.parse(decodedMessage);

  const auth = await authorize();
  const gmail = google.gmail({ version: "v1", auth });

  const historyResponse = await gmail.users.history.list({
    userId: "me",
    startHistoryId: historyId,
  });

  const historyItems = historyResponse.data.history || [];
  const newEmails = [];

  for (const history of historyItems) {
    if (history.messagesAdded) {
      for (const msg of history.messagesAdded) {
        const emailDetails = await gmail.users.messages.get({
          userId: "me",
          id: msg.message.id,
        });
        newEmails.push({
          id: emailDetails.data.id,
          threadId: emailDetails.data.threadId,
          snippet: emailDetails.data.snippet,
          headers: emailDetails.data.payload.headers,
        });
      }
    }
  }

  return newEmails;
};

const fetchThread = async (auth, threadId) => {
  const gmail = google.gmail({ version: "v1", auth });

  try {
    // Fetch the thread
    const response = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
    });

    // Extract messages
    const messages = response.data.messages || [];

    // Format each message in the thread
    const formattedMessages = messages.map((message) => {
      const payload = message.payload;
      const headers = payload.headers || [];
      const subjectHeader = headers.find((header) => header.name === "Subject");
      const fromHeader = headers.find((header) => header.name === "From");
      const toHeader = headers.find((header) => header.name === "To");
      const dateHeader = headers.find((header) => header.name === "Date");

      // Extract the body content
      let body = "";
      if (payload.parts) {
        const part = payload.parts.find(
          (part) =>
            part.mimeType === "text/plain" || part.mimeType === "text/html"
        );
        if (part && part.body && part.body.data) {
          body = Buffer.from(part.body.data, "base64").toString("utf8");
        }
      } else if (payload.body && payload.body.data) {
        body = Buffer.from(payload.body.data, "base64").toString("utf8");
      }

      return {
        id: message.id,
        threadId: message.threadId,
        subject: subjectHeader ? subjectHeader.value : "No Subject",
        from: fromHeader ? fromHeader.value : "Unknown Sender",
        to: toHeader ? toHeader.value : "Unknown Receiver",
        date: dateHeader ? new Date(dateHeader.value).toISOString() : null,
        body: body || "No content available",
      };
    });

    // Sort messages by date (oldest to newest)
    formattedMessages.sort((a, b) => new Date(a.date) - new Date(b.date));

    return formattedMessages;
  } catch (error) {
    console.error("Error fetching thread:", error.message);
    return {
      status: "error",
      message:
        error.message ||
        "An unexpected error occurred while fetching the thread.",
    };
  }
};

exports.deleteLabel = async (auth, labelId) => {
  const gmail = google.gmail({ version: "v1", auth });

  try {
    await gmail.users.labels.delete({
      userId: "me",
      id: labelId,
    });
    return {
      success: true,
      message: `Label '${labelId}' deleted successfully`,
    };
  } catch (error) {
    console.error("Error deleting label:", error);
    throw new Error(
      error.response?.data?.error?.message || "Failed to delete label"
    );
  }
};

exports.updateLabel = async (auth, labelId, updateData) => {
  const gmail = google.gmail({ version: "v1", auth });

  try {
    const response = await gmail.users.labels.update({
      userId: "me",
      id: labelId,
      requestBody: {
        ...updateData, // Include the updated fields
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating label:", error);
    throw new Error(
      error.response?.data?.error?.message || "Failed to update label"
    );
  }
};

exports.fetchNewEmails = async (auth, historyId) => {
  const gmail = google.gmail({ version: "v1", auth });
  const response = await gmail?.users?.history?.list({
    userId: "me",
    startHistoryId: historyId,
  });
  if (!response.data.history) {
    console.log("No new history found.");
    return [];
  }
  const historyItems = response.data.history || [];
  const newEmails = [];

  for (const history of historyItems) {
    if (history.messagesAdded) {
      for (const msg of history.messagesAdded) {
        const emailDetails = gmail.users.messages.get({
          userId: "me",
          id: msg.message.id,
        });
        newEmails.push(emailDetails.data);
      }
    }
  }

  return newEmails;
};

// Function to modify email labels
exports.modifyEmailLabels = async (
  auth,
  messageId,
  labelsToAdd = [],
  labelsToRemove = []
) => {
  const gmail = google.gmail({ version: "v1", auth });

  // Call Gmail API to modify email labels
  const response = await gmail.users.messages.modify({
    userId: "me",
    id: messageId,
    requestBody: {
      addLabelIds: labelsToAdd, // Labels to add
      removeLabelIds: labelsToRemove, // Labels to remove
    },
  });

  return response.data; // Return modified email details
};

// Send new email or reply
exports.sendEmailWithReply = async (
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

// Delete an email by ID
exports.deleteEmailService = async (auth, messageId) => {
  const gmail = google.gmail({ version: "v1", auth });

  try {
    // Call Gmail API to delete the email
    await gmail.users.messages.delete({
      userId: "me",
      id: messageId,
    });

    return {
      success: true,
      message: `Email with ID '${messageId}' deleted successfully`,
    };
  } catch (error) {
    console.error("Error deleting email:", error.message);
    throw new Error(
      error.response?.data?.error?.message || "Failed to delete email"
    );
  }
};

exports.getUserProfile = async () => {
  try {
    const auth = await authorize();
    const oauth2 = google.oauth2({ version: "v2", auth });

    const response = await oauth2.userinfo.get();
    return response.data; // Contains user profile details like name, email, picture, etc.
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    throw new Error("Failed to fetch user profile.");
  }
};

registerWatchForInbox = async () => {
  const auth = await authorize();
  const gmail = google.gmail({ version: "v1", auth });

  const response = await gmail.users.watch({
    userId: "me",
    requestBody: {
      topicName: "projects/ai-powered-inbox/topics/email-notifications",
      labelIds: ["INBOX"], // Specify INBOX label to watch only the inbox
    },
  });

  console.log("Watch registered for INBOX only:", response.data);
  return response.data;
};

// module.exports = {
//   fetchThread,
// };
