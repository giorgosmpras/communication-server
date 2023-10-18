const { MailtrapClient } = require("mailtrap");
const MailtrapEmail = require("../models/Mailtrap_Email");
require("dotenv").config();
const sgMail = require("@sendgrid/mail");

const TOKEN = process.env.MAILTRAP_API_TOKEN;
const ENDPOINT = process.env.ENDPOINT;

const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });

const sender = {
  email: process.env.MAIL_SENDER,
  name: process.env.TITLE,
};

const sendEmail = async (req, res) => {
  const { recipient, subject, body } = req.body;
  try {
    if (!recipient || !subject || !body) {
      return res
        .status(422)
        .json({ success: false, msg: "Please fill all needed properties" });
    }
    const newEmail = new MailtrapEmail({
      subject,
      body,
    });
    await newEmail.save();
    client.send({
      from: sender,
      to: [{ email: recipient }],
      subject: subject,
      html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: rgba(255, 255, 255, 0.8);">
      <h1 style="color: #333;">${subject}</h1>
      <p style="font-size: 16px; color: #666;">${body}</p>
    </div>`,
    });
    return res
      .status(201)
      .json({ succes: true, msg: "Success! Email has been sent" });
  } catch (error) {
    return res.status(424).send({ success: false, msg: "Something Failed!" });
  }
};

const getEmailLength = async (req, res) => {
  try {
    const mailtrapEmail = await MailtrapEmail.find({});
    return res
      .status(200)
      .json({ success: true, length: mailtrapEmail.length });
  } catch (error) {
    return res.status(424).send({ success: false, msg: "Something Failed!" });
  }
};

// const sendBulkEmails = async (req, res) => {
//   const { subject, body } = req.body;
//   try {
//     if (!subject || !body) {
//       return res
//         .status(422)
//         .json({ success: false, msg: "Please fill all needed properties" });
//     }

//     // Web Api Configuration
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//     const emailSubject = subject;
//     const htmlContent = body;
//     mailList = req.body.data;
//     // Domain
//     const domainEmail = process.env.SENDGRID_DOMAIN;

//     mailList.forEach((recipient) => {
//       const msg = {
//         to: recipient,
//         from: domainEmail, // Replace with your sender's email address
//         subject: emailSubject,
//         html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: rgba(255, 255, 255, 0.8);">
//         <h1 style="color: #333;">${emailSubject}</h1>
//         <p style="font-size: 16px; color: #666;">${htmlContent}</p>
//       </div>`,
//       };

//       sgMail
//         .send(msg)
//         .then(() => {
//           console.log("emails sent successfully!");
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     });
//     return res
//       .status(201)
//       .json({ succes: true, msg: "Success! Emails have been sent" });
//   } catch (error) {
//     return res.status(424).send({ success: false, msg: "Something Failed!" });
//   }
// };

module.exports = { sendEmail, getEmailLength };
