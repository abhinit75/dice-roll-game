import * as Alexa from "ask-sdk";
import { escapeXmlCharacters, getSlotValue } from "ask-sdk";
import { isIntent } from "./isIntent";
var AWS = require("aws-sdk");

const region = "us-east-1";
const accessKeyId = "AKIA2ZKMI5RI34N7AEOQ";
const secretAccessKey = "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";
const tableName = "dice-roll-game-table";

// Helper Functions

const rollDice = () => {
  return Math.floor(Math.random() * 6) + 1;
};

const add_to_db = (item) => {
  let dynamoDB = new AWS.DynamoDB({
    region: region,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  });

  let params = {
    TableName: tableName,
    Item: {
      TIME: { S: item.time },
      NAME: { S: item.name },
      SCORE: { S: item.score.toString() },
    },
  };
  dynamoDB.putItem(params).promise();
};

// retrieve top 10 records from dynamodb
const retrieve_scores = async () => {
  // data
  let sorted_data = [];

  // Create the DynamoDB service object
  let dynamoDB = new AWS.DynamoDB({
    region: region,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    apiVersion: "2012-08-10",
  });

  var params = {
    TableName: tableName,
  };
  let data = await dynamoDB.scan(params).promise();
  var items = data.Items;
  items.sort(function (a, b) {
    return parseInt(b.SCORE.S) - parseInt(a.SCORE.S);
  });

  items.size > 10 ? (sorted_data = items.slice(0, 10)) : (sorted_data = items);
  return sorted_data;
};

// Launch Request Handler
const HelloIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest" ||
      isIntent("HelloWorldIntent")(handlerInput)
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(
        `Welcome to Dice Roll. To start a new game, you can say "start game". You can also view top 10 high scores by saying "view high scores" or you can say "end game" to quit.`
      )
      .reprompt(
        `I was not able to catch what you said there. To start a new game, you can say "start game". You can also view top 10 high scores by saying "view high scores" or you can say "end game" to quit.`
      )
      .withShouldEndSession(false)
      .getResponse();
  },
};

// const New Game Intent
const NewGameIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "NewGameIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = `
      Before we start the game, let me begin with some quick rules. When ready, you can say "roll a die". If you roll a number from 2-6, the number gets added to your score. If you roll a 1, you score gets reset to 0. 
      
      May the force of luck be with you.
      `;
    // Set a session attribute named "score" with the value "0"
    handlerInput.attributesManager.setSessionAttributes({
      score: "0",
    });

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(false)
      .getResponse();
  },
};

// GameIntent
const DiceRollIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "DiceRollIntent"
    );
  },
  async handle(handlerInput) {
    const val = rollDice();

    // retrieve score value
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    let prev_score = sessionAttributes.score;

    // Handle dice values
    if (val == 1) {
      sessionAttributes.score = 0;
    } else {
      if (prev_score == "0") {
        console.log(prev_score);
        sessionAttributes.score = val;
      } else {
        sessionAttributes.score = parseInt(prev_score) + val;
      }
    }

    // set attribute values
    await handlerInput.attributesManager.setSessionAttributes(
      sessionAttributes
    );

    return handlerInput.responseBuilder
      .speak(
        `You rolled a ${val}. Your new score is: ${sessionAttributes.score}. Would you like to continue or end the game?. To continue, you can say "roll a die" and to end you can say "end game".`
      )
      .reprompt(`To continue, say "roll a die" and to end say "end game".`)
      .withShouldEndSession(false)
      .getResponse();
  },
};

// EndGameIntentHandler
const EndGameIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "EndGameIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      "The game has ended. Would you like to add your name to the high score list?";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

// NameIntentHandler
const NameIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "NameIntent"
    );
  },
  handle(handlerInput) {
    const speechText = "What is your name?";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

// HighScoreIntentHandler
const HighScoreIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "HighScoreIntent"
    );
  },
  async handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    let name = handlerInput.requestEnvelope.request.intent.slots.name.value;
    let final_score = sessionAttributes.score;

    let item = {
      time: new Date().toISOString(),
      name: name,
      score: final_score,
    };

    // Save to DynamoDB
    await add_to_db(item);

    const speakOutput = `Your highscore of ${final_score} with name: ${name} is saved`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

// No high Score Intent
const NoHighScoreIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.NoIntent"
    );
  },
  handle(handlerInput) {
    const speechText = "Hope you had fun playing! Goodbye.";

    return handlerInput.responseBuilder
      .speak(speechText)
      .withShouldEndSession(true)
      .getResponse();
  },
};

// View High Score Intent
const ViewHighScoreIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "ViewHighScoreIntent"
    );
  },
  async handle(handlerInput) {
    // Retrieve from DB top 10 high scores
    const data = await retrieve_scores();
    console.log("This is data: " + JSON.stringify(data));

    // speak output:
    let speakOutput = "The top 10 high scores are: ";

    for (let i = 0; i < data.length; i++) {
      speakOutput +=
        i + 1 + ": " + data[i].NAME.S + " with score " + data[i].SCORE.S + ", ";
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

// Help
const HelpIntentHandler: Alexa.RequestHandler = {
  canHandle: isIntent("AMAZON.HelpIntent"),
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Try saying hello!")
      .getResponse();
  },
};

// Error Handler
function ErrorHandler(handlerInput: Alexa.HandlerInput, error: Error) {
  return handlerInput.responseBuilder
    .speak(
      ` <amazon:emotion name="excited" intensity="high">
          Abort mission, repeating, abort mission!
        </amazon:emotion>
        <sub alias=",">${escapeXmlCharacters(error.message)}</sub>`
    )
    .withShouldEndSession(true)
    .getResponse();
}

export const handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    HelloIntentHandler,
    NewGameIntentHandler,
    DiceRollIntentHandler,
    EndGameIntentHandler,
    HighScoreIntentHandler,
    NameIntentHandler,
    NoHighScoreIntentHandler,
    ViewHighScoreIntentHandler,
    HelpIntentHandler
  )
  .addErrorHandler(() => true, ErrorHandler)
  .lambda();
