const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)

const userSchema = mongoose.Schema({
    username:String,
    password:String,
    email:String,
    age:Number
})

module.exports = mongoose.model('user', userSchema)
