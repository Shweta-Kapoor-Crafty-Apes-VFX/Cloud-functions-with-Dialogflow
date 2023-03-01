// Import required dependencies
const express = require("express"
const express = require("express");
const axios = require("axios");
const {Configuration, OpenAIApi} = require("openai");
require("dotenv").config();
const bodyParser = require("body-parser");

// Create OpenAI configuration using API key from environment variable
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create OpenAI instance using configuration
const openai = new OpenAIApi(configuration);

// Define a function for generating text using OpenAI API
const textGeneration = async (prompt) => {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Human: ${prompt}\nAI: `,
      temperature: 0.5,
      max_tokens: 512,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: ["Human:", "AI:"],
    });
    return {
      status: 1,
      response: `${response.data.choices[0].text}`,
    };
  } catch (error) {
    return {
      status: 0,
      response: "",
    };
  }
};

// Create an instance of the Express app
const app = express();

// Middleware for parsing URL-encoded data in requests
app.use(express.urlencoded({extended: true}));

// Middleware for parsing JSON data in requests
app.use(express.json());

// Middleware for parsing large JSON payloads
app.use(
    bodyParser.json({
      limit: "250mb",
    }),
),

// Middleware for parsing large URL-encoded payloads
app.use(
    bodyParser.urlencoded({
      limit: "250mb",
      extended: true,
      parameterLimit: 250000,

    }),
),

// Middleware for logging request details
app.use((req, res, next) => {
  console.log(`Path ${req.path} with Method ${req.method}`);
  next();
});

// Route for handling the root URL
app.get("/", (req, res) => {
  res.sendStatus(200);
});


// Route for handling requests from Dialogflow
app.post("/dialogflow", async (req, res) => {
  const action = req.body.queryResult.action;
  const queryText = req.body.queryResult.queryText;

  if (action === "input.unknown") {  // If the action is "input.unknown", use OpenAI API to generate a response
    const result = await textGeneration(queryText);
    if (result.status == 1) {
      res.send(
          {
            fulfillmentText: result.response,// Return the generated response
          },
      );
    } else {
      res.send(
          {
            fulfillmentText: `Sorry, I'm not able to help with that.`, // Return a default response if there is an error
          },
      );
    }
  } else {// If the action is not "input.unknown", return a default response
    res.send(
        {
          fulfillmentText: `No handler for the action ${action}.`,
        },
    );
  }
});


// Export the Express app instance
module.exports =app;

