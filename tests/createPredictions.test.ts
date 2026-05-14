import { createPredictions } from "../src/functions/createPredictions";
import { makePredictions } from "../src/services/predictions_service";
import Database, {
  createDatabaseConnection,
  database,
} from "../src/services/database";

jest.mock("../src/services/predictions_service", () => {
  return {
    __esModule: true,
    makePredictions: jest.fn(() =>
      Promise.resolve({
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
    ),
  };
});

jest.mock("../src/services/database", () => {
  const database = {
    connect: jest.fn(() => Promise.resolve()),
    disconnect: jest.fn(() => Promise.resolve()),
    savePredictions: jest.fn(() => Promise.resolve()),
    readLatestWeather: jest.fn(() =>
      Promise.resolve({
        time: 1,
        temperature: 3,
        humidity: 4,
        wind_direction: 5,
        wind_speed: 6,
        precipitation: 7,
        light: 8,
      }),
    ),
    readModelNames: jest.fn(() => Promise.resolve(["DMI"])),
  };
  return {
    __esModule: true,
    database,
    createDatabaseConnection: jest.fn(
      () =>
        new Promise(async (resolve, reject) => {
          database
            .connect()
            .then(() => resolve(database))
            .catch(() => reject());
        }),
    ),
  };
});

test("succedes if everything is right", () => {
  return expect(createPredictions()).resolves.toBe(true);
});

test("make predictions for every model", async () => {
  (makePredictions as any).mockClear();
  database.savePredictions.mockClear();

  database.readModelNames.mockResolvedValueOnce(["DMI", "VIA"]);

  await expect(createPredictions()).resolves.toBe(true);

  expect((makePredictions as any).mock.calls).toHaveLength(2);
  expect(database.savePredictions.mock.calls).toHaveLength(2);
});

test("safe shutdown on error in database connection", async () => {
  database.disconnect.mockClear();
  database.connect.mockRejectedValueOnce(new Error());
  await expect(createPredictions()).resolves.toBe(false);
  expect(database.disconnect.mock.calls).toHaveLength(1);
});

test("safe shutdown on error in database read weather", async () => {
  database.disconnect.mockClear();
  database.readLatestWeather.mockRejectedValueOnce(new Error());
  await expect(createPredictions()).resolves.toBe(false);
  expect(database.disconnect.mock.calls).toHaveLength(1);
});

test("safe shutdown on error in database read model names", async () => {
  database.disconnect.mockClear();
  database.readModelNames.mockRejectedValueOnce(new Error());
  await expect(createPredictions()).resolves.toBe(false);
  expect(database.disconnect.mock.calls).toHaveLength(1);
});

test("safe shutdown on error in api", async () => {
  database.disconnect.mockClear();
  (makePredictions as any).mockRejectedValueOnce(new Error());
  await expect(createPredictions()).resolves.toBe(false);
  expect(database.disconnect.mock.calls).toHaveLength(1);
});

test("safe shutdown on error in database save predictions", async () => {
  database.disconnect.mockClear();
  database.savePredictions.mockRejectedValueOnce(new Error());
  await expect(createPredictions()).resolves.toBe(false);
  expect(database.disconnect.mock.calls).toHaveLength(1);
});
