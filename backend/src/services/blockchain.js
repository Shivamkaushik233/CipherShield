const crypto = require("crypto");
const { Block } = require("../models");

/**
 * CipherShield audit-trail "blockchain".
 *
 * This is a deliberately simplified hash-chain (no consensus, no mining,
 * single writer) rather than a full distributed ledger or a Solidity
 * contract. What it DOES give you, honestly:
 *
 *   - Every block's hash = SHA-256(index + timestamp + data + prevHash)
 *   - Any edit to historical `data` changes that block's hash, which no
 *     longer matches the `prevHash` stored in the next block -> tamper
 *     evidence, verifiable with verifyChain() below.
 *
 * What it does NOT give you: Byzantine fault tolerance, decentralization,
 * or economic finality - those require an actual multi-node network /
 * smart contract deployment. If you want to upgrade this later, the
 * `data` shape here is exactly what you'd emit as an event from a
 * Solidity `AuditTrail.sol` contract (see README "Next steps").
 *
 * Storage: each block is a row in the `blocks` Postgres table (see
 * models/Block.js) rather than a Mongo collection - the hash-chain logic
 * itself is unchanged by that swap.
 */

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

// PostgreSQL's JSONB storage does not preserve object key insertion order
// the way a JS object literal or MongoDB's BSON does - keys can come back
// in a different order than they went in. Since JSON.stringify() output
// depends on key order, hashing straight JSON.stringify(data) would make
// the same logical data produce a different hash after a round trip
// through JSONB, breaking verifyChain() for no real reason. This
// canonical stringifier sorts keys recursively so the hash only depends
// on the data's actual content, not incidental storage ordering.
function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
}

function computeHash({ index, timestamp, data, prevHash }) {
  const payload = `${index}|${timestamp}|${stableStringify(data)}|${prevHash}`;
  return sha256(payload);
}

const GENESIS_HASH = "0".repeat(64);

async function getLastBlock() {
  return Block.findOne({ order: [["index", "DESC"]] });
}

async function addBlock(data) {
  const last = await getLastBlock();
  const index = last ? last.index + 1 : 0;
  const prevHash = last ? last.hash : GENESIS_HASH;
  const timestamp = Date.now();
  const hash = computeHash({ index, timestamp, data, prevHash });

  const block = await Block.create({ index, timestamp, data, prevHash, hash });
  return block;
}

async function verifyChain() {
  const blocks = await Block.findAll({ order: [["index", "ASC"]] });
  let expectedPrev = GENESIS_HASH;

  for (const block of blocks) {
    const recomputed = computeHash({
      index: block.index,
      timestamp: Number(block.timestamp),
      data: block.data,
      prevHash: block.prevHash,
    });

    if (recomputed !== block.hash) {
      return { valid: false, brokenAtIndex: block.index, reason: "hash_mismatch" };
    }
    if (block.prevHash !== expectedPrev) {
      return { valid: false, brokenAtIndex: block.index, reason: "chain_broken" };
    }
    expectedPrev = block.hash;
  }

  return { valid: true, length: blocks.length };
}

async function getBlockByTransactionId(transactionId) {
  // JSONB containment query - Sequelize translates this into
  // "data"->>'transactionId' = ... against the JSONB column.
  return Block.findOne({ where: { data: { transactionId: String(transactionId) } } });
}

module.exports = { addBlock, verifyChain, getLastBlock, getBlockByTransactionId, sha256, GENESIS_HASH };
