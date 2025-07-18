const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
};

const sendWelcomeEmail = async (to, userId) => {
  return await sendMail({
    to,
    subject: "Welcome to ReviveReads",
    html: `<h1>Your Registration has been completed</h1><p>Your user id is ${userId}</p>`,
  });
};

const sendOtpEmail = async (to, otp) => {
  return await sendMail({
    to,
    subject: "Your ReviveReads OTP Code",
    html: `<h2>Your OTP code is: <b>${otp}</b></h2><p>This code will expire in 5 minutes.</p>`,
  });
};

const sendLockoutEmail = async (to) => {
  return await sendMail({
    to,
    subject: "Account Locked - ReviveReads",
    html: `<h2>Your account has been locked due to multiple failed login attempts.</h2><p>Please try again after 15 minutes. If this wasn't you, please contact support immediately.</p>`,
  });
};

const sendResetPasswordEmail = async (to, resetUrl) => {
  return await sendMail({
    to,
    subject: "Password Reset Request",
    html: `<h1>You requested a password reset</h1>
             <p>Click this link to reset your password:</p>
             <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
             <p>This link will expire in 15 minutes.</p>
             <p>If you didn't request this, please ignore this email.</p>`,
  });
};

const sendPasswordChangedEmail = async (to) => {
  return await sendMail({
    to,
    subject: "Password Changed - ReviveReads",
    html: `<h2>Your password has been changed successfully.</h2><p>If you did not perform this action, please reset your password immediately or contact support.</p>`,
  });
};

module.exports = {
  sendMail,
  sendWelcomeEmail,
  sendOtpEmail,
  sendLockoutEmail,
  sendResetPasswordEmail,
  sendPasswordChangedEmail,
};
