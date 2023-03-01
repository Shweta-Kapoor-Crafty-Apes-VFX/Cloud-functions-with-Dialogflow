// Import the Express app instance
const app = require("./app");

// Start the server and listen on the specified port or default to 8080
app.listen(process.env.PORT || 8080);
