const User = require("../models/User.js");
const ErrorResponse = require("../utils/errorResponse.js");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const user = await User.create({
      username,
      email,
      password,
    });
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorResponse("Please provide email and password", 400));
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("Invalid email and password", 401));
    } else {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return next(new ErrorResponse("Invalid email and password", 401));
      } else {
        const token = await user.getSignedToken();
        res.status(200).json({
          success: "true",
          token,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

exports.forgotpassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorResponse("Invalid Email", 404));
    }
    const resetToken = await user.getResetPasswordToken();
    await user.save();
    const resetUrl = `${req.protocol}://localhost:8000/api/auth/passwordreset/${resetToken}`;
    const message = `
    <h1>you have requested for password reset.</h1>
    <p>Please go to this link to reset your password</p>
    <a href=${resetUrl}>Click</a>
    `;
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "kumarshashikant05@gmail.com",
          pass: "zcdzlharmzyjcdsw",
        },
      });
      const options = {
        from: "kumarshashikant05@gmail.com",
        to: email,
        subject: "Password Reset Request",
        html: message,
      };
      transporter.sendMail(options, (err, info) => {
        if (err) {
          console.log(err.message);
        } else {
          console.log(info);
        }
      });
      res.status(200).json({
        success: "true",
        data: "email send",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return next(new ErrorResponse("Email could not be send", 500));
    }
  } catch (error) {
    next(error);
  }
};
exports.resetpassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ErrorResponse("Invalid reset token", 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.save();
    res.status(201).json({ success: "true", data: "password reset" });
  } catch (error) {
    return next(error);
  }
};
