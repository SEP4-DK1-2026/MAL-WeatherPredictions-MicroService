export interface Weather {
  time: number;
  temperature: number;
  humidity: number;
  wind_direction: number;
  wind_speed: number;
  precipitation: number;
  light: number;
}

export interface WeatherPrediction extends Weather {
  predicted_time: number;
  prediction_offset: number;
  temperature: number;
  humidity: number;
  wind_direction: number;
  wind_speed: number;
  precipitation: number;
  light: number;
}
