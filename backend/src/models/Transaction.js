const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Transaction = sequelize.define(
  "Transaction",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    receiver: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: "INR" },
    deviceId: { type: DataTypes.UUID, allowNull: true },
    ip: { type: DataTypes.STRING, defaultValue: "0.0.0.0" },
    location: { type: DataTypes.JSONB, defaultValue: { country: "Unknown", city: "Unknown" } },
    features: { type: DataTypes.JSONB, defaultValue: {} },
    riskScore: { type: DataTypes.FLOAT, defaultValue: 0 },
    confidence: { type: DataTypes.FLOAT, defaultValue: 0 },
    reasons: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    status: {
      type: DataTypes.ENUM("approved", "pending_review", "blocked"),
      defaultValue: "approved",
    },
    scenario: { type: DataTypes.STRING, defaultValue: "normal" },
    zkProof: { type: DataTypes.JSONB, allowNull: true },
    blockHash: { type: DataTypes.STRING, allowNull: true },
    prevHash: { type: DataTypes.STRING, allowNull: true },
    blockIndex: { type: DataTypes.INTEGER, allowNull: true },
  },
  { tableName: "transactions", indexes: [{ fields: ["createdAt"] }] }
);

module.exports = Transaction;
