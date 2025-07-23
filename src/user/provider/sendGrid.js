const sendGrid = require("config").get("sendGrid");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(sendGrid.key);

exports.sendMail = (toEmail, message, type) => {
  if (!toEmail) {
    return Promise.reject("to email is required");
  }
  if (!message) {
    return Promise.reject("message is required");
  }
  if (!message.body) {
    return Promise.reject("message.body is required");
  }
  try {
    // const msg = {
    //   to: toEmail,
    //   from: "intalked <admin@hardkore.tech>",
    //   cc: "admin@hardkore.tech",
    //   subject: message.subject || "intalked",
    //   html: message.body,
    // };
    const msg = {
      to: toEmail,
      from: "intalked <taran.ttc@gmail.com>",
      cc: "taran.ttc@gmail.com",
      subject: message.subject || "intalked",
      html: message.body,
    };sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    throw error;
  }
};
