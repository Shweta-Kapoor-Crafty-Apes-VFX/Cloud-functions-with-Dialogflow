// Import Firebase Functions and the Express app instance
const functions = require("firebase-functions");
const app = require("./app");

// Export a Firebase HTTPS function that serves the Express app
exports.app = functions.https.onRequest(app);
