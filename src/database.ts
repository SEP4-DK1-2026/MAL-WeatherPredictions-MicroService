import { Client, Result } from "pg";
import format from "pg-format";

import { WeatherPrediction, Weather } from "./schema";

export let database = null;

export default class Database {
  config: Record<string, any> = {};
  client: Client = null;
  connected: boolean = false;

  constructor(config) {
    this.config = config;
  }

  async connect() {
    try {
      this.client = new Client(this.config);
      await this.client.connect();
      this.connected = true;
      console.log("Database connected successfully.");
      return this.client;
    } catch (error) {
      console.error("Error connecting to the database:", error);
      this.connected = false;
    }
  }

  async disconnect() {
    try {
      if (this.connected) {
        await this.client.end();
        this.connected = false;
        console.log("Database disconnected successfully.");
      }
    } catch (error) {
      console.error("Error disconnecting from the database:", error);
    }
  }

  async savePredictions(predictions: WeatherPrediction[]) {
    const values: Array<Array<number>> = predictions.map((p) => [
      p.predicted_time,
      p.prediction_offset,
      p.temperature,
      p.humidity,
      Math.floor(p.wind_direction),
      p.wind_speed,
      p.precipitation,
      Math.floor(p.light),
    ]);

    const result = await this.client.query(
      format(
        'INSERT INTO "WeatherPrediction" (predicted_time, prediction_offset, temperature, humidity, wind_direction, wind_speed, precipitation, light) VALUES %L',
        values,
      ),
    );
    return result.rows;
  }

  async readLatestWeather(): Promise<Weather> {
    const result: Result = await this.client.query(
      'SELECT * FROM "Weather" WHERE time = (SELECT MAX(time) from "Weather")',
    );

    if (result.rowCount == 0) {
      console.log("DUMMY DB RESPONSE");
      // WARNING: Dummy result
      return {
        time: Math.floor(Date.now() / 1000),
        temperature: 10,
        humidity: 90,
        wind_direction: 0,
        wind_speed: 3,
        precipitation: 0,
        light: 50,
      };
    }
    return result.rows[0];
  }
}

export const createDatabaseConnection = async (passwordConfig) => {
  database = new Database(passwordConfig);
  await database.connect();
  return database;
};
