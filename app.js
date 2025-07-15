const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/messages');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

app.use('/api', routes);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});