const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
  },
  email: {
    type: String,
    required: [true, "Please Provide an email address"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password required"],
    minlength: 6,
    // select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

UserSchema.pre("save", function (next) {
  var user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();
  // generate a salt
  bcrypt.genSalt(12, function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.matchPassword = async function (password) {
  const isMatched = await bcrypt.compare(password, this.password);
  return isMatched;
};

UserSchema.methods.getSignedToken = async function () {
  const token = jwt.sign({ id: this._id }, "my token", { expiresIn: "10min" });
  return token;
};
UserSchema.methods.getResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(45).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 60 * 1000 * 10;
  return resetToken;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
