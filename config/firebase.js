const admin = require("firebase-admin");
const serviceAccount = require("../xanto-be726-firebase-adminsdk-piek0-3d47622df3.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://xanto-be726-default-rtdb.firebaseio.com",
});

const db = admin.firestore();

module.exports = { db };