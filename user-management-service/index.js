const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
require('./models/User');
const cors = require("cors");

const app = express();

app.use(cors({
    origin: "http://localhost:5173", // Your React app's URL
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }));
  
app.use(bodyParser.json());

// Routes
app.use('/', userRoutes);

const PORT = 3001;
app.listen(PORT, () => console.log(`User Management Service running on port ${PORT}`));
