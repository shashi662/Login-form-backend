const express = require("express");
const {
  forgotpassword,
  resetpassword,
  register,
  login,
} = require("../controllers/auth");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgotpassword", forgotpassword);
router.put("/resetpassword/:resetToken", resetpassword);

module.exports = router;
