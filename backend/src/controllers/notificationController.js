const { Op } = require("sequelize");
const { Notification } = require("../models");
const { mapNotification } = require("../utils/mappers");

async function listNotifications(req, res) {
  try {
    const where = { [Op.or]: [{ userId: req.user.id }, { role: req.user.role }] };
    const items = await Notification.findAll({ where, order: [["createdAt", "DESC"]], limit: 50 });
    const unreadCount = await Notification.count({ where: { ...where, read: false } });
    res.json({ items: items.map(mapNotification), unreadCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to load notifications", error: err.message });
  }
}

async function markRead(req, res) {
  try {
    await Notification.update({ read: true }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark notification read", error: err.message });
  }
}

async function markAllRead(req, res) {
  try {
    await Notification.update(
      { read: true },
      { where: { [Op.or]: [{ userId: req.user.id }, { role: req.user.role }] } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark all read", error: err.message });
  }
}

module.exports = { listNotifications, markRead, markAllRead };
