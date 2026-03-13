const mongoose = require("mongoose")

const studentSchema = new mongoose.Schema({

name:{
type:String,
required:true
},

email:{
type:String,
required:true
},

studentId:{
type:String,
unique:true
},

qrCode:{
type:String
}

})

module.exports = mongoose.model("Student",studentSchema)