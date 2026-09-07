const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notification = sequelize.define(
  "Notification",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: true },
    role: { type: DataTypes.STRING, allowNull: true },
    type: {
      type: DataTypes.ENUM(
        "transaction_approved",
        "transaction_blocked",
        "transaction_review",
        "suspicious_login",
        "new_device",
        "fraud_detected",
        "case_update",
        "system"
      ),
      allowNull: false,
    },
    message: { type: DataTypes.STRING(1000), allowNull: false },
    relatedId: { type: DataTypes.UUID, allowNull: true },
    severity: { type: DataTypes.ENUM("info", "warning", "critical"), defaultValue: "info" },
    read: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: "notifications", updatedAt: false }
);

module.exports = Notification;
