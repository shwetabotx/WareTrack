const mongoose = require("mongoose")

const ledgerSchema = new mongoose.Schema({

product:String,
type:String,
quantity:Number,
location:String,
date:{
type:Date,
default:Date.now
}

})

module.exports = mongoose.model("Ledger",ledgerSchema)