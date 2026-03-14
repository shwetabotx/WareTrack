const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({

email:String,

password:String,

otp:Number,

otpExpiry:Number

})

module.exports = mongoose.model("User",userSchema)