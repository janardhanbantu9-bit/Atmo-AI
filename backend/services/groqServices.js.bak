  import OpenAI from "openai";
import { fetchWeather } from "./openMeteo/weatherServices.js";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

function cleanLocation(location) {
  if (!location || typeof location !== "object") return null;

  const latitude = Number(location.lat);
  const longitude = Number(location.lon);

  return {
    name: location.name ?? null,
    city: location.city ?? null,
    state: location.state ?? null,
    country: location.country ?? null,
    displayName: location.displayName ?? null,
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
  };
}

export async function askGroq(userMessage, { domain = "research", location = null } = {}) {
  const selectedLocation = cleanLocation(location);
  let weather = null;

  if (
    selectedLocation &&
    Number.isFinite(selectedLocation.latitude) &&
    Number.isFinite(selectedLocation.longitude)
  ) {
    try {
      weather = await fetchWeather(
        selectedLocation.latitude,
        selectedLocation.longitude
      );
    } catch (error) {
      console.warn("Unable to fetch AI weather context:", error);
    }
  }

  const context = {
    domain,
    selectedLocation,
    currentWeather: weather
      ? {
          time: weather.current?.time ?? null,
          temperature: weather.current?.temperature_2m ?? null,
          apparentTemperature: weather.current?.apparent_temperature ?? null,
          humidity: weather.current?.relative_humidity_2m ?? null,
          precipitation: weather.current?.precipitation ?? null,
          cloudCover: weather.current?.cloud_cover ?? null,
          windSpeed: weather.current?.wind_speed_10m ?? null,
          windDirection: weather.current?.wind_direction_10m ?? null,
          windGusts: weather.current?.wind_gusts_10m ?? null,
          weatherCode: weather.current?.weather_code ?? null,
        }
      : null,
  };

  const input = [
    "You are AtmoSphere's weather and climate assistant.",
    "Answer the user's question directly and briefly.",
    "Usually use 1-4 short sentences.",
    "Do not restate the question.",
    "Do not add generic introductions, conclusions, filler, or unnecessary explanations.",
    "Use the application context below when relevant.",
    "Never invent weather, location, or climate values. If required data is unavailable, say so briefly.",
    "The selected location is the user's current context unless the user explicitly asks about another place.",
    "",
    `APPLICATION CONTEXT:\n${JSON.stringify(context, null, 2)}`,
    "",
    `USER QUESTION:\n${userMessage}`,
  ].join("\n");

  const response = await client.responses.create({
    model: "openai/gpt-oss-120b",
    input,
  });

  return response.output_text;
}
