const express = require("express");
const app = express();

// Assign PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("Server running at port " + PORT));
