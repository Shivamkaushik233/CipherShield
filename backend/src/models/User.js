const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("customer", "analyst", "admin", "auditor"),
      defaultValue: "customer",
    },
    trustScore: { type: DataTypes.FLOAT, defaultValue: 72 },
    totalTransactions: { type: DataTypes.INTEGER, defaultValue: 0 },
    successfulPayments: { type: DataTypes.INTEGER, defaultValue: 0 },
    previousFrauds: { type: DataTypes.INTEGER, defaultValue: 0 },
    avgAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { tableName: "users" }
);

User.prototype.toSafeJSON = function () {
  const { id, name, email, role, trustScore, totalTransactions, successfulPayments, previousFrauds, avgAmount, createdAt } = this;
  return { id, _id: id, name, email, role, trustScore, totalTransactions, successfulPayments, previousFrauds, avgAmount, createdAt };
};

module.exports = User;
