const nodemailer = require("nodemailer");
const smtp = require("../config/develop").smtp;
require("dotenv").config();
const emailTemplate = (otp, link,fullName ) => {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>kapsonTools - Reset Password</title>
  </head>
  <body style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 1.5;">
    <div style="margin: 50px auto; width: 70%; padding: 20px 0;">
      <div style="border-bottom: 1px solid #eee;">
        <a href="" style="font-size: 1.4em; color: #00466A; text-decoration: none; font-weight: 600;">kapsonTools</a>
      </div>
      <p style="font-size: 1.1em;">Hi, ${fullName}</p>
      <p>${otp ? 'Thank you for choosing kapsonTools. Use the following code to complete your registration or password reset':'Thank you for choosing kapsonTools. Use the following code to complete your registration or password reset'}</p>
      <h2 style="background: #00466A; margin: 0 auto; width: max-content; padding: 10px 20px; color: #fff; border-radius: 4px;">
        ${otp ? otp : `<a href="${link}" style="color: #fff; text-decoration: none;">Reset your password</a>`}
      </h2>
      <p style="font-size: 0.9em;">Regards,<br />kapsonTools</p>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300;">
        <p>kapsonTools Inc</p>
        <p>1600 Amphitheatre Parkway</p>
        <p>California</p>
      </div>
    </div>
  </body>
</html>
  `;
};
let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: smtp.email,
    pass: smtp.password,
  },
});
// Function to send email to multiple users
exports.sendEmailToMultipleUsers = (recipients, link,fullName) => {
  let loadTemplate;
 

     loadTemplate = emailTemplate("",link,fullName);
  
  let mailDetails = {
    from: smtp.email,
    to: recipients,
    html: loadTemplate,
  };
  // Send email
  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log("Error Occurs:", err);
    } else {
      console.log("Email sent successfully to:", recipients);
    }
  });
};


exports.sendEmailOtpToMultipleUsers = (recipients, otp,fullName) => {
  let loadTemplate;
 

     loadTemplate = emailTemplate(otp,"",fullName);
  
  let mailDetails = {
    from: smtp.email,
    to: recipients,
    html: loadTemplate,
  };
  // Send email
  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log("Error Occurs:", err);
    } else {
      console.log("Email sent successfully to:", recipients);
    }
  });
};


