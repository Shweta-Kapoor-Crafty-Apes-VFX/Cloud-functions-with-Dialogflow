const express = require("express");
const axios = require("axios");
const {Configuration, OpenAIApi} = require("openai");
require("dotenv").config();
const bodyParser = require("body-parser");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);




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


const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(
    bodyParser.json({
      limit: "250mb",
    }),
),
app.use(
    bodyParser.urlencoded({
      limit: "250mb",
      extended: true,
      parameterLimit: 250000,

    }),
),

app.use((req, res, next) => {
  console.log(`Path ${req.path} with Method ${req.method}`);
  next();
});


app.get("/", (req, res) => {
  res.sendStatus(200);
});


app.post("/dialogflow", async (req, res) => {
  const action = req.body.queryResult.action;
  const queryText = req.body.queryResult.queryText;

  if (action === "input.unknown") {
    const result = await textGeneration(queryText);
    if (result.status == 1) {
      res.send(
          {
            fulfillmentText: result.response,
          },
      );
    } else {
      res.send(
          {
            fulfillmentText: `Sorry, I'm not able to help with that.`,
          },
      );
    }
  } else {
    res.send(
        {
          fulfillmentText: `No handler for the action ${action}.`,
        },
    );
  }
});


module.exports =app;

