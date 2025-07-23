const SibApiV3Sdk = require("sib-api-v3-sdk");
const brevo = require("../config/develop").brevo;

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
      email: "taran.ttc@gmail.com",
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

module.exports = { sendEmail };
