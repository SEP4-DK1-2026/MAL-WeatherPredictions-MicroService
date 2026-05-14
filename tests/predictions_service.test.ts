import { makePredictions } from "../src/services/predictions_service";
import { PredictionResponse } from "../src/schema";

test("error thrown on error", () => {
  jest
    .spyOn(global, "fetch")
    .mockResolvedValueOnce(new Response("error", { status: 500 }));
  return expect(
    makePredictions({
      model_input: {
        time: 0,
        temperature: 0,
        humidity: 0,
        wind_direction: 0,
        wind_speed: 0,
        precipitation: 0,
        light: 0,
      },
      prediction_offsets: [1, 2, 3],
    }),
  ).rejects.toThrow();
});

test("parses json", () => {
  jest.spyOn(global, "fetch").mockResolvedValueOnce(
    new Response(
      `
            {
            "predictions": [
                {
                    "prediction_offset": 1,
                    "predicted_time": 1778150973,
                    "temperature": 10.538552027401067,
                    "humidity": 53.06833902510705,
                    "wind_direction": 154.0036425429197,
                    "wind_speed": 1.9747952188727473,
                    "precipitation": 0.017146398420995256,
                    "light": 0
                },
                {
                    "prediction_offset": 2,
                    "predicted_time": 1778154573,
                    "temperature": 10.570446135989853,
                    "humidity": 53.06833902510705,
                    "wind_direction": 154.0036425429197,
                    "wind_speed": 1.9467357356270067,
                    "precipitation": 0.017146398420995256,
                    "light": 0
                }
            ],
            "model": "DMI-0_0"
        }
    `,
      { status: 200 },
    ),
  );

  return expect(
    makePredictions({
      model_input: {
        time: 0,
        temperature: 0,
        humidity: 0,
        wind_direction: 0,
        wind_speed: 0,
        precipitation: 0,
        light: 0,
      },
      prediction_offsets: [1, 2],
    }),
  ).resolves.toMatchObject({
    predictions: [
      {
        prediction_offset: 1,
        predicted_time: 1778150973,
        temperature: 10.538552027401067,
        humidity: 53.06833902510705,
        wind_direction: 154.0036425429197,
        wind_speed: 1.9747952188727473,
        precipitation: 0.017146398420995256,
        light: 0,
      },
      {
        prediction_offset: 2,
        predicted_time: 1778154573,
        temperature: 10.570446135989853,
        humidity: 53.06833902510705,
        wind_direction: 154.0036425429197,
        wind_speed: 1.9467357356270067,
        precipitation: 0.017146398420995256,
        light: 0,
      },
    ],
    model: "DMI-0_0",
  });
});
