import { PredictionRequest, PredictionResponse } from "../schema";

import { API_DOMAIN, API_KEY } from "../config";

export async function makePredictions(
  req: PredictionRequest,
): Promise<PredictionResponse> {
  return fetch(`${API_DOMAIN}/v1/predictions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-functions-key": API_KEY,
    },
    body: JSON.stringify(req),
  })
    .then(async (res) => {
      if (!res.ok) throw Error(await res.text());
      return res;
    })
    .then((res) => res.json())
    .catch((e) => {
      throw new Error(`Error when making predictions: ${e}`);
    });
}
