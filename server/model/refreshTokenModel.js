const mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel',
        require: true
    },

    token: {
        type: String,
        require: true
    },

    blacklisted: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: '5d'
    }
})

module.exports = mongoose.model('refreshToken', tokenSchema)