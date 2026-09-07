const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Block = sequelize.define(
  "Block",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    index: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    timestamp: { type: DataTypes.BIGINT, allowNull: false },
    data: { type: DataTypes.JSONB, allowNull: false },
    prevHash: { type: DataTypes.STRING, allowNull: false },
    hash: { type: DataTypes.STRING, allowNull: false },
  },
  { tableName: "blocks" }
);

module.exports = Block;
