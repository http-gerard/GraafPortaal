require('dotenv').config({ path: '/Users/gerardvandeneynde/Desktop/graaf-merged/.env' });
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log("Testing SMTP connection to:", process.env.SMTP_HOST, "Port:", process.env.SMTP_PORT);
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Studio Graaf Test" <hello@studio-graaf.be>',
      to: process.env.SMTP_USER || 'hello@studio-graaf.be', // Send to themselves
      subject: "✅ SMTP Test - Studio Graaf Portaal",
      text: "Als je deze e-mail ontvangt, werkt de e-mail (SMTP) configuratie perfect!",
      html: "<h3>Succes! 🎉</h3><p>Als je deze e-mail ontvangt, werkt de e-mail (SMTP) configuratie van het Studio Graaf portaal perfect.</p>"
    });
    console.log("Success! Email sent. Message ID:", info.messageId);
  } catch (error) {
    console.error("Failed to send email. Error:", error.message);
    process.exit(1);
  }
}

testEmail();
