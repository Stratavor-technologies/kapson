const SibApiV3Sdk = require("sib-api-v3-sdk");
const creds = require("../../../config/develop");
const brevo = creds.brevo;
const smtp = creds.smtp;

const mustache = require("mustache");
const path = require("path");
const fs = require("fs");
const baseUrl = creds.webServer.baseUrl;

// Brevo email sending function
const sendEmail = async (toEmail, subject, content) => {
  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;

    // Set API key
    let apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = brevo.key;

    // Create a new instance of the SendSmtpEmail
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email: toEmail }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = content;
    sendSmtpEmail.sender = {
      email: smtp.email || "support@in-talked.com",
      name: "In-Talked",
    };

    // Send the email
    let response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("API called successfully. Returned data: ", response);
  } catch (error) {
    console.error(
      "Failed to send email:",
      error.response ? error.response.body : error.message
    );
  }
};

// Function to send forgot password OTP email
exports.forgotPasswordOTP = async (email, code, name) => {
  try {
    let firstCode = code.charAt(0);
    let secondCode = code.charAt(1);
    let thirdCode = code.charAt(2);
    let fourthCode = code.charAt(3);
    const templatePath = path.resolve("emailTemplates/forgot-password.html");
    const template = fs.readFileSync(templatePath, "utf8");

    const model = {
      userName: name,
      firstCode,
      secondCode,
      thirdCode,
      fourthCode,
    };
    const msg = mustache.render(template, model);

    await sendEmail(email, "Forgot Password OTP", msg); // Send email using Brevo
  } catch (error) {
    throw error;
  }
};

// Function to send comment report email
exports.sendCommentReportEmail = async (message, reportId, commentId, name) => {
  const album = await db.album
    .findOne({
      "post.comments": {
        $elemMatch: { _id: commentId },
      },
    })
    .populate({ path: "post.comments.commentedBy" });

  if (!album) {
    throw new Error("Album not found");
  }

  if (album && album.post.length > 0) {
    for (let post of album.post) {
      for (let comment of post.comments) {
        if (comment) {
          const templatePath = path.resolve(
            "emailTemplates/commentReport.html"
          );
          const template = fs.readFileSync(templatePath, "utf8");

          const model = {
            userName: name,
            message: message,
            imgUrl: post.imgUrl,
            comment: comment.comment,
            commentToName: comment.commentedBy.fullName,
            commentToPhone: comment.commentedBy.phone,
            commentToEmail: comment.commentedBy.email,
            reportId: reportId,
            deleteUrl: `${baseUrl}/api/reports/action/${reportId}`,
            blockUrl: `${baseUrl}/api/reports/block/${reportId}`,
          };
          const msg = mustache.render(template, model);

          await sendEmail("lookapp.es@gmail.com", "Comment Report", msg); // Send email using Brevo
        }
      }
    }
  }
};

// Function to send post report email
exports.sendPostReportEmail = async (message, reportId, postId, name) => {
  const album = await db.album
    .findOne({
      post: { $elemMatch: { _id: postId } },
    })
    .populate({ path: "user" });

  if (album && album.post.length > 0) {
    const post = album.post.find((post) => post._id == postId);
    if (post) {
      const templatePath = path.resolve("emailTemplates/postReport.html");
      const template = fs.readFileSync(templatePath, "utf8");

      const model = {
        userName: name,
        message: message,
        imgUrl: post.imgUrl,
        reportId: reportId,
        commentToName: album.user.fullName,
        commentToPhone: album.user.phone,
        commentToEmail: album.user.email,
        deleteUrl: `${baseUrl}/api/reports/action/${reportId}`,
        blockUrl: `${baseUrl}/api/reports/block/${reportId}`,
      };
      const msg = mustache.render(template, model);

      await sendEmail("lookapp.es@gmail.com", "Post Report", msg); // Send email using Brevo
    }
  }
};
