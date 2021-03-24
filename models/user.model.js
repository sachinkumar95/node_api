const mongoose = require('mongoose');
const User = mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
    },
    address: {
        type: String,
    },
    password: {
        type: String,
    },
    verification_token: {
        type: String,
    },
    resetKey: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }      
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('user', User);