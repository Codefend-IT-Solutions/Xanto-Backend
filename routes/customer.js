const router = require("express").Router();

//Controller Functions
const {
  customerSignup,
  calEstimateFare,
  customerLogin,
  forgotPassword,
} = require("../controllers/customer");

//routes
router.route("/signup").post(customerSignup);
router.route("/login").post(customerLogin);
router.route("/forgot-password").put(forgotPassword);

router.route("/cal-estimate-fare").post(calEstimateFare);

module.exports = router;


