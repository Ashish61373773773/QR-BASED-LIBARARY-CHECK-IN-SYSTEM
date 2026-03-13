const mongoose = require("mongoose")

const logSchema = new mongoose.Schema({

student:{
type:mongoose.Schema.Types.ObjectId,
ref:"Student"
},

checkIn:{
type:Date
},

checkOut:{
type:Date,
default:null
}

},{timestamps:true})

module.exports = mongoose.model("Log",logSchema)