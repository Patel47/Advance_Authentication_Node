const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const connectDb = require("./config/connectDb");
const passport = require("passport");
const userRoute = require("./routes/userRoute");
const cookieParser = require("cookie-parser");
require("./config/passport-stretegy-jwt");
const app = express();
app.use(cookieParser());

connectDb();
app.use(express.json());

// Passport Middleware
app.use(passport.initialize());

// user routes
app.use("/api/user", userRoute);

app.use(errorHandler);

let PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
