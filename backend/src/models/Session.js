const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Session = sequelize.define(
  "Session",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    deviceId: { type: DataTypes.UUID, allowNull: true },
    ip: { type: DataTypes.STRING, defaultValue: "0.0.0.0" },
    location: { type: DataTypes.JSONB, defaultValue: { country: "Unknown", city: "Unknown" } },
    userAgent: { type: DataTypes.STRING, defaultValue: "" },
    loginAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    lastActiveAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    logoutAt: { type: DataTypes.DATE, allowNull: true },
    failed: { type: DataTypes.BOOLEAN, defaultValue: false },
    isNewDevice: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: "sessions" }
);

module.exports = Session;
