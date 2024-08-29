const jwt = require("jsonwebtoken");
const refreshTokenModel = require("../model/refreshTokenModel");

const generateTokens = async (user) => {
  try {
    const payload = { _id: user._id, role: user.role };

    const accessTokenExp = Math.floor(Date.now() / 1000) + 100;

    const accessToken = jwt.sign(
      {
        ...payload,
        exp: accessTokenExp,
      },
      process.env.ACCESS_KEY
    );

    const refreshTokenExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5;

    const refreshToken = jwt.sign(
      {
        ...payload,
        exp: refreshTokenExp,
      },
      process.env.REFRESH_KEY
    );

    // const userRefreshToken = await refreshTokenModel.findOne({
    //   userId: user._id,
    // });

    // if (userRefreshToken) {
    //   await userRefreshToken.remove();
    // }

    await refreshTokenModel.findOneAndDelete({ userId: user._id})

    await new refreshTokenModel({
      userId: user._id,
      token: refreshToken,
    }).save();

    return Promise.resolve({
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp,
    });
  } catch (error) {
    return Promise.reject(error)
  }
};

module.exports = generateTokens;
