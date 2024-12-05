require('dotenv').config();
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Poll Management Service is running!');
});

const PORT = 3002;
app.listen(PORT, () => console.log(`Poll Management Service running on port ${PORT}`));
