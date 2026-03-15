const express = require("express");
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// ==========================
// Middleware
// ==========================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// ==========================
// MongoDB Connection
// ==========================
mongoose.connect("mongodb+srv://kumarashish84340:ashish123@cluster0.tkxulh1.mongodb.net/library_db")
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log("MongoDB Error:", err);
});


// ==========================
// Visitor Schema
// ==========================
const visitorSchema = new mongoose.Schema({
    name: String,
    email: String,
    qrCodeId: { type: String, unique: true },
    entryTime: Date,
    exitTime: Date,
    status: { type: String, default: "Exited" }
});

const Visitor = mongoose.model("Visitor", visitorSchema);


// ==========================
// Generate QR Card
// ==========================
app.post("/api/generate-card", async (req, res) => {

    try {

        const { name, email } = req.body;

        if (!name || !email) {
            return res.json({
                success: false,
                message: "Name and Email required"
            });
        }

        const uniqueId = new mongoose.Types.ObjectId().toString();

        const visitor = new Visitor({
            name,
            email,
            qrCodeId: uniqueId
        });

        await visitor.save();

        const qrCode = await QRCode.toDataURL(uniqueId);

        res.json({
            success: true,
            qrCode: qrCode,
            uniqueId: uniqueId
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "QR Generation Error"
        });

    }

});


// ==========================
// Scan QR (Check-in / Check-out)
// ==========================
app.post("/api/scan", async (req, res) => {

    try {

        const { qrCodeId } = req.body;

        const visitor = await Visitor.findOne({ qrCodeId });

        if (!visitor) {
            return res.json({
                success: false,
                message: "Invalid QR Code"
            });
        }

        const now = new Date();

        if (visitor.status === "Exited") {

            visitor.entryTime = now;
            visitor.status = "Inside";

            await visitor.save();

            res.json({
                success: true,
                message: "Check-in Successful",
                time: now
            });

        } else {

            visitor.exitTime = now;
            visitor.status = "Exited";

            await visitor.save();

            res.json({
                success: true,
                message: "Check-out Successful",
                time: now
            });

        }

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});


// ==========================
// Get Logs
// ==========================
app.get("/api/logs", async (req, res) => {

    try {

        const logs = await Visitor
        .find()
        .sort({ entryTime: -1 })
        .limit(20);

        res.json(logs);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch logs"
        });

    }

});


// ==========================
// Start Server
// ==========================
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});