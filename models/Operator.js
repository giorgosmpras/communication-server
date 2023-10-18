const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const operatorSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  changePassword: {
    type: Boolean,
    default: false,
  },
});

operatorSchema.pre("save", function (next) {
  var operator = this;

  // only hash the password if it has been modified (or is new)
  if (!operator.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(operator.password, salt, function (err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      operator.password = hash;
      next();
    });
  });
});

operatorSchema.methods.comparePassword = function (candidate) {
  const handler = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidate, handler.password, (err, isMatch) => {
      if (err) return reject(err);
      if (!isMatch) return resolve(false);

      resolve(true);
    });
  });
};

module.exports = mongoose.model("Operator", operatorSchema);
