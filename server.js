require("dotenv").config({ path: "./config.env" });
const express = require("express");
const connectDB = require("./config/db.js");
const errorHandler = require("./middleware/error");

const app = express();

app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/private", require("./routes/private"));

app.use(errorHandler);
const PORT = process.env.PORT || 5000;
connectDB(process.env.URI).then((r) => {
  app.listen(PORT, () => {
    console.log(`server is running on port number ${PORT}`);
  });
});
