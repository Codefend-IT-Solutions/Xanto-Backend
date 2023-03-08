const router = require("express").Router();

//paths
const customer = require("./customer");
const trip = require("./trip");
const driver = require("./driver");

//routes
router.use("/customer", customer);
router.use("/trip", trip);
router.use("/driver", driver);

module.exports = router;
