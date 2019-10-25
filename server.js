const express = require("express");
const app = express();

const connectDB = require("./config/db");

connectDB();

// Assign PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("Server running at port " + PORT));
