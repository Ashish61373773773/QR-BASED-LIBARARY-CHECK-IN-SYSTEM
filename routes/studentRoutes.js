const express = require("express")
const router = express.Router()

const Student = require("../models/Student")
const QRCode = require("qrcode")
const {v4:uuidv4} = require("uuid")

// Register Student
router.post("/register", async(req,res)=>{

try{

const {name,email} = req.body

const studentId = uuidv4()
const qrData = `http://110.212.113.94/scan/${studentId}`

const qrImage = await QRCode.toDataURL(qrData)

const student = new Student({
name,
email,
studentId,
qrCode:qrImage
})

await student.save()

res.json(student)

}catch(error){
res.status(500).json({message:error.message})
}

})


// Get All Students
router.get("/", async(req,res)=>{

const students = await Student.find()

res.json(students)

})

module.exports = router