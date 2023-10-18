const jwt = require("jsonwebtoken");
const { MailtrapClient } = require("mailtrap");
const Operator = require("../models/Operator");
require("dotenv").config();

const TOKEN = process.env.MAILTRAP_API_TOKEN;
const ENDPOINT = process.env.ENDPOINT;

const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });

const sender = {
  email: process.env.MAIL_SENDER,
  name: process.env.TITLE,
};

const createOperator = async (req, res) => {
  const { firstName, lastName, email, password, mobile } = req.body;
  try {
    if (!firstName || !lastName || !email || !password || !mobile) {
      return res
        .status(422)
        .json({ success: false, msg: "Please fill all the properties" });
    }
    const duplicate = await Operator.findOne({ email: email });
    if (duplicate) {
      return res.status(409).json({ success: false, msg: "Duplicate Entry!" });
    }

    const newOperator = new Operator({
      firstName,
      lastName,
      email,
      password,
      mobile,
    });
    await newOperator.save();
    res.status(201).json({ success: true, msg: "Successfull Registry!" });
  } catch (err) {
    return res.status(424).json({ success: false, msg: "Something Failed!" });
  }
};

const loginOperator = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(422)
        .json({ success: false, msg: "Please fill all the properties" });
    }
    const loggedUser = await Operator.findOne({ email: email });
    if (!loggedUser) {
      return res
        .status(404)
        .send({
          success: false,
          msg: "Invalid credentials. Please try again!",
        });
    }
    const matched = await loggedUser.comparePassword(password);
    if (!matched)
      return res.status(401).json({ success: false, msg: "Wrong Password!" });
    jwt.sign({ user: loggedUser }, process.env.JWT_SECRET_KEY, (err, token) => {
      const userData = {
        JWToken: token,
        firstName: loggedUser.firstName,
        lastName: loggedUser.lastName,
        email: loggedUser.email,
        mobile: loggedUser.mobile,
      };
      res.status(201).json({ success: true, userData: userData });
    });
  } catch (err) {
    return res.status(424).send({ success: false, msg: "Something Failed!" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res
        .status(422)
        .json({ success: false, msg: "Please fill all the properties" });
    }
    let operator = await Operator.findOne({ email: email });
    if (!operator) {
      return res
        .status(404)
        .json({ success: false, msg: "No user with that email!" });
    }
    if (operator.changePassword) {
      return res.status(409).json({
        success: false,
        msg: "Reset password process is already instanciated",
      });
    }
    operator.changePassword = true;
    await operator.save();
    const recipients = [{ email: email }];
    const urlResetPassword = `https://dashboard.gksoftware.gr/pages/authentication/reset/cover.php?email=${email}`;

    client.send({
      from: sender,
      to: recipients,
      subject: "Ξέχασες τον κωδικό σου;",
      html: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: rgba(255, 255, 255, 0.8);">
      <h1 style="color: #333;">Επαναφορά κωδικού</h1>
      <p style="font-size: 16px; color: #666;">Κάντε κλικ στο παρακάτω σύνδεμο για να επαναφέρε τον κωδικό σας</p>
      <a href='${urlResetPassword}'>Αλλαγή Κωδικού</a>
    </div>`,
    });
    return res
      .status(201)
      .json({ succes: true, msg: "Success! check your emails!" });
  } catch (error) {}
  return res.status(424).send({ success: false, msg: "Something Failed!" });
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    if (!email || !newPassword) {
      return res
        .status(422)
        .json({ success: false, msg: "Please fill all the properties" });
    }
    const operator = await Operator.findOne({ email: email });
    if (!operator) {
      return res
        .status(404)
        .json({ success: false, msg: "No user with that email!" });
    }
    const matched = await operator.comparePassword(newPassword);
    if (matched) {
      return res
        .status(409)
        .json({ success: false, msg: "Password should not be the same!" });
    }
    operator.password = newPassword;
    operator.changePassword = false;
    await operator.save();

    const recipients = [{ email: email }];
    client.send({
      from: sender,
      to: recipients,
      subject: "Επιτυχής αλλαγή κωδικού πρόσβασης",
      html: `

      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: rgba(255, 255, 255, 0.8);">
        <h1 style="color: #333;">Επιτυχής επαναφορά κωδικού!</h1>
        <p style="font-size: 16px; color: #666;">Μπορείτε να χρησιμοποιήσετε τον καινούργιο σας κωδικό!</p>
      </div>
        `,
    });
    return res
      .status(200)
      .json({ success: true, msg: "Password has changed successfully!" });
  } catch (error) {
    return res.status(424).send({ success: false, msg: "Something Failed!" });
  }
};

module.exports = {
  createOperator,
  loginOperator,
  forgotPassword,
  resetPassword,
};
