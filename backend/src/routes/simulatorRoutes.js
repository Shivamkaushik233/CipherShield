const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const { listScenarios, runScenario } = require("../controllers/simulatorController");

router.use(requireAuth);
router.get("/scenarios", listScenarios);
router.post("/run/:scenario", runScenario);

module.exports = router;
