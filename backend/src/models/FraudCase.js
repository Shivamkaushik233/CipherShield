const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FraudCase = sequelize.define(
  "FraudCase",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    caseNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    transactionId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
    status: {
      type: DataTypes.ENUM("open", "investigating", "resolved", "closed", "reopened"),
      defaultValue: "open",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      defaultValue: "medium",
    },
    assignedToId: { type: DataTypes.UUID, allowNull: true },
    evidence: { type: DataTypes.JSONB, allowNull: true },
    resolutionSummary: { type: DataTypes.STRING(2000), defaultValue: "" },
    resolvedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: "fraud_cases" }
);

module.exports = FraudCase;
