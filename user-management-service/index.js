const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
require('./models/User');

const app = express();
app.use(bodyParser.json());

// Routes
app.use('/', userRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`User Management Service running on port ${PORT}`));
