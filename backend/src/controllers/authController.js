const bcrypt = require("bcryptjs");
const { User, Device, Session, Notification } = require("../models");
const { signToken } = require("../utils/jwt");
const { parseUserAgent, fingerprint, mockGeoFromIp } = require("../utils/deviceInfo");
const { emitToUser, emitToAnalysts } = require("../sockets");

const ALLOWED_ROLES = ["customer", "analyst", "admin", "auditor"];

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: ALLOWED_ROLES.includes(role) ? role : "customer",
    });

    const token = signToken({ id: user.id, role: user.role });
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: (email || "").toLowerCase() } });

    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0").split(",")[0].trim();
    const ua = req.headers["user-agent"] || "";

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await Session.create({ userId: user.id, ip, userAgent: ua, active: false, failed: true });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { os, browser } = parseUserAgent(ua);
    const fp = fingerprint(user.id, ua, ip);
    const location = mockGeoFromIp(ip);

    let device = await Device.findOne({ where: { userId: user.id, fingerprint: fp } });
    let isNewDevice = false;
    if (!device) {
      isNewDevice = true;
      device = await Device.create({
        userId: user.id,
        fingerprint: fp,
        deviceName: `${os} · ${browser}`,
        os,
        browser,
        ip,
        location,
        trustScore: 35,
        isTrusted: false,
      });
    } else {
      device.lastSeen = new Date();
      device.ip = ip;
      device.location = location;
      device.trustScore = Math.min(99, device.trustScore + 3);
      device.isTrusted = device.trustScore >= 70;
      await device.save();
    }

    const session = await Session.create({
      userId: user.id,
      deviceId: device.id,
      ip,
      location,
      userAgent: ua,
      isNewDevice,
    });

    if (isNewDevice) {
      await Notification.create({
        userId: user.id,
        type: "new_device",
        message: `New sign-in from ${device.deviceName} in ${location.city}, ${location.country}`,
        relatedId: device.id,
        severity: "warning",
      });
      emitToUser(user.id, "notification:new", { type: "new_device", device });
      emitToAnalysts("alert:new", {
        message: `New device login for ${user.name} (${device.deviceName}, ${location.city})`,
        severity: "info",
      });
    }

    const token = signToken({ id: user.id, role: user.role, sessionId: session.id });
    res.json({ token, user: user.toSafeJSON(), device: { id: device.id, trustScore: device.trustScore, isNewDevice } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
}

async function me(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}

module.exports = { register, login, me };
