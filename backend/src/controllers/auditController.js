const { AuditLog, Block } = require("../models");
const blockchain = require("../services/blockchain");
const { mapAuditLog, mapBlock } = require("../utils/mappers");

async function listAuditLogs(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 30);
    const { rows, count } = await AuditLog.findAndCountAll({
      order: [["createdAt", "DESC"]],
      offset: (page - 1) * limit,
      limit,
    });
    res.json({ items: rows.map(mapAuditLog), total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: "Failed to load audit logs", error: err.message });
  }
}

async function listBlocks(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 30);
    const [{ rows, count }, chainStatus] = await Promise.all([
      Block.findAndCountAll({
        order: [["index", "DESC"]],
        offset: (page - 1) * limit,
        limit,
      }),
      blockchain.verifyChain(),
    ]);
    res.json({ items: rows.map(mapBlock), total: count, page, pages: Math.ceil(count / limit), chainStatus });
  } catch (err) {
    res.status(500).json({ message: "Failed to load blocks", error: err.message });
  }
}

async function verifyChainHandler(req, res) {
  try {
    const status = await blockchain.verifyChain();
    res.json(status);
  } catch (err) {
    res.status(500).json({ message: "Chain verification failed", error: err.message });
  }
}

module.exports = { listAuditLogs, listBlocks, verifyChainHandler };
