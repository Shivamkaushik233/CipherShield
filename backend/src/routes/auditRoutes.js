const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/roles");
const { listAuditLogs, listBlocks, verifyChainHandler } = require("../controllers/auditController");

router.use(requireAuth, requireRole("admin", "auditor"));
router.get("/logs", listAuditLogs);
router.get("/blocks", listBlocks);
router.get("/verify-chain", verifyChainHandler);

module.exports = router;
