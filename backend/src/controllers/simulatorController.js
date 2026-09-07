const { Device, Session } = require("../models");
const { buildFeatures } = require("../utils/features");
const { mockGeoFromIp } = require("../utils/deviceInfo");
const { processTransaction } = require("../services/fraudEngine");

const SCENARIOS = {
  impossible_travel: {
    label: "Impossible Travel",
    apply: async (ctx) => {
      ctx.overrides.distance_from_last_txn_km = 8500;
      ctx.overrides.time_since_last_txn_min = 12;
      ctx.location = { country: "Russia", city: "Moscow", lat: 55.7558, lng: 37.6173 };
      ctx.amount = ctx.amount || 15000;
    },
  },
  vpn_login: {
    label: "VPN / Proxy Login",
    apply: async (ctx) => {
      ctx.overrides.is_vpn_or_proxy = 1;
      ctx.overrides.country_changed = 1;
      ctx.amount = ctx.amount || 8000;
    },
  },
  new_device: {
    label: "Brand New, Untrusted Device",
    apply: async (ctx) => {
      ctx.device = await Device.create({
        userId: ctx.user.id,
        fingerprint: `sim-${Date.now()}`,
        deviceName: "Unknown Android Device",
        os: "Android",
        browser: "Unknown browser",
        ip: "45.12.33.9",
        location: ctx.location,
        trustScore: 15,
        isTrusted: false,
      });
      ctx.overrides.is_new_device = 1;
      ctx.overrides.device_trust_score = 15;
      ctx.amount = ctx.amount || 5000;
    },
  },
  large_transaction: {
    label: "Abnormally Large Transaction",
    apply: async (ctx) => {
      ctx.amount = ctx.amount || Math.max(50000, (ctx.user.avgAmount || 1000) * 10);
      ctx.overrides.amount_to_avg_ratio = ctx.amount / (ctx.user.avgAmount || 1000);
    },
  },
  multiple_failed_logins: {
    label: "Multiple Failed Logins",
    apply: async (ctx) => {
      for (let i = 0; i < 4; i++) {
        await Session.create({ userId: ctx.user.id, ip: ctx.ip, failed: true, active: false });
      }
      ctx.overrides.failed_logins_last_hour = 4;
      ctx.amount = ctx.amount || 3000;
    },
  },
};

async function listScenarios(req, res) {
  res.json({
    scenarios: Object.entries(SCENARIOS).map(([key, v]) => ({ key, label: v.label })),
  });
}

async function runScenario(req, res) {
  try {
    const { scenario } = req.params;
    const config = SCENARIOS[scenario];
    if (!config) return res.status(400).json({ message: "Unknown scenario" });

    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0").split(",")[0].trim();
    const baseLocation = mockGeoFromIp(ip);

    let device = await Device.findOne({ where: { userId: req.user.id }, order: [["lastSeen", "DESC"]] });
    if (!device) {
      device = await Device.create({
        userId: req.user.id,
        fingerprint: `sim-base-${req.user.id}`,
        deviceName: "Simulated Primary Device",
        os: "Windows",
        browser: "Chrome",
        ip,
        location: baseLocation,
        trustScore: 80,
        isTrusted: true,
      });
    }

    const ctx = { user: req.user, device, ip, location: baseLocation, amount: null, overrides: {} };
    await config.apply(ctx);

    const features = await buildFeatures({
      user: ctx.user,
      device: ctx.device,
      amount: ctx.amount,
      location: ctx.location,
      overrides: ctx.overrides,
    });

    const result = await processTransaction({
      user: ctx.user,
      device: ctx.device,
      features,
      receiver: "simulator-demo-account",
      amount: ctx.amount,
      currency: "INR",
      ip,
      location: ctx.location,
      scenario,
    });

    res.status(201).json({ scenario: config.label, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Simulation failed", error: err.message });
  }
}

module.exports = { listScenarios, runScenario };
