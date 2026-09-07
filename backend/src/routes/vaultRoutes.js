const router = require("express").Router();
const multer = require("multer");
const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/roles");
const { uploadDocument, listDocuments, downloadDocument } = require("../controllers/vaultController");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

router.use(requireAuth, requireRole("analyst", "admin", "auditor"));
router.post("/upload", upload.single("file"), uploadDocument);
router.get("/case/:caseId", listDocuments);
router.get("/:id/download", downloadDocument);

module.exports = router;
