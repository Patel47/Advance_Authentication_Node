const userModel = require("../model/userModel");
const { Strategy, ExtractJwt } = require("passport-jwt");
const passport = require("passport");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.ACCESS_KEY, // Replace with your secret key
};

passport.use(
  new Strategy(opts, async (jwt_payload, done) => {
    try {
      const user = await userModel.findById(jwt_payload._id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (err) {
      console.error(err);
    }
  })
);

module.exports = passport;
