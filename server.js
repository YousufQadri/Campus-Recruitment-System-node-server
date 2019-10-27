const express = require("express");
const app = express();
const cors = require("cors");

const connectDB = require("./config/db");
const user = require("./routes/user");
const company = require("./routes/company");
const student = require("./routes/student");
const job = require("./routes/job");

// Connect with DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ extender: false }));

// Routes
app.use("/api/v1/user", user);
app.use("/api/v1/company", company);
app.use("/api/v1/student", student);
app.use("/api/v1/job", job);

// Assign PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running at port " + PORT));
