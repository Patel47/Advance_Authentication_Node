const isTokenExpire = require("../utils/isTokenExpired");
const refreshAccessToken = require("../utils/refreshAccessToken");
const setTokenCookies = require("../utils/setTokenCookies");

const setAuthHeader = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (accessToken || !isTokenExpire(accessToken)) {
      req.headers["authorization"] = `Bearer ${accessToken}`;
    }

    if (!accessToken || isTokenExpire(accessToken)) {
      const oldRefreshToken = req.cookies.refreshToken;

      if (!oldRefreshToken) {
        throw new Error("refresh Token is missing");
      }

      const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
        await refreshAccessToken(req, res);

      setTokenCookies(
        res,
        accessToken,
        refreshToken,
        accessTokenExp,
        refreshTokenExp
      );

      req.headers["authorization"] = `Bearer ${accessToken}`;
    }
    next();
  } catch (error) {
    console.error("Error in adding access token to header: ", error.message);
    res
      .status(401)
      .json({
        error: "Unauthorized",
        message: "Access Token is missing or invalid",
      });
  }
};

module.exports = setAuthHeader;
