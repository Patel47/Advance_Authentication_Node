const verifyRefreshToken = require("../utils/verifyRefreshToken");
const userModel = require("../model/userModel");
const refreshTokenModel = require("../model/refreshTokenModel");
const generateTokens = require("../utils/generateTokens");

const refreshToken = async (req, res) => {
  try {
    // console.log(req.cookies);

    const oldRefreshToken = req.cookies.refreshToken;

    const { tokenDetail, error } = await verifyRefreshToken(oldRefreshToken);

    if (error) {
      return res
        .status(401)
        .send({ status: "failed", message: "Invalid refresh Token" });
    }

    const user = await userModel.findById(tokenDetail._id);

    // console.log(user);
    // console.log(tokenDetail);

    if (!user) {
      return res
        .status(404)
        .send({ status: "failed", message: "User not found" });
    }

    const userRefreshToken = await refreshTokenModel.findOne({
      userId: tokenDetail._id,
    });

    // console.log(oldRefreshToken);
    // console.log(userRefreshToken);

    if (oldRefreshToken !== userRefreshToken.token) {
      return res
        .status(401)
        .send({ status: "failed", message: "Unauthorized access" });
    }

    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
      await generateTokens(user);

    return {
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp,
    };
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ status: "failed", message: "Internal server error" });
  }
};

module.exports = refreshToken;
