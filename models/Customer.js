//NPM Packages
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const customerSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      max: 50,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      max: 50,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      minlength: [6, "Password must be atleast 6 characters"],
      maxlength: [1024, "Password cannot excede 1024 characters"],
      select: false,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    dob: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

//Encrypting the password
customerSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("customer", customerSchema);
