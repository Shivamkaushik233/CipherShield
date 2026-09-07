const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    actorId: { type: DataTypes.UUID, allowNull: true },
    actorName: { type: DataTypes.STRING, allowNull: true },
    actorRole: { type: DataTypes.STRING, allowNull: true },
    action: { type: DataTypes.STRING, allowNull: false },
    targetType: { type: DataTypes.STRING, defaultValue: "" },
    targetId: { type: DataTypes.UUID, allowNull: true },
    details: { type: DataTypes.JSONB, defaultValue: {} },
    ip: { type: DataTypes.STRING, defaultValue: "" },
  },
  { tableName: "audit_logs", updatedAt: false }
);

module.exports = AuditLog;
