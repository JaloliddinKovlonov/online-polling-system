const mongoose = require('mongoose');

// Define the Poll schema
const pollSchema = new mongoose.Schema({
  poll_id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true }, // User ID of the poll creator
  creator_email: { type: String, required: true }, // Email of the poll creator
  title: { type: String, required: true },
  options: [
    {
      option_id: { type: String, required: true },
      text: { type: String, required: true },
      votes: { type: Number, default: 0 },
    },
  ],
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date, required: true },
});

// Export the Poll model
module.exports = mongoose.model('Poll', pollSchema);
