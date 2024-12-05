require('dotenv').config();
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Notification Service is running!');
});

const PORT = 3005;
app.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));
