const router = require("express").Router();

//Controller Functions
const { requestDriver } = require("../controllers/trip");

//middlewares
const verifyCustomer = require("../middlewares/verifyCustomer");

//routes
router.route("/request-driver").post(verifyCustomer, requestDriver);

module.exports = router;
