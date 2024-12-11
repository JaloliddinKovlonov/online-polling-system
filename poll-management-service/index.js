const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./db');
const pollRoutes = require('./routes/polls');
const cors = require("cors");

require('dotenv').config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173", // Your React app's URL
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }));

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/', pollRoutes);

const PORT = 3002;
app.listen(PORT, () => console.log(`Poll Management Service running on port ${PORT}`));
