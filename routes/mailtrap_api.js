const express = require("express");
const router = express.Router();

const { sendEmail, getEmailLength } = require("../controllers/mailtrapHandler");

router.post("/email", sendEmail);
router.get("/email-length", getEmailLength);

// router.post("/send-bulk-email", sendBulkEmails);

module.exports = router;
