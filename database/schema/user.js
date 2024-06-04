const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email:{
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true,
    },
    password: {
        type: mongoose.SchemaTypes.String
    },
    password_confirmation: {
        type: mongoose.SchemaTypes.String
    },
    created_at:{
        type: mongoose.SchemaTypes.Date,
        required: true,
        default: new Date(),
    }
});

module.exports = mongoose.model('users', UserSchema);