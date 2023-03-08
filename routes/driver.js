const router = require("express").Router();

//Controller Functions
const {
  driverSignup,
  driverLogin,
  driverVerified,
  switchDriverOnline,
} = require("../controllers/driver");

//Middlewares
const verifyDriver = require("../middlewares/verifyDriver");

//routes
router.route("/signup").post(driverSignup);
router.route("/login").post(driverLogin);

router.route("/verify/:phoneNumber").get(driverVerified);
router.route("/online").put(verifyDriver, switchDriverOnline);

module.exports = router;
