import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const transporter = nodemailer.createTransport({
  secure: true,
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const htmlTemplate = fs.readFileSync("./services/emailhtml.html", "utf8");

const sendMail = async (fullname, userEmail, otp) => {
  let finalHtml = htmlTemplate
    .replace(/{{user_name}}/g, fullname)
    .replace(/{{verification_code}}/g, otp);

  const mailOption = {
    from: `"Opinara" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Verify your email address",
    html: finalHtml,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOption, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
         return resolve({
          success: false,
          message: "Failed to send Email",
          error: err,
         })
      } else {
        console.log("OTP Send: ", info.response);
        return resolve({
          success: false,
          message: "Send OTP Mail",
          info: info,
        })
      }
    });
  });
};

export default sendMail;
