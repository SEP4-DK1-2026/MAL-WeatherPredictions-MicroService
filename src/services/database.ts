import { Client, Result } from "pg";
import format from "pg-format";

import { Weather, PredictionResponse } from "../schema.js";

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
    } catch (e) {
      this.connected = false;
      throw new Error(`Error connecting to the database: ${e}`);
    }
  }

  async disconnect() {
    try {
      if (this.connected) {
        await this.client.end();
        this.connected = false;
        console.log("Database disconnected successfully.");
      }
    } catch (e) {
      console.error("Error disconnecting from the database:", e);
    }
  }

  async savePredictions(response: PredictionResponse) {
    const [model_name, versions] = response.model.split("-");
    const [model_major_version, model_minor_version] = versions.split("_");

    const values: Array<Array<any>> = response.predictions.map((p) => [
      p.predicted_time,
      p.prediction_offset,
      p.temperature,
      p.humidity,
      Math.floor(p.wind_direction),
      p.wind_speed,
      p.precipitation,
      p.light,
      model_name,
      model_major_version,
      model_minor_version,
    ]);

    try {
      const result = await this.client.query(
        format(
          'INSERT INTO "WeatherPrediction" (predicted_time, prediction_offset, temperature, humidity, wind_direction, wind_speed, precipitation, light, model_name, model_major_version, model_minor_version) VALUES %L',
          values,
        ),
      );
      return result.rows;
    } catch (e) {
      throw new Error(`Could not save predictions to database: ${e}`);
    }
  }

  async readLatestWeather(): Promise<Weather> {
    try {
      const result: Result = await this.client.query(
        'SELECT * FROM "Weather" WHERE time = (SELECT MAX(time) from "Weather")',
      );

      if (result.rowCount == 0) throw Error("No weather in database");
      return result.rows[0];
    } catch (e) {
      throw new Error(`Could not read latest weather from database: ${e}`);
    }
  }

  async readModelNames(): Promise<Array<string>> {
    try {
      const result: Result = await this.client.query(
        'SELECT DISTINCT name FROM "Model"',
      );

      return result.rows.map((row) => row.name);
    } catch (e) {
      throw new Error(`Could not read model names from database: ${e}`);
    }
  }
}

export const createDatabaseConnection = async (passwordConfig) => {
  database = new Database(passwordConfig);
  await database.connect();
  return database;
};
