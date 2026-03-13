const express = require("express")
const router = express.Router()

const Student = require("../models/Student")

const Log = require("../models/Log")

const ExcelJS = require("exceljs")
// Scan QR
router.post("/scan", async(req,res)=>{

try{

const {qrData} = req.body

if(!qrData){
return res.status(400).json({message:"QR data required"})
}

const studentId = qrData.split(":")[1];

console.log("QR DATA:", qrData);
console.log("EXTRACTED ID:", studentId);

const student = await Student.findOne({studentId})

if(!student){
return res.status(404).json({message:"Student not found"})
}

const activeLog = await Log.findOne({
student:student._id,
checkOut:null
})

if(!activeLog){

const newLog = new Log({
student:student._id,
checkIn:new Date(),
checkOut:null
})

await newLog.save()

return res.json({message:"Checked In"})

}else{

activeLog.checkOut = new Date()

await activeLog.save()

return res.json({message:"Checked Out"})

}

}catch(error){

res.status(500).json({message:error.message})

}

})


// Get Logs
router.get("/", async(req,res)=>{

const logs = await Log.find().populate("student")

res.json(logs)

})

module.exports = router