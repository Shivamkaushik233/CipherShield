const { Transaction, FraudCase, User, Notification, CaseTimelineEvent } = require("../models");
const { predictFraud } = require("./aiClient");
const { generateProof } = require("./zkproof");
const blockchain = require("./blockchain");
const { emitToAnalysts, emitToUser } = require("../sockets");
const { mapTransaction, mapCase } = require("../utils/mappers");

const BLOCK_THRESHOLD = Number(process.env.BLOCK_THRESHOLD || 85);
const REVIEW_THRESHOLD = Number(process.env.REVIEW_THRESHOLD || 55);
const CASE_THRESHOLD = Number(process.env.CASE_AUTO_CREATE_THRESHOLD || 70);

function priorityFromScore(score) {
  if (score >= 90) return "critical";
  if (score >= 75) return "high";
  if (score >= 55) return "medium";
  return "low";
}

async function generateCaseNumber() {
  const count = await FraudCase.count();
  const year = new Date().getFullYear();
  return `ZKF-${year}-${String(count + 1).padStart(5, "0")}`;
}

/**
 * Runs a transaction end-to-end through the fraud pipeline:
 * AI risk scoring -> decision -> simulated ZK proof -> blockchain audit
 * entry -> auto case creation -> real-time notifications.
 */
async function processTransaction({ user, device, features, receiver, amount, currency, ip, location, scenario }) {
  const ai = await predictFraud(features);
  const riskScore = Math.round(ai.riskScore);

  let status = "approved";
  if (riskScore >= BLOCK_THRESHOLD) status = "blocked";
  else if (riskScore >= REVIEW_THRESHOLD) status = "pending_review";

  const zk = generateProof({
    riskScore,
    threshold: BLOCK_THRESHOLD,
    secretPayload: JSON.stringify({ userId: user.id, amount, receiver, features }),
  });

  let txn = await Transaction.create({
    userId: user.id,
    receiver,
    amount,
    currency: currency || "INR",
    deviceId: device?.id,
    ip,
    location,
    features,
    riskScore,
    confidence: ai.confidence,
    reasons: ai.reasons,
    status,
    scenario: scenario || "normal",
    zkProof: zk,
  });

  const block = await blockchain.addBlock({
    transactionId: String(txn.id),
    userId: String(user.id),
    riskScore,
    status,
    zkCommitment: zk.commitment,
  });

  txn.blockHash = block.hash;
  txn.prevHash = block.prevHash;
  txn.blockIndex = block.index;
  await txn.save();

  // Update rolling user stats
  user.totalTransactions += 1;
  if (status !== "blocked") user.successfulPayments += 1;
  if (status === "blocked") user.previousFrauds += 1;
  user.avgAmount = (user.avgAmount * (user.totalTransactions - 1) + amount) / user.totalTransactions;
  user.trustScore = Math.max(5, Math.min(99, user.trustScore + (status === "approved" ? 0.5 : status === "blocked" ? -8 : -2)));
  await user.save();

  let fraudCase = null;
  if (riskScore >= CASE_THRESHOLD) {
    fraudCase = await FraudCase.create({
      caseNumber: await generateCaseNumber(),
      transactionId: txn.id,
      userId: user.id,
      status: "open",
      priority: priorityFromScore(riskScore),
      evidence: {
        transactionSnapshot: { amount, receiver, currency, features },
        deviceSnapshot: device ? device.get({ plain: true }) : null,
        locationSnapshot: location,
        aiSnapshot: ai,
        blockchainHash: block.hash,
      },
    });
    await CaseTimelineEvent.create({
      caseId: fraudCase.id,
      event: "Case auto-created by AI fraud engine",
      meta: { riskScore },
    });

    await Notification.create({
      role: "analyst",
      type: "fraud_detected",
      message: `New ${priorityFromScore(riskScore)} priority fraud case ${fraudCase.caseNumber} (risk ${riskScore}%)`,
      relatedId: fraudCase.id,
      severity: riskScore >= 90 ? "critical" : "warning",
    });
    emitToAnalysts("case:new", { case: mapCase(fraudCase), transaction: mapTransaction(txn) });
    emitToAnalysts("alert:new", {
      message: `Risk ${riskScore}% - ${status.toUpperCase()} - ${fraudCase.caseNumber}`,
      severity: riskScore >= 90 ? "critical" : "warning",
      transactionId: txn.id,
    });
  }

  const userNotifType =
    status === "blocked" ? "transaction_blocked" : status === "pending_review" ? "transaction_review" : "transaction_approved";
  const userMessage =
    status === "blocked"
      ? `Your transfer of ${currency || "INR"} ${amount} to ${receiver} was blocked (risk ${riskScore}%).`
      : status === "pending_review"
      ? `Your transfer of ${currency || "INR"} ${amount} to ${receiver} is under review (risk ${riskScore}%).`
      : `Your transfer of ${currency || "INR"} ${amount} to ${receiver} was approved.`;

  await Notification.create({
    userId: user.id,
    type: userNotifType,
    message: userMessage,
    relatedId: txn.id,
    severity: status === "blocked" ? "critical" : status === "pending_review" ? "warning" : "info",
  });

  const mappedTxn = mapTransaction(txn);
  emitToUser(user.id, "transaction:update", { transaction: mappedTxn });
  emitToAnalysts("transaction:new", { transaction: mappedTxn });

  return { transaction: mappedTxn, fraudCase: fraudCase ? mapCase(fraudCase) : null, ai };
}

module.exports = { processTransaction, priorityFromScore, generateCaseNumber };
