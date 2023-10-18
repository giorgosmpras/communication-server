const mongoose = require("mongoose");

const mailtrapEmailSchema = mongoose.Schema({
  municipality: {
    type: String,
    default: "Valmore City",
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("mailtap_email", mailtrapEmailSchema);
