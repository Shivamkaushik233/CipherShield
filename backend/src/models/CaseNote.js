const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CaseNote = sequelize.define(
  "CaseNote",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    caseId: { type: DataTypes.UUID, allowNull: false },
    authorId: { type: DataTypes.UUID, allowNull: true },
    authorName: { type: DataTypes.STRING, allowNull: true },
    text: { type: DataTypes.STRING(4000), allowNull: false },
  },
  { tableName: "case_notes", updatedAt: false }
);

module.exports = CaseNote;
