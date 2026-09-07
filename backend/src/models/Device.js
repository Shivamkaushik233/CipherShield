const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Device = sequelize.define(
  "Device",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    fingerprint: { type: DataTypes.STRING, allowNull: false },
    deviceName: { type: DataTypes.STRING, defaultValue: "Unknown device" },
    os: { type: DataTypes.STRING, defaultValue: "Unknown OS" },
    browser: { type: DataTypes.STRING, defaultValue: "Unknown browser" },
    ip: { type: DataTypes.STRING, defaultValue: "0.0.0.0" },
    location: {
      type: DataTypes.JSONB,
      defaultValue: { country: "Unknown", city: "Unknown", lat: 0, lng: 0 },
    },
    trustScore: { type: DataTypes.FLOAT, defaultValue: 50 },
    isTrusted: { type: DataTypes.BOOLEAN, defaultValue: false },
    firstSeen: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    lastSeen: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "devices", indexes: [{ unique: true, fields: ["userId", "fingerprint"] }] }
);

module.exports = Device;
