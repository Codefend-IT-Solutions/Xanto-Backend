//Utility Functions
const { Estimate } = require("./Methods");

//Firebase Helpers
const { db } = require("../config/firebase");

module.exports.MatchingAlgo = async (startingLat, startingLng) => {
  //Fetch Nearby Driver
  const drivers = [];
  const selected_drivers = [];

  try {
    //Finding Drivers
    await db
      .collection("Drivers")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          drivers.push({ id: doc.id, ...doc.data() });
        });
      })
      .catch((error) => {
        console.log(error);
      });

    //Find Nearest Drivers
    for (let i = 0; i < drivers.length; i++) {
      const estimateDistance = await Estimate(
        startingLat,
        startingLng,
        drivers[i].lat,
        drivers[i].lng
      );
      let distance = Number(
        estimateDistance.routes[0].legs[0].distance.text.split(" ")[0]
      );

      if (distance < 5 && drivers[i].status === "online") {
        selected_drivers.push(drivers[i]);
      }
    }

    const limit = Math.ceil(selected_drivers.length * 0.6);

    //Sorting Using Distance and Rating
    function getDistanceAndRating(d) {
      return [d.distance, -d.rating];
    }

    const sortedDrivers = selected_drivers
      .sort((a, b) => {
        const [aDistance, aRating] = getDistanceAndRating(a);
        const [bDistance, bRating] = getDistanceAndRating(b);

        if (aDistance < bDistance) {
          return -1;
        } else if (aDistance > bDistance) {
          return 1;
        } else if (aRating < bRating) {
          return -1;
        } else if (aRating > bRating) {
          return 1;
        } else {
          return 0;
        }
      })
      .slice(0, limit);

    return sortedDrivers;
  } catch (error) {
    console.log(error);
  }
};
