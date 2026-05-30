require("dotenv").config();
const app = require("./src/app");
const connectDatabase = require("./src/config/db");

connectDatabase();

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}...`);
});
