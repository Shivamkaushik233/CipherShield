const crypto = require("crypto");

const ALGO = "aes-256-gcm";
const KEY = crypto.createHash("sha256").update(process.env.VAULT_ENCRYPTION_KEY || "ciphershield-dev-vault-key-change-me").digest();

function encryptBuffer(buffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Store iv + authTag + ciphertext together, iv/tag are not secret.
  return Buffer.concat([iv, authTag, encrypted]);
}

function decryptBuffer(payload) {
  const iv = payload.subarray(0, 12);
  const authTag = payload.subarray(12, 28);
  const ciphertext = payload.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

module.exports = { encryptBuffer, decryptBuffer };
