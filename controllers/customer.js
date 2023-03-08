//Models
const customerModel = require("../models/Customer");

//Utility Functions
const generateToken = require("../utils/generateToken");
const { Estimate } = require("../utils/Methods");

//NPM Packages
const bcrypt = require("bcryptjs");

/**
 * @description Signup
 * @route POST /api/customer/signup
 * @access Public
 */
module.exports.customerSignup = async (req, res) => {
  const { ...payload } = req.body;
  const data = { ...payload };

  //Edge cases and errors
  if (data.phoneNumber.length < 11) {
    return res
      .status(400)
      .json({ errors: [{ msg: "Invalid Phone Number", status: false }] });
  }
  if (data.email === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Email is required", status: false }] });
  } else {
    //Regex
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!data.email.match(mailformat)) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Invalid email address", status: false }] });
    }
  }
  if (data.firstName === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Firstname is required", status: false }] });
  }
  if (data.lastName === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Lastname is required", status: false }] });
  }
  if (data.password.length < 8) {
    return res.status(400).json({
      errors: [{ msg: "Password must be atleast 8 characters", status: false }],
    });
  }
  if (data.dob === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Date of Birth is required", status: false }] });
  }
  if (data.address === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Date of Birth is required", status: false }] });
  }
  if (data.profileImage === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Profile Image is required", status: false }] });
  }

  //Preparing Input
  let input = {
    phoneNumber: String(data.phoneNumber),
    email: String(data.email),
    password: String(data.password),
    firstName: String(data.firstName),
    lastName: String(data.lastName),
    dob: String(data.dob),
    address: String(data.address),
    profileImage: String(data.profileImage),
  };

  //Logic
  try {
    const customerExists = await customerModel.findOne({
      $or: [{ ...input.phoneNumber }, { ...input.email }],
    });
    if (customerExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Customer already exists", status: false }] });
    } else {
      try {
        //Creating Customer
        const customer = await customerModel.create({ ...input });

        //Creating token and sending response
        const token = generateToken(customer._id);
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
 * @route POST /api/customer/login
 * @access Public
 */
module.exports.customerLogin = async (req, res) => {
  const { phoneNumber, password } = req.body;

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
    const customer = await customerModel
      .findOne({ phoneNumber })
      .select("+password");
    if (customer) {
      const matched = await bcrypt.compare(password, customer.password);
      if (matched) {
        const token = generateToken(customer._id);
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
        errors: [{ msg: "Customer not found", status: false }],
      });
    }
  } catch (error) {
    return res.status(500).json({ errors: error });
  }
};

/**
 * @description Forgot Password
 * @route PUT /api/customer/forgot-password
 * @access Public
 */
module.exports.forgotPassword = async (req, res) => {
  const { phoneNumber, password, confirmPassword } = req.body;

  //Edge Cases
  if (phoneNumber === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Phone number is required", status: false }] });
  }
  if (password.length < 8 || confirmPassword.length < 8) {
    return res.status(400).json({
      errors: [{ msg: "Password must be atleast 8 characters", status: false }],
    });
  }
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ errors: [{ msg: "Passwords donot match", status: false }] });
  }

  //Reset password logic
  try {
    const customer = await customerModel
      .findOne({ phoneNumber })
      .select("+password");
    if (customer) {
      //Preparing the hash password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      await customerModel.updateOne({ phoneNumber }, { password: hash });
      return res
        .status(200)
        .json({ msg: "Password updated succesfully", status: true });
    } else {
      return res.status(400).json({
        errors: [{ msg: "Customer not found", status: false }],
      });
    }
  } catch (error) {
    return res.status(500).json({ errors: error });
  }
};

/**
 * @description Calculate Estimate Fare
 * @route POST /api/customer/cal-estimate-fare
 * @access Public
 */
module.exports.calEstimateFare = async (req, res) => {
  const { startingLat, startingLng, endingLat, endingLng, vehicleType } =
    req.body;
  let vehicleCost;
  if (vehicleType === "Car") vehicleCost = 10;
  if (vehicleType === "Car A/C") vehicleCost = 15;
  if (vehicleType === "Bike") vehicleCost = 5;

  //Edge Cases
  if (vehicleType === "") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Vehicle Type is required", status: false }] });
  }

  try {
    const estimatedData = await Estimate(
      startingLat,
      startingLng,
      endingLat,
      endingLng
    );
    const distance = Number(
      estimatedData.routes[0].legs[0].distance.text.split(" ")[0]
    );
    const duration = Number(
      estimatedData.routes[0].legs[0].duration.text.split(" ")[0]
    );
    const cost = vehicleCost * distance;

    //Response
    return res.status(200).json({
      distance,
      duration,
      cost,
      status: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: error });
  }
};
