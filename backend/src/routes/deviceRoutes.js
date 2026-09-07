const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/roles");
const { myDevices, mySessions, revokeSession, userSecurityFootprint } = require("../controllers/deviceController");

router.use(requireAuth);
router.get("/me", myDevices);
router.get("/me/sessions", mySessions);
router.patch("/sessions/:id/revoke", revokeSession);
router.get("/users/:userId/footprint", requireRole("analyst", "admin", "auditor"), userSecurityFootprint);

module.exports = router;
