const { Op } = require("sequelize");
const { Transaction, Device, User } = require("../models");
const { buildFeatures } = require("../utils/features");
const { mockGeoFromIp, parseUserAgent, fingerprint } = require("../utils/deviceInfo");
const { processTransaction } = require("../services/fraudEngine");
const { verifyProof } = require("../services/zkproof");
const blockchain = require("../services/blockchain");
const { renderReceiptPdf } = require("../services/pdfReports");
const { mapTransaction, mapBlock } = require("../utils/mappers");

async function createTransaction(req, res) {
  try {
    const { receiver, amount, currency } = req.body;
    if (!receiver || !amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "receiver and a positive amount are required" });
    }

    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0").split(",")[0].trim();
    const ua = req.headers["user-agent"] || "";
    const { os, browser } = parseUserAgent(ua);
    const fp = fingerprint(req.user.id, ua, ip);
    const location = mockGeoFromIp(ip);

    let device = await Device.findOne({ where: { userId: req.user.id, fingerprint: fp } });
    if (!device) {
      device = await Device.create({
        userId: req.user.id,
        fingerprint: fp,
        deviceName: `${os} · ${browser}`,
        os,
        browser,
        ip,
        location,
        trustScore: 35,
      });
    }

    const features = await buildFeatures({ user: req.user, device, amount: Number(amount), location });

    const result = await processTransaction({
      user: req.user,
      device,
      features,
      receiver,
      amount: Number(amount),
      currency,
      ip,
      location,
      scenario: "normal",
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Transaction failed", error: err.message });
  }
}

async function listTransactions(req, res) {
  try {
    const isPrivileged = ["analyst", "admin", "auditor"].includes(req.user.role);
    const where = isPrivileged ? {} : { userId: req.user.id };

    if (req.query.status) where.status = req.query.status;
    if (req.query.userId && isPrivileged) where.userId = req.query.userId;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);

    const { rows, count } = await Transaction.findAndCountAll({
      where,
      include: [
        { model: User, as: "userRef", attributes: ["id", "name", "email", "trustScore"] },
        { model: Device, as: "deviceRef", attributes: ["id", "deviceName", "browser", "os", "trustScore"] },
      ],
      order: [["createdAt", "DESC"]],
      offset: (page - 1) * limit,
      limit,
    });

    res.json({ items: rows.map(mapTransaction), total: count, page, pages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch transactions", error: err.message });
  }
}

async function getTransaction(req, res) {
  try {
    const txn = await Transaction.findByPk(req.params.id, {
      include: [
        { model: User, as: "userRef", attributes: ["id", "name", "email", "trustScore"] },
        { model: Device, as: "deviceRef" },
      ],
    });
    if (!txn) return res.status(404).json({ message: "Transaction not found" });

    const isOwner = String(txn.userId) === String(req.user.id);
    const isPrivileged = ["analyst", "admin", "auditor"].includes(req.user.role);
    if (!isOwner && !isPrivileged) return res.status(403).json({ message: "Forbidden" });

    res.json({ transaction: mapTransaction(txn) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch transaction", error: err.message });
  }
}

async function verifyBlockchainRecord(req, res) {
  try {
    const txn = await Transaction.findByPk(req.params.id);
    if (!txn) return res.status(404).json({ message: "Transaction not found" });

    const block = await blockchain.getBlockByTransactionId(txn.id);
    const chainStatus = await blockchain.verifyChain();
    const zkValid = verifyProof(txn.zkProof);

    res.json({
      block: block ? mapBlock(block) : null,
      chainValid: chainStatus.valid,
      chainLength: chainStatus.length,
      zkProofValid: zkValid,
      zkPublicSignals: txn.zkProof?.publicSignals,
    });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
}

async function downloadReceipt(req, res) {
  try {
    const txn = await Transaction.findByPk(req.params.id, {
      include: [{ model: User, as: "userRef", attributes: ["id", "name", "email"] }],
    });
    if (!txn) return res.status(404).json({ message: "Transaction not found" });

    const isOwner = String(txn.userId) === String(req.user.id);
    const isPrivileged = ["analyst", "admin", "auditor"].includes(req.user.role);
    if (!isOwner && !isPrivileged) return res.status(403).json({ message: "Forbidden" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=receipt-${txn.id}.pdf`);
    renderReceiptPdf(mapTransaction(txn)).pipe(res);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate receipt", error: err.message });
  }
}

module.exports = { createTransaction, listTransactions, getTransaction, verifyBlockchainRecord, downloadReceipt };
