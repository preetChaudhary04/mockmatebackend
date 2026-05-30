const mongoose = require("mongoose");

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to db...");
  } catch (err) {
    console.log("Database connection error: ", err);
  }
}

module.exports = connectDatabase;
