const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const twilio = require('twilio');

const upload = multer({ dest: 'uploads/' });
const API_KEY = process.env.API_KEY;
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Middleware de autenticação
router.use((req, res, next) => {
  if (req.headers['x-api-key'] !== API_KEY) {
    return res.status(403).json({ error: 'Chave de API inválida' });
  }
  next();
});

router.post('/enviar', async (req, res) => {
  const { to, message } = req.body;
  try {
    const response = await client.messages.create({
      to,
      body: message,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID
    });
    res.json({ success: true, sid: response.sid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/enviar-lote', upload.single('file'), (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', async (data) => {
      const { numero, mensagem } = data;
      try {
        await client.messages.create({
          to: numero,
          body: mensagem,
          messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID
        });
        results.push({ numero, status: 'enviado' });
      } catch (error) {
        results.push({ numero, status: 'erro', erro: error.message });
      }
    })
    .on('end', () => {
      fs.unlinkSync(req.file.path);
      res.json({ results });
    });
});

module.exports = router;