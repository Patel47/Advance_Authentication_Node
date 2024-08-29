const setTokenCookies = (
  res,
  accessToken,
  refreshToken,
  accessTokenExp,
  refreshTokenExp
) => {
  const accessTokenMaxAge =
    (accessTokenExp - Math.floor(Date.now() / 1000)) * 1000;
  const refrehsTokenMaxAge =
    (refreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    maxAge: accessTokenMaxAge,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: refrehsTokenMaxAge,
  });
};

module.exports = setTokenCookies;
