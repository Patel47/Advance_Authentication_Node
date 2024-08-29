const jwt = require("jsonwebtoken");
const refreshTokenModel = require("../model/refreshTokenModel");

const verifyRefreshToken = async (refreshToken) => {
  try {
    const privateKey = process.env.REFRESH_KEY;

    const userRefreshToken = await refreshTokenModel.findOne({
      token: refreshToken,
    });

    if (!userRefreshToken) {
      throw { error: true, message: "Invalid refresh Token" };
    }

    const tokenDetail = jwt.verify(refreshToken, privateKey);
    return {
      tokenDetail,
      error: false,
      message: "Valid refresh token",
    };
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "failed",
      message: "Invalid refresh Token",
    });
  }
};

module.exports = verifyRefreshToken;
