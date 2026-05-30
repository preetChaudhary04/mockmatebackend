const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://mockmate-gules.vercel.app"],
    credentials: true,
  }),
);

// importing routes
const authRutes = require("./routes/auth.routes");
const interviewRoutes = require("./routes/interview.routes");

// using routes
app.use("/api/auth", authRutes);
app.use("/api/interview", interviewRoutes);

module.exports = app;
