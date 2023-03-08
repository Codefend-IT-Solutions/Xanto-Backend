const axios = require("axios");

module.exports.distance = (lat1, lon1, lat2, lon2) => {
  var R = 6371.071; // Radius of the Earth in miles
  var rlat1 = lat1 * (Math.PI / 180); // Convert degrees to radians
  var rlat2 = lat2 * (Math.PI / 180); // Convert degrees to radians
  var difflat = rlat2 - rlat1; // Radian difference (latitudes)
  var difflon = (lon2 - lon1) * (Math.PI / 180); // Radian difference (longitudes)

  var d =
    2 *
    R *
    Math.asin(
      Math.sqrt(
        Math.sin(difflat / 2) * Math.sin(difflat / 2) +
          Math.cos(rlat1) *
            Math.cos(rlat2) *
            Math.sin(difflon / 2) *
            Math.sin(difflon / 2)
      )
    );
  return d;
};

module.exports.Estimate = async (lat1, lng1, lat2, lng2) => {
  try {
    const { data } = await axios.post(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${lat1},${lng1}&destination=${lat2},${lng2}&key=${process.env.GOOGLE_API_KEY}`
    );
    return data;
  } catch (error) {
    return res.status(500).json({ errors: error });
  }
};
