const express = require("express");
const userController = require("../controller/userController");
const passport = require("passport");
const setAuthHeader = require("../middleware/accessTokenAutoRefresh");
require("../config/passport-stretegy-jwt");
// const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/register", userController.userRegistration);
router.post("/verify-email", userController.verifyEmail);
router.post("/login", userController.userLogin);
router.post("/refresh-token", userController.getNewAccessToken);
router.post("/reset-password", userController.sendPasswordResetEmail);
router.post("/reset-password/:id/:token", userController.passwordReset);

router.get(
  "/me",
  setAuthHeader,
  passport.authenticate("jwt", { session: false }),
  userController.userProfile
);

router.post(
  "/change-password",
  setAuthHeader,
  passport.authenticate("jwt", { session: false }),
  userController.changePassword
);

router.post(
  "/logout",
  setAuthHeader,
  passport.authenticate("jwt", { session: false }),
  userController.userLogout
);

module.exports = router;
