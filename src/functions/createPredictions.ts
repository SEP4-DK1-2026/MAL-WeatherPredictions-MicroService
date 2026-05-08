import {
  app,
  InvocationContext,
  Timer,
  HttpRequest,
  HttpResponseInit,
} from "@azure/functions";

import { createDatabaseConnection, database } from "../database.js";
import { passwordConfig, API_DOMAIN, API_KEY } from "../config.js";
import { range } from "../utils.js";

import { Weather, WeatherPrediction } from "../schema.js";

const HOUR_OFFSETS = [
  ...range(24 * 0 + 1, 24 * 1 + 1, 1), // First day every hour
  ...range(24 * 1 + 2, 24 * 2 + 1, 2), // Second day every other hour
  ...range(24 * 2 + 3, 24 * 4 + 1, 3), // Third and fourth day every three hours
  ...range(24 * 4 + 6, 24 * 6 + 1, 6), // Fifth and sixth day every six hours
  ...range(24 * 6 + 12, 24 * 7 + 1, 12), // Seventh day every 12 hours
];

async function makePredictions(
  weather: Weather,
  offsets: number[],
): Promise<WeatherPrediction[]> {
  return fetch(`${API_DOMAIN}/v1/predictions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-functions-key": API_KEY,
    },
    body: JSON.stringify({
      model_input: weather,
      prediction_offsets: offsets,
    }),
  })
    .then(async (res) => {
      if (!res.ok) throw Error(await res.text());
      return res;
    })
    .then((res) => res.json())
    .then((res) => res.predictions)
    .catch((e) => {
      console.log("DUMMY API RESPONSE: " + e);
      return [
        {
          predicted_time: weather.time + offsets[0], // WARNING: Dummy results
          prediction_offset: offsets[0],
          temperature: weather.temperature - 1,
          humidity: weather.humidity,
          wind_direction: weather.wind_direction,
          wind_speed: weather.wind_speed,
          precipitation: weather.precipitation,
          light: weather.light + 2,
        },
      ];
    });
}

async function savePredictions(
  predictions: WeatherPrediction[],
): Promise<void> {
  try {
    await database.savePredictions(predictions);
  } catch (e) {
    console.log(`Error creating prediction in database: ${e}`);
  }
}

async function getCurrentWeather(): Promise<Weather> {
  const weather: Record<string, any> = await database.readLatestWeather();
  return {
    time: weather.time,
    temperature: weather.temperature,
    humidity: weather.humidity,
    wind_direction: weather.wind_direction,
    wind_speed: weather.wind_speed,
    precipitation: weather.precipitation,
    light: weather.light,
  };
}

async function createPredictions() {
  await createDatabaseConnection(passwordConfig);

  const weather: Weather = await getCurrentWeather();
  const predictions: WeatherPrediction[] = await makePredictions(
    weather,
    HOUR_OFFSETS,
  );

  await savePredictions(predictions);
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
  await createPredictions();
  return {
    status: 200,
  };
}

app.timer("createPredictions", {
  schedule: "0 1 */8 * * *",
  handler: createPredictionsTimer,
});

app.http("createPredictionsRequest", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: createPredictionsRequest,
});
