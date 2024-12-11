const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email provider
  auth: {
    user: "jaloliddinqovlonov15@gmail.com", // Your email
    pass: "vltt oxcg fkwp kfzi", // Your email password
  },
});

// Endpoint to receive vote notifications
app.post("/", async (req, res) => {
  const { poll_id, creator_email, poll_title } = req.body;

  if (!poll_id || !creator_email || !poll_title) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: creator_email,
      subject: `New Vote on Your Poll: ${poll_title}`,
      text: `Your poll titled "${poll_title}" has received a new vote. Visit your dashboard for more details.`,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Notification sent to ${creator_email}`);
    res.status(200).json({ message: "Notification sent successfully" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Error sending notification" });
  }
});

// Start server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
