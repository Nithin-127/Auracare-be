const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['donor', 'receiver', 'admin'],
    },
    profilePic: {
        type: String,
        default: "",
    },
    isPremium: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;
