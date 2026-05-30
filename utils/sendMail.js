require("dotenv").config();

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMail(to, subject, text) {
    try {
       
        const { data, error } = await resend.emails.send({
        
            from: 'onboarding@resend.dev',
            to: to,
            subject: subject,
            text: text,
        });

        if (error) {
            console.error("Resend API rejected the email:", error.message);
            return;
        }

        console.log("Success! Email ID:", data.id);
    } catch (error) {
        console.error("System connection error:", error);
    }
}

module.exports = { sendMail };