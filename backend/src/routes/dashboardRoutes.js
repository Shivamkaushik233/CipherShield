const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/roles");
const {
  getKpis,
  getRiskDistribution,
  getFraudByHour,
  getDeviceUsage,
  getMonthlyFraud,
} = require("../controllers/dashboardController");

router.use(requireAuth, requireRole("analyst", "admin", "auditor"));
router.get("/kpis", getKpis);
router.get("/risk-distribution", getRiskDistribution);
router.get("/fraud-by-hour", getFraudByHour);
router.get("/device-usage", getDeviceUsage);
router.get("/monthly-fraud", getMonthlyFraud);

module.exports = router;
