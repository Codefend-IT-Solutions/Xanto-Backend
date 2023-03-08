//NPM Packages
const mongoose = require("mongoose");
require("dotenv").config;

module.exports = connect = async () => {
  try {
    await mongoose.set("strictQuery", false);
    const response = await mongoose.connect(process.env.MONGO_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("Connection Created");
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};
