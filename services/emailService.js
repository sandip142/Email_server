const nodemailer = require('nodemailer');
const config = require('../config/emailConfig');

const transporter = nodemailer.createTransport(config);

exports.sendEmail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: config.auth.user,
      to,
      subject,
      html: htmlContent,  // Change `text` to `html` to send HTML content
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
