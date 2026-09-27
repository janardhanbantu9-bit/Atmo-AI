import { reverseGeocode } from "../backend/services/location/reverseGeocodingService.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const body = req.body || {};

    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({ error: "Valid latitude and longitude are required" });
    }

    const result = await reverseGeocode(latitude, longitude);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Reverse geocoding error:", error);

    return res.status(500).json({ error: "Failed to resolve location" });
  }
}
