const DAY_MS = 24 * 60 * 60 * 1000;

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function safeDate(value, fallback) {
  if (!value) return fallback;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function clampDateRange(start, end) {
  const today = new Date();
  const maxEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  maxEnd.setUTCDate(maxEnd.getUTCDate() - 1);
  if (end > maxEnd) end = maxEnd;
  if (start > end) start = new Date(end.getTime() - 6 * DAY_MS);
  const minStart = new Date(Date.UTC(1940, 0, 1));
  if (start < minStart) start = minStart;
  return { start, end };
}

async function getJson(url) {
  const response = await fetch(url);
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`Upstream returned invalid JSON (${response.status}).`);
  }
  if (!response.ok || body?.error) {
    throw new Error(body?.reason || `Upstream request failed (${response.status}).`);
  }
  return body;
}

function mean(values) {
  const valid = values.filter((v) => Number.isFinite(v));
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
}

function stddev(values) {
  const valid = values.filter((v) => Number.isFinite(v));
  if (valid.length < 2) return null;
  const avg = mean(valid);
  const variance = valid.reduce((sum, value) => sum + (value - avg) ** 2, 0) / valid.length;
  return Math.sqrt(variance);
}

function pairMae(actualTimes = [], actualValues = [], forecastTimes = [], forecastValues = []) {
  const forecast = new Map();
  forecastTimes.forEach((time, index) => {
    const value = forecastValues[index];
    if (Number.isFinite(value)) forecast.set(time, value);
  });
  const errors = [];
  actualTimes.forEach((time, index) => {
    const actual = actualValues[index];
    const predicted = forecast.get(time);
    if (Number.isFinite(actual) && Number.isFinite(predicted)) {
      errors.push(Math.abs(actual - predicted));
    }
  });
  return {
    mae: errors.length ? mean(errors) : null,
    samples: errors.length,
  };
}

function buildEvents({ history, forecast, air, flood, marine }) {
  const events = [];
  const historyTemps = history?.hourly?.temperature_2m || [];
  const tempMean = mean(historyTemps);
  const tempStd = stddev(historyTemps);
  const forecastMax = Math.max(...(forecast?.daily?.temperature_2m_max || []).filter(Number.isFinite));
  const forecastRain = Math.max(...(forecast?.daily?.precipitation_sum || []).filter(Number.isFinite), 0);
  const forecastWind = Math.max(...(forecast?.daily?.wind_speed_10m_max || []).filter(Number.isFinite), 0);

  if (Number.isFinite(tempMean) && Number.isFinite(tempStd) && Number.isFinite(forecastMax) && forecastMax > tempMean + Math.max(2 * tempStd, 4)) {
    events.push({
      type: "heat",
      severity: forecastMax > tempMean + Math.max(2.5 * tempStd, 6) ? "high" : "moderate",
      title: "Unusual heat signal",
      detail: `Forecast maximums reach ${forecastMax.toFixed(1)}°C against a recent mean of ${tempMean.toFixed(1)}°C.`,
    });
  }

  if (forecastRain >= 25) {
    events.push({
      type: "rain",
      severity: forecastRain >= 60 ? "high" : "moderate",
      title: "Heavy precipitation signal",
      detail: `${forecastRain.toFixed(1)} mm of precipitation is forecast across the next week.`,
    });
  }

  if (forecastWind >= 45) {
    events.push({
      type: "wind",
      severity: forecastWind >= 65 ? "high" : "moderate",
      title: "Strong-wind signal",
      detail: `Forecast wind peaks around ${forecastWind.toFixed(0)} km/h.`,
    });
  }

  const aq = air?.current?.european_aqi ?? air?.current?.us_aqi;
  if (Number.isFinite(aq) && aq >= 100) {
    events.push({
      type: "air",
      severity: aq >= 150 ? "high" : "moderate",
      title: "Air-quality concern",
      detail: `Current AQI is ${aq.toFixed(0)} on the selected scale.`,
    });
  }

  const floodDaily = flood?.daily?.river_discharge || [];
  const floodP75 = flood?.daily?.river_discharge_p75 || [];
  const floodSignal = floodDaily.some((value, index) => Number.isFinite(value) && Number.isFinite(floodP75[index]) && value > floodP75[index]);
  if (floodSignal) {
    events.push({
      type: "flood",
      severity: "moderate",
      title: "River-discharge signal",
      detail: "Forecast discharge exceeds the ensemble 75th percentile on at least one day.",
    });
  }

  const maxWave = Math.max(...(marine?.hourly?.wave_height || []).filter(Number.isFinite), 0);
  if (maxWave >= 3) {
    events.push({
      type: "marine",
      severity: maxWave >= 5 ? "high" : "moderate",
      title: "Rough-seas signal",
      detail: `Wave height reaches about ${maxWave.toFixed(1)} m on the marine grid.`,
    });
  }

  return events.slice(0, 5);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const lat = Number(req.query?.lat);
  const lon = Number(req.query?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    res.status(400).json({ error: "Valid lat and lon are required." });
    return;
  }

  const today = new Date();
  const defaultEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  defaultEnd.setUTCDate(defaultEnd.getUTCDate() - 1);
  const defaultStart = new Date(defaultEnd.getTime() - 6 * DAY_MS);
  const rawEnd = safeDate(req.query?.end, defaultEnd);
  const rawStart = safeDate(req.query?.start, defaultStart);
  const { start, end } = clampDateRange(rawStart, rawEnd);
  const startDate = isoDate(start);
  const endDate = isoDate(end);

  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", String(lat));
  forecastUrl.searchParams.set("longitude", String(lon));
  forecastUrl.searchParams.set("timezone", "auto");
  forecastUrl.searchParams.set("forecast_days", "7");
  forecastUrl.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,weather_code");
  forecastUrl.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code");

  const historyUrl = new URL("https://archive-api.open-meteo.com/v1/archive");
  historyUrl.searchParams.set("latitude", String(lat));
  historyUrl.searchParams.set("longitude", String(lon));
  historyUrl.searchParams.set("start_date", startDate);
  historyUrl.searchParams.set("end_date", endDate);
  historyUrl.searchParams.set("timezone", "auto");
  historyUrl.searchParams.set("hourly", "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m,weather_code");

  const historicalForecastUrl = new URL("https://historical-forecast-api.open-meteo.com/v1/forecast");
  historicalForecastUrl.searchParams.set("latitude", String(lat));
  historicalForecastUrl.searchParams.set("longitude", String(lon));
  historicalForecastUrl.searchParams.set("start_date", startDate);
  historicalForecastUrl.searchParams.set("end_date", endDate);
  historicalForecastUrl.searchParams.set("timezone", "auto");
  historicalForecastUrl.searchParams.set("hourly", "temperature_2m,precipitation,wind_speed_10m");

  const airUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  airUrl.searchParams.set("latitude", String(lat));
  airUrl.searchParams.set("longitude", String(lon));
  airUrl.searchParams.set("timezone", "auto");
  airUrl.searchParams.set("current", "european_aqi,us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone");
  airUrl.searchParams.set("hourly", "european_aqi,us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone");

  const floodUrl = new URL("https://flood-api.open-meteo.com/v1/flood");
  floodUrl.searchParams.set("latitude", String(lat));
  floodUrl.searchParams.set("longitude", String(lon));
  floodUrl.searchParams.set("daily", "river_discharge,river_discharge_mean,river_discharge_p75,river_discharge_max");
  floodUrl.searchParams.set("forecast_days", "14");
  floodUrl.searchParams.set("timezone", "auto");
  floodUrl.searchParams.set("cell_selection", "nearest");

  const marineUrl = new URL("https://marine-api.open-meteo.com/v1/marine");
  marineUrl.searchParams.set("latitude", String(lat));
  marineUrl.searchParams.set("longitude", String(lon));
  marineUrl.searchParams.set("timezone", "auto");
  marineUrl.searchParams.set("forecast_days", "7");
  marineUrl.searchParams.set("hourly", "wave_height,wave_period,sea_surface_temperature,ocean_current_velocity");
  marineUrl.searchParams.set("current", "wave_height,wave_period,sea_surface_temperature,ocean_current_velocity");
  marineUrl.searchParams.set("cell_selection", "sea");

  const [forecastResult, historyResult, historicalForecastResult, airResult, floodResult, marineResult] = await Promise.allSettled([
    getJson(forecastUrl),
    getJson(historyUrl),
    getJson(historicalForecastUrl),
    getJson(airUrl),
    getJson(floodUrl),
    getJson(marineUrl),
  ]);

  const forecast = forecastResult.status === "fulfilled" ? forecastResult.value : null;
  const history = historyResult.status === "fulfilled" ? historyResult.value : null;
  const historicalForecast = historicalForecastResult.status === "fulfilled" ? historicalForecastResult.value : null;
  const air = airResult.status === "fulfilled" ? airResult.value : null;
  const flood = floodResult.status === "fulfilled" ? floodResult.value : null;
  const marine = marineResult.status === "fulfilled" ? marineResult.value : null;

  if (!forecast && !history) {
    res.status(502).json({ error: "Weather providers did not return usable data." });
    return;
  }

  const forecastComparison = pairMae(
    history?.hourly?.time || [],
    history?.hourly?.temperature_2m || [],
    historicalForecast?.hourly?.time || [],
    historicalForecast?.hourly?.temperature_2m || []
  );

  const events = buildEvents({ history, forecast, air, flood, marine });

  res.status(200).json({
    location: { latitude: lat, longitude: lon },
    range: { start: startDate, end: endDate },
    current: forecast?.current || null,
    currentUnits: forecast?.current_units || null,
    history: history?.hourly || null,
    historyUnits: history?.hourly_units || null,
    historicalForecast: historicalForecast?.hourly || null,
    historicalForecastUnits: historicalForecast?.hourly_units || null,
    forecast: forecast?.daily || null,
    forecastUnits: forecast?.daily_units || null,
    airQuality: air?.current || null,
    airQualityUnits: air?.current_units || null,
    airQualityHourly: air?.hourly || null,
    flood: flood?.daily || null,
    floodUnits: flood?.daily_units || null,
    marineCurrent: marine?.current || null,
    marineCurrentUnits: marine?.current_units || null,
    marineHourly: marine?.hourly || null,
    marineHourlyUnits: marine?.hourly_units || null,
    analysis: {
      forecastTemperatureMae: forecastComparison.mae,
      forecastTemperatureMaeSamples: forecastComparison.samples,
      historicalTemperatureMean: mean(history?.hourly?.temperature_2m || []),
      historicalTemperatureStdDev: stddev(history?.hourly?.temperature_2m || []),
    },
    events,
    sources: [
      "Open-Meteo Forecast API",
      "Open-Meteo Historical Weather API",
      "Open-Meteo Historical Forecast API",
      "Open-Meteo Air Quality API",
      "Open-Meteo Flood API / GloFAS",
      "Open-Meteo Marine Weather API",
    ],
  });
}
