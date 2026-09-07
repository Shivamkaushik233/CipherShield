const crypto = require("crypto");

// Minimal dependency-free UA parsing - good enough for demo device fingerprints.
function parseUserAgent(ua = "") {
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Mac OS/.test(ua)
    ? "macOS"
    : /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Linux/.test(ua)
    ? "Linux"
    : "Unknown OS";

  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua)
    ? "Chrome"
    : /Firefox\//.test(ua)
    ? "Firefox"
    : /Safari\//.test(ua)
    ? "Safari"
    : "Unknown browser";

  return { os, browser };
}

function fingerprint(userId, ua, ip) {
  return crypto.createHash("sha256").update(`${userId}|${ua}|${ip.split(".").slice(0, 2).join(".")}`).digest("hex").slice(0, 24);
}

// No external geolocation API is reachable from this sandbox, so location
// is derived deterministically from the IP for consistent demo behaviour.
// Swap for a real GeoIP service (MaxMind/ipinfo) in production.
const MOCK_LOCATIONS = [
  { country: "India", city: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { country: "India", city: "Vellore", lat: 12.9165, lng: 79.1325 },
  { country: "India", city: "Mumbai", lat: 19.076, lng: 72.8777 },
  { country: "United States", city: "New York", lat: 40.7128, lng: -74.006 },
  { country: "Singapore", city: "Singapore", lat: 1.3521, lng: 103.8198 },
  { country: "Russia", city: "Moscow", lat: 55.7558, lng: 37.6173 },
  { country: "Nigeria", city: "Lagos", lat: 6.5244, lng: 3.3792 },
];

function mockGeoFromIp(ip) {
  const hash = crypto.createHash("md5").update(ip).digest("hex");
  const idx = parseInt(hash.slice(0, 4), 16) % MOCK_LOCATIONS.length;
  return MOCK_LOCATIONS[idx];
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

module.exports = { parseUserAgent, fingerprint, mockGeoFromIp, haversineKm, MOCK_LOCATIONS };
