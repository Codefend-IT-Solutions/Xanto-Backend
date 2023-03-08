//Models
const driverModel = require("../models/Driver");

//Firebase Helpers
const { db } = require("../config/firebase");
// const { ref, child, get, set } = require("firebase/database");

//Utility Functions
const generateToken = require("../utils/generateToken");
const { isVerified } = require("../middlewares/isVerified");

//NPM Packages
const bcrypt = require("bcryptjs");

/**
 * @description Signup
 * @route POST /api/driver/signup
 * @access Public
 */
module.exports.driverSignup = async (req, res) => {
  const {
    phoneNumber,
    email,
    password,
    firstName,
    lastName,
    dob,
    address,
    profileImage,
    vehicleType,
    vehicleName,
  } = req.body;

  //Edge cases and errors
  if (phoneNumber.length < 11) {
    return res
      .status(400)
      .json({ errors: [{ msg: "Invalid Phone Number", status: false }] });
  }
  if (email === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Email is required", status: false }] });
  } else {
    //Regex
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email.match(mailformat)) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Invalid email address", status: false }] });
    }
  }
  if (firstName === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Firstname is required", status: false }] });
  }
  if (lastName === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Lastname is required", status: false }] });
  }
  if (password.length < 8) {
    return res.status(400).json({
      errors: [{ msg: "Password must be atleast 8 characters", status: false }],
    });
  }
  if (dob === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Date of Birth is required", status: false }] });
  }
  if (address === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Date of Birth is required", status: false }] });
  }
  if (profileImage === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Profile Image is required", status: false }] });
  }
  if (vehicleName === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Vehicle Name is required", status: false }] });
  }
  if (vehicleType === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Vehicle Type is required", status: false }] });
  }

  //Logic
  try {
    const driverExists = await driverModel.findOne({
      $or: [{ phoneNumber }, { email }],
    });
    if (driverExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Driver already exists", status: false }] });
    } else {
      try {
        //Creating Driver
        const driver = await driverModel.create({
          phoneNumber,
          email,
          password,
          firstName,
          lastName,
          dob,
          address,
          profileImage,
          vehicleType,
          vehicleName,
        });

        //Creating token and sending response
        const token = generateToken(driver._id);
        return res.status(200).json({
          token,
          status: true,
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ errors: error });
      }
    }
  } catch (error) {
    return res.status(500).json({ errors: error });
  }
};

/**
 * @description Login
 * @route POST /api/driver/login
 * @access Public
 */
module.exports.driverLogin = async (req, res) => {
  const { phoneNumber, password, lat, lng } = req.body;

  //Edge cases and errors
  if (phoneNumber === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Phone number is required", status: false }] });
  }
  if (password.length < 8) {
    return res.status(400).json({
      errors: [{ msg: "Password must be atleast 8 characters", status: false }],
    });
  }

  //Login logic
  try {
    const driver = await driverModel
      .findOne({ phoneNumber })
      .select("+password");
    if (driver) {
      const isVerify = await isVerified(driver._id);
      if (isVerify) {
        const matched = await bcrypt.compare(password, driver.password);
        if (matched) {
          //Setting Driver Location in firebase
          await db.collection("Drivers").doc(driver._id.toString()).set({
            lat,
            lng,
            status: "offline",
          });

          const token = generateToken(driver._id);
          return res.status(200).json({
            msg: "Login Successfully",
            token,
            status: true,
          });
        } else {
          return res.status(400).json({
            errors: [{ msg: "Invalid Password", status: false }],
          });
        }
      } else {
        return res.status(400).json({
          errors: [{ msg: "Driver not verified!", status: false }],
        });
      }
    } else {
      return res.status(400).json({
        errors: [{ msg: "Driver not found", status: false }],
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: error });
  }
};

/**
 * @description Verify Driver
 * @route GET /api/driver/verify
 * @access Public
 */
module.exports.driverVerified = async (req, res) => {
  const { phoneNumber } = req.params;
  try {
    await driverModel.updateOne(
      { phoneNumber },
      { isVerified: true },
      { new: true }
    );

    return res.status(200).json({ msg: "Driver Verified!", status: true });
  } catch (error) {
    return res.status(500).json({ errors: error });
  }
};

/**
 * @description Make Driver Online
 * @route PUT /api/driver/online
 * @access Private
 */
module.exports.switchDriverOnline = async (req, res) => {
  const { _id } = req.driver;
  const { lat, lng } = req.body;

  try {
    //Changing Status in MongoDB
    const driver = await driverModel.findOneAndUpdate(
      { _id },
      { status: "online" },
      { new: true }
    );

    //Adding the request on firebase
    await db.collection("Drivers").doc(driver._id.toString()).set({
      lat,
      lng,
      status: "online",
    });

    return res.status(200).json({ msg: "Driver is Online", status: true });
  } catch (error) {
    return res.status(500).json({ errors: error });
  }
};
