import {
  app,
  InvocationContext,
  Timer,
  HttpRequest,
  HttpResponseInit,
} from "@azure/functions";

import { makePredictions } from "../services/predictions_service.js";
import { createDatabaseConnection, database } from "../services/database.js";
import { passwordConfig } from "../config.js";
import { range } from "../utils.js";

import { Weather } from "../schema.js";

const HOUR_OFFSETS = [
  ...range(24 * 0 + 1, 24 * 1 + 1, 1), // First day every hour
  ...range(24 * 1 + 2, 24 * 2 + 1, 2), // Second day every other hour
  ...range(24 * 2 + 3, 24 * 4 + 1, 3), // Third and fourth day every three hours
  ...range(24 * 4 + 6, 24 * 6 + 1, 6), // Fifth and sixth day every six hours
  ...range(24 * 6 + 12, 24 * 7 + 1, 12), // Seventh day every 12 hours
];

async function createPredictions(): Promise<boolean> {
  try {
    await createDatabaseConnection(passwordConfig);

    const weather: Weather = await database.readLatestWeather();
    const model_names: string[] = await database.readModelNames();

    const promised_responses: Promise<Record<any, any>>[] = model_names.map(
      (model, index) =>
        makePredictions({
          model_input: weather,
          prediction_offsets: HOUR_OFFSETS,
          model: model,
        }).then((res) => ({
          index: index,
          response: res,
        })),
    );

    // pg only allows one query at once, so we wait for each to finish
    while (promised_responses.length > 0) {
      const { index, response } = await Promise.race(promised_responses);

      const new_index: number = promised_responses.indexOf(
        promised_responses[index],
      );
      promised_responses.splice(new_index, 1);

      await database.savePredictions(response);
    }

    return true;
  } catch (e) {
    console.log(`[Error] ${e}`);
    return false;
  }
}

export async function createPredictionsTimer(
  myTimer: Timer,
  context: InvocationContext,
): Promise<void> {
  await createPredictions();
}

export async function createPredictionsRequest(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const success: boolean = await createPredictions();
  return {
    status: success ? 200 : 500,
  };
}

app.timer("createPredictions", {
  schedule: "0 1 */8 * * *",
  handler: createPredictionsTimer,
});

app.http("createPredictionsRequest", {
  methods: ["POST"],
  authLevel: "function",
  handler: createPredictionsRequest,
});
