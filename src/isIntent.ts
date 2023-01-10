import * as Alexa from "ask-sdk";

export function isIntent(...intents: string[]) {
  return (handlerInput: Alexa.HandlerInput) =>
    Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
    intents.some(
      (x) => Alexa.getIntentName(handlerInput.requestEnvelope) === x
    );
}