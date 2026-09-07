const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VaultDocument = sequelize.define(
  "VaultDocument",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    caseId: { type: DataTypes.UUID, allowNull: false },
    uploaderId: { type: DataTypes.UUID, allowNull: false },
    fileName: { type: DataTypes.STRING, allowNull: false },
    storedName: { type: DataTypes.STRING, allowNull: false },
    mimeType: { type: DataTypes.STRING, defaultValue: "application/octet-stream" },
    size: { type: DataTypes.INTEGER, defaultValue: 0 },
    note: { type: DataTypes.STRING(2000), defaultValue: "" },
    encrypted: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { tableName: "vault_documents", updatedAt: false }
);

module.exports = VaultDocument;
