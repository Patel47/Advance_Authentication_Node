const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "Please provide user name"],
    },
    email: {
        type: String,
        require: [true, "Please provide email"],
        unique: [true, "Email already taken"]
    },
    password: {
        type: String,
        require: [true, "Please provide password"]
    },
    is_varified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("user", userSchema)