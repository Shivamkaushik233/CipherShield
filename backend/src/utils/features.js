const { Op } = require("sequelize");
const { Transaction, Session } = require("../models");
const { haversineKm } = require("./deviceInfo");

async function buildFeatures({ user, device, amount, location, overrides = {} }) {
  const lastTxn = await Transaction.findOne({ where: { userId: user.id }, order: [["createdAt", "DESC"]] });

  let distanceKm = 0;
  let timeSinceLastMin = 999999;
  let countryChanged = false;

  if (lastTxn) {
    timeSinceLastMin = (Date.now() - new Date(lastTxn.createdAt).getTime()) / 60000;
    if (lastTxn.location?.lat !== undefined && location.lat !== undefined) {
      distanceKm = haversineKm(
        { lat: lastTxn.location.lat || 0, lng: lastTxn.location.lng || 0 },
        { lat: location.lat || 0, lng: location.lng || 0 }
      );
    }
    countryChanged = lastTxn.location?.country !== location.country;
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const failedLogins = await Session.count({
    where: { userId: user.id, failed: true, createdAt: { [Op.gte]: oneHourAgo } },
  });

  const avgAmount = user.avgAmount > 0 ? user.avgAmount : amount;

  const features = {
    amount,
    hour_of_day: new Date().getHours(),
    is_new_device: device ? (device.trustScore < 40 ? 1 : 0) : 1,
    is_vpn_or_proxy: overrides.is_vpn_or_proxy ?? 0,
    distance_from_last_txn_km: Math.round(distanceKm),
    time_since_last_txn_min: Math.round(Math.min(timeSinceLastMin, 999999)),
    failed_logins_last_hour: failedLogins,
    amount_to_avg_ratio: Number((amount / avgAmount).toFixed(2)),
    country_changed: countryChanged ? 1 : 0,
    device_trust_score: device ? device.trustScore : 20,
    ...overrides,
  };

  return features;
}

module.exports = { buildFeatures };
