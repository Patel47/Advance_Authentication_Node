const userModel = require("../model/userModel");
const otpModel = require("../model/otpModel");
const bcrypt = require("bcryptjs");
const sendOTPMail = require("../utils/sendOTP");
const generateTokens = require("../utils/generateTokens");
const setTokenCookies = require("../utils/setTokenCookies");
const refreshAccessToken = require("../utils/refreshAccessToken");
const refreshTokenModel = require("../model/refreshTokenModel");
const jwt = require("jsonwebtoken");
const transporter = require("../config/emailConfig");

class userController {
  // user registration
  static userRegistration = async (req, res) => {
    try {
      // Extract request body parameters
      const { name, email, password, password_confirmation } = req.body;

      // check if all require fields are provided
      if (!name || !email || !password || !password_confirmation) {
        return res
          .status(400)
          .json({ status: "failed", message: "All fields are require" });
      }

      // check if password and password_confirmation is matched
      if (password !== password_confirmation) {
        return res.status(400).json({
          status: "failed",
          message: "Password and Confirm password don't match",
        });
      }

      // check if user already exist
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res
          .status(409)
          .json({ status: "failed", message: "Email already exists" });
      }

      // generating salt
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      // creating new user
      const newUser = await userModel.create({
        name,
        email,
        password: hash,
      });

      sendOTPMail(req, newUser);

      res.status(201).json({
        status: "success",
        message: "Registration Successfull",
        user: { id: newUser._id, email: newUser.email },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to Register, Please try again later",
      });
    }
  };

  // user email verification
  static verifyEmail = async (req, res) => {
    try {
      // fatch data from req.body
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res
          .status(400)
          .json({ status: "failed", message: "All fields are require" });
      }

      // find user by email
      const existingUser = await userModel.findOne({ email });

      if (!existingUser) {
        return res
          .status(404)
          .json({ status: "failed", message: "Email doesn't exists" });
      }

      // check if user is already varified or not
      if (existingUser.is_varified) {
        return res
          .status(400)
          .json({ status: "failed", message: "Email is already verified" });
      }

      // check both user and otp are present or not
      const emailVerification = await otpModel.findOne({
        userId: existingUser._id,
        otp,
      });

      if (emailVerification) {
        // check if otp expired
        const currentTime = new Date();

        const expireTime = new Date(
          emailVerification.createdAt.getTime() + 15 * 60 * 1000
        );

        if (currentTime > expireTime) {
          await sendOTPMail(req, existingUser);

          return res.status(400).json({
            status: "failed",
            message: "OTP expired, new OTP sent to your email",
          });
        }
      }

      if (!emailVerification) {
        // check if user is already verified or not if not then resend the otp
        if (!existingUser.is_varified) {
          await sendOTPMail(req, existingUser);
          return res.status(400).json({
            status: "failed",
            message: "Invalid OTP, new OTP send to your email",
          });
        }

        // it means user is present and have the otp but entering wrong otp
        return res
          .status(400)
          .json({ status: "failed", message: "Invalid OTP" });
      }

      // now otp is valid and not expired
      existingUser.is_varified = true;
      await existingUser.save();

      // also delete email varification document
      await otpModel.deleteMany({ userId: existingUser._id });

      return res
        .status(200)
        .json({ status: "success", message: "Email verified successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to verify Email, Please try again later",
      });
    }
  };

  // user login
  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ status: "failed", message: "All fields are require" });
      }

      const user = await userModel.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ status: "failed", message: "Invalid email or password" });
      }

      if (!user.is_varified) {
        return res
          .status(400)
          .json({ status: "failed", message: "Your account is not verified" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ status: "failed", message: "Invalid email or password" });
      }

      // generate refresh token and access token
      const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
        await generateTokens(user);

      // set all tokens into cookies
      setTokenCookies(
        res,
        accessToken,
        refreshToken,
        accessTokenExp,
        refreshTokenExp
      );

      // send success response with tokens
      res.status(200).json({
        user: { userId: user._id, email: user.email, name: user.name },
        role: user.role,
        status: "success",
        message: "Login successfull",
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_exp: accessTokenExp,
        is_auth: true,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to Login, Please try again later",
      });
    }
  };

  // get new Access token or refresh token
  static getNewAccessToken = async (req, res) => {
    try {
      const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
        await refreshAccessToken(req, res);

      setTokenCookies(
        res,
        accessToken,
        refreshToken,
        accessTokenExp,
        refreshTokenExp
      );

      res.status(200).send({
        status: "Success",
        message: "New tokens generated",
        accessToken,
        refreshToken,
        accessTokenExp,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Invalid refreshToken, Please try again later",
      });
    }
  };

  // profile or logged in user

  static userProfile = async (req, res) => {
    res.send({ user: req.user });
  };

  // change password
  static changePassword = async (req, res) => {
    try {
      const { password, password_confirmation } = req.body;

      if (!password || !password_confirmation) {
        return res
          .status(400)
          .json({ status: "failed", message: "All fields are require" });
      }

      // check if password and password_confirmation is matched
      if (password !== password_confirmation) {
        return res.status(400).json({
          status: "failed",
          message: "Password and Confirm password don't match",
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      await userModel.findByIdAndUpdate(req.user._id, {
        $set: { password: hash },
      });

      res.status(201).json({
        status: "success",
        message: "Password changed Successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to change password, Please try again later",
      });
    }
  };

  // send password reset email
  static sendPasswordResetEmail = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res
          .status(400)
          .json({ status: "failed", message: "All fields are require" });
      }

      const user = await userModel.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ status: "failed", message: "Email Doesn't exist" });
      }

      const token = jwt.sign({ userId: user._id }, process.env.ACCESS_KEY, {
        expiresIn: "15m",
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Password reset link",
        html: `<p>Dear ${user.name}</p>
                <p>click on this<a>http://localhost:5001/api/user/reset-password/${user._id}/${token}</a> link to reset password</p>`,
      });

      res.status(200).json({
        status: "success",
        message: "Password reset mail sent, Please check your mail",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to send an email, Please try again later",
      });
    }
  };

  // password reset
  static passwordReset = async (req, res) => {
    try {
      const { id, token } = req.params;
      const user = await userModel.findById(id);

      if (!user) {
        return res
          .status(404)
          .json({ status: "failed", message: "user not found" });
      }

      jwt.verify(token, process.env.ACCESS_KEY);

      const { password, password_confirmation } = req.body;

      if (!password || !password_confirmation) {
        return res
          .status(400)
          .json({ status: "failed", message: "All fields are require" });
      }

      // check if password and password_confirmation is matched
      if (password !== password_confirmation) {
        return res.status(400).json({
          status: "failed",
          message: "Password and Confirm password don't match",
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      await userModel.findByIdAndUpdate(user._id, {
        $set: { password: hash },
      });

      res.status(201).json({
        status: "success",
        message: "Password reset Successfully",
      });
    } catch (error) {
      if (error.name == "TokenExpiredError") {
        return res.status(400).json({
          status: "failed",
          message: "Token Expired, please request new password reset link",
        });
      }

      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to reset password, Please try again later",
      });
    }
  };

  // logout
  static userLogout = async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      await refreshTokenModel.findOneAndUpdate(
        { token: refreshToken },
        { $set: { blacklisted: true } }
      );

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.clearCookie("is_auth");

      res
        .status(200)
        .json({ status: "success", message: "logout successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "failed",
        message: "Unable to logout, Please try again later",
      });
    }
  };
}

module.exports = userController;
