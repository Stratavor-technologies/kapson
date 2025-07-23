const creds = require("../config/develop");
const twilioKey = creds.twilio;

const client = require("twilio")(twilioKey.accountSid, twilioKey.authToken);

// Function to send Message to phone
async function sendMessageOnPhone(
  recipientPhoneNumber,
  MessageBody,
  countryCode
) {
  try {
    // Validate phone number
    if (!recipientPhoneNumber) {
      throw new Error("Phone number is required");
    }

    let res = await client.messages.create({
      body: MessageBody,
      from: twilioKey.fromPhone,
      to: `+${countryCode}${recipientPhoneNumber}`,
    });

    console.log(res);
    return;
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    throw new Error("Failed to send OTP Please enter a valid phone number");
  }
}

module.exports = sendMessageOnPhone;
