import { searchLocation } from "../backend/services/openMeteo/geocodingServices.js";

export default async function handler(req, res) {
  const name =
    typeof req.query?.name === "string"
      ? req.query.name.trim()
      : "";

  if (!name) {
    return res.status(400).json({
      error: "A location name is required."
    });
  }

  try {
    const results = await searchLocation(name);

    return res.status(200).json({
      results
    });
  } catch (error) {
    console.error("Geocoding API error:", error);

    return res.status(500).json({
      error: "Location search failed."
    });
  }
}
