export async function reverseGeocode(latitude, longitude) {
  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?lat=${encodeURIComponent(latitude)}` +
    `&lon=${encodeURIComponent(longitude)}` +
    `&format=jsonv2` +
    `&addressdetails=1` +
    `&zoom=14`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "AtmoSphere/1.0 (climate intelligence prototype)",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Reverse geocoding request failed: ${response.status}`
    );
  }

  const data = await response.json();
  const address = data.address ?? {};

  const locality =
    address.city ||
    address.town ||
    address.municipality ||
    address.village ||
    address.county ||
    address.state_district ||
    address.state ||
    "Selected Coordinates";

  const region =
    address.state ||
    address.state_district ||
    address.region ||
    null;

  const country = address.country || null;

  const displayParts = [
    locality,
    region && region !== locality ? region : null,
    country
  ].filter(Boolean);

  return {
    latitude: Number(data.lat),
    longitude: Number(data.lon),
    displayName: displayParts.join(", "),
    address,
  };
}
