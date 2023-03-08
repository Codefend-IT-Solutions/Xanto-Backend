//Models
const tripModel = require("../models/Trip");

//Util Functions
const { MatchingAlgo } = require("../utils/TripMatchingAlgo");

//Firebase Helpers
const { db } = require("../config/firebase");

/**
 * @description Request a driver
 * @route POST /api/trip/request-driver
 * @access Private
 */
module.exports.requestDriver = async (req, res) => {
  const { _id } = req.customer;
  const {
    startingLat,
    startingLng,
    endingLat,
    endingLng,
    tripPrice,
    paymentMethod,
  } = req.body;

  //Edge Cases
  if (startingLat === "" || startingLng === "") {
    return res.status(400).json({
      errors: [{ msg: "Starting Location is required", status: false }],
    });
  }
  if (endingLat === "" || endingLng === "") {
    return res.status(400).json({
      errors: [{ msg: "Ending Location is required", status: false }],
    });
  }
  if (tripPrice <= 0) {
    return res.status(400).json({
      errors: [{ msg: "Trip Price is required", status: false }],
    });
  }
  if (paymentMethod === "") {
    return res.status(400).json({
      errors: [{ msg: "Payment Method is required", status: false }],
    });
  }

  //Request Driver Logic
  try {
    const trip = await tripModel.create({
      customer: _id,
      startingLat,
      startingLng,
      endingLat,
      endingLng,
      tripPrice,
      paymentMethod,
    });

    //Finding Drivers
    const drivers = await MatchingAlgo(startingLat, startingLng);
    console.log(drivers.length);

    //Adding the Selected Drivers to firebase
    for (let i = 0; i < drivers.length; i++) {
      await db.collection("Selected_Drivers").doc(trip._id.toString()).set({
        id: drivers[i].id,
        lat: drivers[i].lat,
        lng: drivers[i].lng,
        status: drivers[i].status,
        rating: drivers[i].rating,
      });
    }

    await db
      .collection("Selected_Drivers")
      .doc(trip._id.toString())
      .set(drivers);

    //Response
    return res.status(200).json({
      status: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: error });
  }
};
