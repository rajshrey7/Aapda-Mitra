import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const myPhone = process.env.MY_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function sendSmsAlert(alertMessage) {
    if (!alertMessage || alertMessage.length === 0) {
        console.log("No alert message to send.");
        return;
    }

    const messageBody = `Weather Alert: ${alertMessage[0].event}. Details: ${alertMessage[0].headline}`;

    try {
        await client.messages.create({
           body: messageBody,
           from: twilioPhone,
           to: myPhone
         });
        console.log("SMS alert sent successfully!");
    } catch (error) {
        console.error("Failed to send SMS:", error);
    }
}