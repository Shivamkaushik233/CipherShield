const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { VaultDocument } = require("../models");
const { encryptBuffer, decryptBuffer } = require("../utils/encryption");
const { mapDocument } = require("../utils/mappers");

const VAULT_DIR = path.join(__dirname, "..", "..", "vault_storage");
if (!fs.existsSync(VAULT_DIR)) fs.mkdirSync(VAULT_DIR, { recursive: true });

async function uploadDocument(req, res) {
  try {
    const { caseId, note } = req.body;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    if (!caseId) return res.status(400).json({ message: "caseId is required" });

    const storedName = `${uuidv4()}.enc`;
    const encrypted = encryptBuffer(req.file.buffer);
    fs.writeFileSync(path.join(VAULT_DIR, storedName), encrypted);

    const doc = await VaultDocument.create({
      caseId,
      uploaderId: req.user.id,
      fileName: req.file.originalname,
      storedName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      note: note || "",
    });

    res.status(201).json({ document: mapDocument(doc) });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
}

async function listDocuments(req, res) {
  try {
    const docs = await VaultDocument.findAll({ where: { caseId: req.params.caseId }, order: [["createdAt", "DESC"]] });
    res.json({ items: docs.map(mapDocument) });
  } catch (err) {
    res.status(500).json({ message: "Failed to list documents", error: err.message });
  }
}

async function downloadDocument(req, res) {
  try {
    const doc = await VaultDocument.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const encrypted = fs.readFileSync(path.join(VAULT_DIR, doc.storedName));
    const decrypted = decryptBuffer(encrypted);

    res.setHeader("Content-Type", doc.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${doc.fileName}"`);
    res.send(decrypted);
  } catch (err) {
    res.status(500).json({ message: "Download failed", error: err.message });
  }
}

module.exports = { uploadDocument, listDocuments, downloadDocument };
