const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",      // MySQL user
  password: "",      // MySQL password
  database: "sharif-folio"
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Nodemailer transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sharifislam02001@gmail.com",  // তোমার Gmail
    pass: "xjao heec mfyh jrcz"              // Gmail App Password
  }
});

// API route to save message & send email
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // 1️⃣ Save to MySQL
  const sql = "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)";
  db.query(sql, [name, email, message], async (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // 2️⃣ Send Gmail notification
    try {
      await transporter.sendMail({
        from: `"${name}" <${email}>`,
        to: "YOUR_GMAIL_ADDRESS@gmail.com",
        subject: "New Contact Form Message",
        text: message,
        html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong><br>${message}</p>`
      });

      res.status(200).json({ success: true, message: "Message saved & emailed successfully!" });
    } catch (emailErr) {
      console.error("Email error:", emailErr);
      res.status(500).json({ error: "Message saved but email could not be sent" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
