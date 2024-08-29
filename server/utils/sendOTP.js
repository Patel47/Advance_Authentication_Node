// to send otp for email varification

const transporter = require('../config/emailConfig')
const otpModel = require('../model/otpModel')

const sendOTP = async(req, user) => {
    const otp = Math.floor(1000 + Math.random() * 9000);    

    await new otpModel({ userId: user._id, otp: otp}).save();

    const otpVerificationLink = 'http://localhost:5001/api/user/account/veryfy-email'

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'OTP - verify your account',
        html: `<p>Dear ${user.name}</p>
                <p>Thank you for signing up with our website. To complete your registration, please verify your email address by entering the following one time password (OTP): ${otpVerificationLink}</p>
                <h2>OTP: ${otp}</h2>
                <p>This OTP is valid for 15 minutes. If you didn't request this OTP, please ignore this email.</p>`
    })
}

module.exports = sendOTP;
