import Database from "../src/services/database";
import { Client } from "pg";
import { passwordConfig } from "../src/config";

let database: Database;
beforeEach(() => {
  database = new Database(passwordConfig);
});

test("success on normal database connection", () => {
  jest.spyOn(Client.prototype, "connect").mockResolvedValue();
  return expect(database.connect()).resolves.not.toThrow();
});

test("error on failed database connection", () => {
  jest.spyOn(Client.prototype, "connect").mockRejectedValue(new Error());
  return expect(database.connect()).rejects.toThrow();
});

test("success on normal database disconnection", async () => {
  jest.spyOn(Client.prototype, "connect").mockResolvedValue();
  await database.connect();

  jest.spyOn(Client.prototype, "end").mockResolvedValue();
  return expect(database.disconnect()).resolves.not.toThrow();
});

test("ignore on failed database disconnection", async () => {
  jest.spyOn(Client.prototype, "connect").mockResolvedValue();
  await database.connect();

  jest.spyOn(Client.prototype, "end").mockRejectedValue(new Error());
  return expect(database.disconnect()).resolves.not.toThrow();
});

test("error on fail saving predictions", async () => {
  jest.spyOn(Client.prototype, "connect").mockResolvedValue();
  await database.connect();

  jest.spyOn(Client.prototype, "query").mockRejectedValue(new Error());
  return expect(
    database.savePredictions({
      predictions: [
        {
          predicted_time: 1,
          prediction_offset: 2,
          temperature: 3,
          humidity: 4,
          wind_direction: 5,
          wind_speed: 6,
          precipitation: 7,
          light: 8,
        },
      ],
      model: "DMI",
    }),
  ).rejects.toThrow();
});

test("return first on read latest weather", async () => {
  jest.spyOn(Client.prototype, "connect").mockResolvedValue();
  await database.connect();

  jest
    .spyOn(Client.prototype, "query")
    .mockResolvedValue({ rows: [1, 2], rowCount: 2 });
  return expect(database.readLatestWeather()).resolves.toBe(1);
});

test("error on no latest weather", async () => {
  jest.spyOn(Client.prototype, "connect").mockResolvedValue();
  await database.connect();

  jest
    .spyOn(Client.prototype, "query")
    .mockResolvedValue({ rows: [], rowCount: 0 });
  return expect(database.readLatestWeather()).rejects.toThrow();
});

test("error on fail reading latest weather", async () => {
  jest.spyOn(Client.prototype, "connect").mockResolvedValue();
  await database.connect();

  jest.spyOn(Client.prototype, "query").mockRejectedValue(new Error());
  return expect(database.readLatestWeather()).rejects.toThrow();
});

test("return just model names", async () => {
  jest.spyOn(Client.prototype, "connect").mockResolvedValue();
  await database.connect();

  jest.spyOn(Client.prototype, "query").mockResolvedValue({
    rows: [
      { name: "DMI", major_version: 1, minor_version: 0, trained_at: 2532 },
      { name: "VIA", major_version: 0, minor_version: 0, trained_at: 4563 },
    ],
    rowCount: 2,
  });
  return expect(database.readModelNames()).resolves.toEqual(["DMI", "VIA"]);
});

test("error on fail reading model names", async () => {
  jest.spyOn(Client.prototype, "connect").mockResolvedValue();
  await database.connect();

  jest.spyOn(Client.prototype, "query").mockRejectedValue(new Error());
  return expect(database.readLatestWeather()).rejects.toThrow();
});
