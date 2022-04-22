const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  secureConnection: false,
  auth: {
    type: "login",
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_PASS,
  },
});
transporter.verify(function (error, success) {
  if (error) {
    console.log("ERROR", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
const sendEmail = (to, subject, data) => {
  let url = "";
  let html = "";
  if (subject.includes("Email Verification")) {
    url = `https://realtime-chat-socketio-app.herokuapp.com/verify?token=${data.token}`;
    html = `Click the link to verify your email and complete registration. ${url}`;
  }
  let mailOptions = {
    from: "Socket.io Chat App " + process.env.MAILER_EMAIL,
    to: to,
    subject: subject,
    html: html,
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log("ERROR", err);
    } else {
      console.log("Mail sent info ", info);
    }
  });
};

module.exports = { sendEmail };
