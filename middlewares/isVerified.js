//Models
const driverModel = require("../models/Driver");

//Helpers
const {
  Types: { ObjectId },
} = require("mongoose");

module.exports.isVerified = async (id) => {
  try {
    const driver = await driverModel.findOne({ _id: ObjectId(id) });
    if (driver.isVerified) return true;
    return false;
  } catch (error) {
    return res.status(500).json({ errors: error });
  }
};
