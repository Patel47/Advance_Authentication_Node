const jwt = require("jsonwebtoken");

const isTokenExpire = (token) => {
  if (!token) return true;

  const decodedToken = jwt.decode;
  const currentTime = Date.now() / 1000;

  return decodedToken.exp < currentTime;
};

module.exports = isTokenExpire;
