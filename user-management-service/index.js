const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
require('./models/User');
const cors = require("cors");
require('dotenv').config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL, // Your React app's URL
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }));
  
app.use(bodyParser.json());

// Routes
app.use('/', userRoutes);

const PORT = 3001;
app.listen(PORT, () => console.log(`User Management Service running on port ${PORT}`));
