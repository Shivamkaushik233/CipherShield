const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const {
  createTransaction,
  listTransactions,
  getTransaction,
  verifyBlockchainRecord,
  downloadReceipt,
} = require("../controllers/transactionController");

router.use(requireAuth);
router.post("/", createTransaction);
router.get("/", listTransactions);
router.get("/:id", getTransaction);
router.get("/:id/verify", verifyBlockchainRecord);
router.get("/:id/receipt", downloadReceipt);

module.exports = router;
