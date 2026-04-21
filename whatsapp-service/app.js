const fs = require('fs');
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isClientReady = false;

client.on('qr', (qr) => {
    console.log('\n=============================================');
    console.log('🤖 SCAN THIS QR CODE WITH YOUR WHATSAPP APP');
    console.log('=============================================\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp Web Client is ready!');
    isClientReady = true;
});

client.on('auth_failure', msg => {
    console.error('❌ WhatsApp Authentication failure', msg);
});

client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp was disconnected:', reason);
    isClientReady = false;
});

client.initialize();

// REST API endpoint to trigger messages
app.get('/send', async (req, res) => {
    // Expected query params: ?phone=91XXXXXXXXXX&text=Hello
    try {
        if (!isClientReady) {
            return res.status(503).json({ error: 'WhatsApp client is not ready yet. Please scan the QR code in the terminal.' });
        }

        const phone = req.query.phone;
        const text = req.query.text;

        if (!phone || !text) {
            return res.status(400).json({ error: 'Missing phone or text parameters' });
        }

        // whatsapp-web.js expects phone numbers in the format: country_code+number@c.us
        // Strip out any non-numeric characters (like +)
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Auto-prepend India country code '91' if the user only entered a 10-digit number
        let finalPhone = cleanPhone;
        if (finalPhone.length === 10) {
            finalPhone = `91${finalPhone}`;
        }
        
        const chatId = `${finalPhone}@c.us`;

        await client.sendMessage(chatId, text);
        console.log(`✉️ Message successfully sent to ${cleanPhone}`);
        
        res.status(200).json({ success: true, message: `Message sent to ${cleanPhone}` });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ error: err.toString() });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 WhatsApp microservice running on http://localhost:${PORT}`);
});
