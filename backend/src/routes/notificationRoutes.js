const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const { listNotifications, markRead, markAllRead } = require("../controllers/notificationController");

router.use(requireAuth);
router.get("/", listNotifications);
router.patch("/:id/read", markRead);
router.patch("/read-all", markAllRead);

module.exports = router;
