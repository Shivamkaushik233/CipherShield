const { Op, fn, col } = require("sequelize");
const { Transaction, FraudCase, User, Device } = require("../models");
const { mapTransaction } = require("../utils/mappers");

async function getKpis(req, res) {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalTransactions, fraudToday, highRiskUsers, pendingReviews, recentAlerts, avgRow] = await Promise.all([
      Transaction.count(),
      Transaction.count({ where: { status: "blocked", createdAt: { [Op.gte]: startOfDay } } }),
      User.count({ where: { trustScore: { [Op.lt]: 40 } } }),
      FraudCase.count({ where: { status: { [Op.in]: ["open", "investigating", "reopened"] } } }),
      Transaction.findAll({
        where: { riskScore: { [Op.gte]: 55 } },
        order: [["createdAt", "DESC"]],
        limit: 8,
        include: [{ model: User, as: "userRef", attributes: ["id", "name", "email"] }],
      }),
      Transaction.findOne({ attributes: [[fn("AVG", col("riskScore")), "avg"]], raw: true }),
    ]);

    res.json({
      totalTransactions,
      fraudToday,
      highRiskUsers,
      pendingReviews,
      recentAlerts: recentAlerts.map(mapTransaction),
      avgRiskScore: avgRow?.avg ? Number(Number(avgRow.avg).toFixed(1)) : 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load KPIs", error: err.message });
  }
}

async function getRiskDistribution(req, res) {
  try {
    const buckets = [
      { label: "Low (0-39)", min: 0, max: 39 },
      { label: "Medium (40-59)", min: 40, max: 59 },
      { label: "High (60-84)", min: 60, max: 84 },
      { label: "Critical (85-100)", min: 85, max: 100 },
    ];
    const results = await Promise.all(
      buckets.map(async (b) => ({
        label: b.label,
        value: await Transaction.count({ where: { riskScore: { [Op.gte]: b.min, [Op.lte]: b.max } } }),
      }))
    );
    res.json({ distribution: results });
  } catch (err) {
    res.status(500).json({ message: "Failed to load risk distribution", error: err.message });
  }
}

async function getFraudByHour(req, res) {
  try {
    // Grouped in JS rather than via a SQL date-extract for portability
    // across Postgres versions/timezone settings - dataset sizes here are
    // small enough that this is simpler and just as fast.
    const blocked = await Transaction.findAll({ where: { status: "blocked" }, attributes: ["createdAt"], raw: true });
    const counts = new Array(24).fill(0);
    blocked.forEach((t) => counts[new Date(t.createdAt).getHours()]++);
    res.json({ hours: counts.map((count, hour) => ({ hour, count })) });
  } catch (err) {
    res.status(500).json({ message: "Failed to load fraud-by-hour", error: err.message });
  }
}

async function getDeviceUsage(req, res) {
  try {
    const [byOs, byBrowser, all] = await Promise.all([
      Device.findAll({ attributes: ["os", [fn("COUNT", col("id")), "count"]], group: ["os"], raw: true }),
      Device.findAll({ attributes: ["browser", [fn("COUNT", col("id")), "count"]], group: ["browser"], raw: true }),
      Device.findAll({ attributes: ["trustScore"], raw: true }),
    ]);
    const trustBuckets = [
      { range: "0-39", count: all.filter((d) => d.trustScore < 40).length },
      { range: "40-69", count: all.filter((d) => d.trustScore >= 40 && d.trustScore < 70).length },
      { range: "70-100", count: all.filter((d) => d.trustScore >= 70).length },
    ];
    res.json({ byOs, byBrowser, trustBuckets });
  } catch (err) {
    res.status(500).json({ message: "Failed to load device usage", error: err.message });
  }
}

async function getMonthlyFraud(req, res) {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const rows = await Transaction.findAll({
      where: { createdAt: { [Op.gte]: twelveMonthsAgo } },
      attributes: ["createdAt", "status", "riskScore"],
      raw: true,
    });

    const byMonth = {};
    rows.forEach((t) => {
      const d = new Date(t.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!byMonth[key]) byMonth[key] = { year: d.getFullYear(), month: d.getMonth() + 1, total: 0, blocked: 0, riskSum: 0 };
      byMonth[key].total += 1;
      byMonth[key].riskSum += t.riskScore;
      if (t.status === "blocked") byMonth[key].blocked += 1;
    });

    const months = Object.values(byMonth)
      .map((m) => ({ _id: { y: m.year, m: m.month }, total: m.total, blocked: m.blocked, avgRisk: m.riskSum / m.total }))
      .sort((a, b) => a._id.y - b._id.y || a._id.m - b._id.m);

    res.json({ months });
  } catch (err) {
    res.status(500).json({ message: "Failed to load monthly fraud stats", error: err.message });
  }
}

module.exports = { getKpis, getRiskDistribution, getFraudByHour, getDeviceUsage, getMonthlyFraud };
