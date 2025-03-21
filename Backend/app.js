const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectToDB = require("./db/db");
const app = express();
const errorHandler = require("./utils/errorHandler");
const cookieParser = require("cookie-parser");

// Route Imports
const userRoutes = require("./routes/user.route");

connectToDB();
// Cors
app.use(cookieParser());
// app.use(cors());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Your frontend
    credentials: true, // ✅ Allow cookies to be sent
  }),
);
app.use(express.json()); // Parses JSON request body
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/users", userRoutes);

/* Always should be below every route declaration
   Handle the error code & pass the error efficiently */
app.use(errorHandler);

module.exports = app;
