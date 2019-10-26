const express = require("express");
const app = express();

const connectDB = require("./config/db");
const user = require("./routes/user");

// Connect with DB
connectDB();

// Middleware
app.use(express.json({ extender: false }));

// Routes
app.use("/api/v1/user", user);

// Assign PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running at port " + PORT));
