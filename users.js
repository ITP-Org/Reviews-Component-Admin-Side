const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true},
    password: {type: String, required: true},
    profilePicture: { type: String, required: true },
    loginStatus: {type: String, required: true}    
});

const User = mongoose.model('users', userSchema);

module.exports = User;