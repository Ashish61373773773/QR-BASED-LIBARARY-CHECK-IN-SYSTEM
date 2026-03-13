const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection (Fixed)
mongoose.connect("mongodb+srv://kumarashish84340:ashish123@cluster0.tkxulh1.mongodb.net/library_db", {
    
})
.then(() => console.log("✅ MongoDB Atlas Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// Schema
const visitorSchema = new mongoose.Schema({
    name: String,
    email: String,
    qrCodeId: { type: String, unique: true },
    entryTime: Date,
    exitTime: Date,
    status: { type: String, default: 'Exited' }
});

const Visitor = mongoose.model('Visitor', visitorSchema);

// --- API ROUTES ---

// 1. Generate a New Library Card
app.post('/api/generate-card', async (req, res) => {
    try {
        const { name, email } = req.body;
        // Generate a unique ID
        const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        
        const newVisitor = new Visitor({
            name,
            email,
            qrCodeId: uniqueId,
            status: 'Exited'
        });

        await newVisitor.save();
        const qrDataUrl = await QRCode.toDataURL(uniqueId);
        
        res.json({ success: true, qrDataUrl, uniqueId });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error generating card", error: error.message });
    }
});

// 2. Handle Scan (Check-in / Check-out)
app.post('/api/scan', async (req, res) => {
    try {
        const { qrCodeId } = req.body;
        const visitor = await Visitor.findOne({ qrCodeId });

        if (!visitor) {
            return res.json({ success: false, message: "Invalid QR Code" });
        }

        const now = new Date();

        if (visitor.status === 'Exited') {
            visitor.entryTime = now;
            visitor.status = 'Inside';
        } else {
            visitor.exitTime = now;
            visitor.status = 'Exited';
        }

        await visitor.save();
        res.json({ success: true, message: visitor.status === 'Inside' ? "Check-in Successful!" : "Check-out Successful!", time: now });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// 3. Get Recent Logs
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await Visitor.find().sort({ entryTime: -1 }).limit(10);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching logs" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});