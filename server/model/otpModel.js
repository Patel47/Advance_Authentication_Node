const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel',
        require: true
    },

    otp: {
        type: String,
        require: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: '15m'
    }
})

module.exports = mongoose.model("otp", otpSchema)