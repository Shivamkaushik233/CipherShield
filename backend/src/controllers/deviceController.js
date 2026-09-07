const { Device, Session } = require("../models");
const { mapDevice, mapSession } = require("../utils/mappers");

async function myDevices(req, res) {
  try {
    const devices = await Device.findAll({ where: { userId: req.user.id }, order: [["lastSeen", "DESC"]] });
    res.json({ items: devices.map(mapDevice) });
  } catch (err) {
    res.status(500).json({ message: "Failed to load devices", error: err.message });
  }
}

async function mySessions(req, res) {
  try {
    const sessions = await Session.findAll({
      where: { userId: req.user.id },
      include: [{ model: Device, as: "deviceRef" }],
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    res.json({ items: sessions.map(mapSession) });
  } catch (err) {
    res.status(500).json({ message: "Failed to load sessions", error: err.message });
  }
}

async function revokeSession(req, res) {
  try {
    const session = await Session.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!session) return res.status(404).json({ message: "Session not found" });
    session.active = false;
    session.logoutAt = new Date();
    await session.save();
    res.json({ session: mapSession(session) });
  } catch (err) {
    res.status(500).json({ message: "Failed to revoke session", error: err.message });
  }
}

// Analyst/admin view of a specific user's device + login footprint (for investigations)
async function userSecurityFootprint(req, res) {
  try {
    const { userId } = req.params;
    const [devices, sessions] = await Promise.all([
      Device.findAll({ where: { userId }, order: [["lastSeen", "DESC"]] }),
      Session.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit: 50,
        include: [{ model: Device, as: "deviceRef" }],
      }),
    ]);
    res.json({ devices: devices.map(mapDevice), sessions: sessions.map(mapSession) });
  } catch (err) {
    res.status(500).json({ message: "Failed to load user footprint", error: err.message });
  }
}

module.exports = { myDevices, mySessions, revokeSession, userSecurityFootprint };
