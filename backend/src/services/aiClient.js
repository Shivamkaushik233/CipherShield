const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

// Rule-based fallback so the platform stays functional (degrades gracefully
// instead of hard-failing every transaction) if the Python AI microservice
// is temporarily unreachable. This is intentionally simple / transparent.
function fallbackScore(features) {
  let score = 5;
  const reasons = [];

  if (features.amount_to_avg_ratio > 4) {
    score += 25;
    reasons.push("Amount is far above this user's usual transaction size");
  }
  if (features.is_new_device) {
    score += 20;
    reasons.push("Transaction initiated from a device never seen before");
  }
  if (features.is_vpn_or_proxy) {
    score += 15;
    reasons.push("Connection is routed through a VPN or proxy");
  }
  if (features.distance_from_last_txn_km > 500 && features.time_since_last_txn_min < 60) {
    score += 25;
    reasons.push("Impossible travel: previous transaction was too far away, too recently");
  }
  if (features.failed_logins_last_hour > 2) {
    score += 15;
    reasons.push("Multiple failed logins in the past hour");
  }
  if (features.device_trust_score < 40) {
    score += 10;
    reasons.push("Originating device has a low trust score");
  }
  if (features.country_changed) {
    score += 10;
    reasons.push("Login country differs from the user's usual country");
  }

  score = Math.min(99, score);
  return {
    riskScore: score,
    confidence: 0.55,
    reasons: reasons.length ? reasons : ["No strong risk indicators found"],
    label: score >= 55 ? "suspicious" : "normal",
    modelSource: "fallback_rule_engine",
  };
}

async function predictFraud(features) {
  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/predict`, features, { timeout: 4000 });
    return { ...data, modelSource: "ai_microservice" };
  } catch (err) {
    console.warn("[aiClient] AI microservice unreachable, using fallback rules:", err.message);
    return fallbackScore(features);
  }
}

module.exports = { predictFraud, fallbackScore };
