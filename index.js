//NPM Packages
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();

//Project files and routes
const apiRouter = require("./routes");
const connect = require("./config/db");

//connect to database
connect();

//Utils
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

//connecting routes
app.use("/api", apiRouter);

//Connect Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Your app is running on PORT ${PORT}`);
});
