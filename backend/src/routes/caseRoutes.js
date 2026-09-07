const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/roles");
const withAudit = require("../middleware/auditLogger");
const {
  listCases,
  getCase,
  updateStatus,
  assignCase,
  addNote,
  priority,
  downloadCaseReport,
} = require("../controllers/caseController");

router.use(requireAuth, requireRole("analyst", "admin", "auditor"));
router.get("/", listCases);
router.get("/:id", getCase);
router.get("/:id/report", withAudit("case.report_downloaded", "FraudCase"), downloadCaseReport);
router.patch("/:id/status", withAudit("case.status_changed", "FraudCase"), updateStatus);
router.patch("/:id/assign", withAudit("case.assigned", "FraudCase"), assignCase);
router.patch("/:id/priority", withAudit("case.priority_changed", "FraudCase"), priority);
router.post("/:id/notes", withAudit("case.note_added", "FraudCase"), addNote);

module.exports = router;
