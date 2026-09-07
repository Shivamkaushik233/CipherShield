const crypto = require("crypto");

/**
 * SIMULATED zero-knowledge proof layer.
 *
 * Statement being proven (the whole point of the ZK layer):
 *   "This transaction's AI-computed fraud risk score exceeds the bank's
 *    published alert threshold" -- WITHOUT revealing the transaction
 *    amount, sender/receiver, device fingerprint, or any raw feature
 *    used to compute that score.
 *
 * A verifier (e.g. an external auditor, or a partner bank) only ever
 * sees: the public threshold, a public 0/1 "threshold met" signal, and
 * a commitment hash - never the private inputs.
 *
 * This module mirrors the exact data shape a real circuit compiled with
 * circom + snarkjs (Groth16) would produce:
 *   { proof: { pi_a, pi_b, pi_c }, publicSignals: [...] }
 * but pi_a/pi_b/pi_c here are HMAC-derived pseudo-points, not real
 * points on an elliptic curve, and verifyProof() re-derives instead of
 * doing a pairing check. Swapping in a real circuit later means:
 *   1. Write circuits/riskThreshold.circom with private signals
 *      (riskScore, salt) and public signals (threshold, thresholdMet).
 *   2. Compile with circom + snarkjs, generate a proving/verification key.
 *   3. Replace generateProof/verifyProof below with snarkjs.groth16.fullProve
 *      / snarkjs.groth16.verify, keeping the same function signatures so
 *      nothing else in the codebase has to change.
 */

const SIM_SECRET = process.env.ZK_SIM_SECRET || "ciphershield-simulated-secret-do-not-use-in-prod";

function hmac(label, input) {
  return crypto.createHmac("sha256", SIM_SECRET).update(`${label}:${input}`).digest("hex");
}

// Produces 3 fake "curve points" (just hex strings shaped like a Groth16 proof)
function fakePoint(seed, n) {
  return Array.from({ length: n }, (_, i) => hmac(`point${i}`, seed));
}

function generateProof({ riskScore, threshold, secretPayload }) {
  const salt = crypto.randomBytes(16).toString("hex");
  const commitment = hmac("commitment", `${secretPayload}|${riskScore}|${salt}`);
  const thresholdMet = riskScore >= threshold;

  const proofSeed = `${commitment}|${threshold}|${thresholdMet}`;
  const proof = {
    pi_a: fakePoint(proofSeed + "a", 2),
    pi_b: [fakePoint(proofSeed + "b0", 2), fakePoint(proofSeed + "b1", 2)],
    pi_c: fakePoint(proofSeed + "c", 2),
  };

  const publicSignals = [thresholdMet ? "1" : "0", String(threshold)];

  return {
    commitment,
    proof,
    publicSignals,
    thresholdMet,
    verified: true, // self-consistent by construction; see verifyProof
    simulated: true,
  };
}

// A "verifier" (auditor UI) recomputes the expected proof shape from the
// public signals + commitment and checks internal consistency. In a real
// system this would be `snarkjs.groth16.verify(vkey, publicSignals, proof)`.
function verifyProof({ commitment, proof, publicSignals }) {
  if (!commitment || !proof || !publicSignals) return false;
  const [thresholdMetFlag, threshold] = publicSignals;
  const proofSeed = `${commitment}|${threshold}|${thresholdMetFlag === "1"}`;
  const expected = {
    pi_a: fakePoint(proofSeed + "a", 2),
    pi_b: [fakePoint(proofSeed + "b0", 2), fakePoint(proofSeed + "b1", 2)],
    pi_c: fakePoint(proofSeed + "c", 2),
  };
  return (
    JSON.stringify(expected.pi_a) === JSON.stringify(proof.pi_a) &&
    JSON.stringify(expected.pi_b) === JSON.stringify(proof.pi_b) &&
    JSON.stringify(expected.pi_c) === JSON.stringify(proof.pi_c)
  );
}

module.exports = { generateProof, verifyProof };
