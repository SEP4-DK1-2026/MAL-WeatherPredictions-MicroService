export interface Weather {
  time: number;
  temperature: number;
  humidity: number;
  wind_direction: number;
  wind_speed: number;
  precipitation: number;
  light: number;
}

export interface WeatherPrediction {
  predicted_time: number;
  prediction_offset: number;
  temperature: number;
  humidity: number;
  wind_direction: number;
  wind_speed: number;
  precipitation: number;
  light: number;
}

export interface PredictionResponse {
  predictions: WeatherPrediction[];
  model: string;
}

export interface PredictionRequest {
  model_input: Weather;
  prediction_offsets: number[];
  model?: string;
}
