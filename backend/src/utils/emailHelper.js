const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const from = process.env.SMTP_FROM || 'no-reply@quotemaster.com';

    // Create SMTP Transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // True for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    // Do not crash the application if email sending fails, return null
    return null;
  }
};

module.exports = {
  sendEmail,
};
