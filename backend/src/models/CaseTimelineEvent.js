const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CaseTimelineEvent = sequelize.define(
  "CaseTimelineEvent",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    caseId: { type: DataTypes.UUID, allowNull: false },
    event: { type: DataTypes.STRING, allowNull: false },
    at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    meta: { type: DataTypes.JSONB, allowNull: true },
  },
  { tableName: "case_timeline_events", timestamps: false }
);

module.exports = CaseTimelineEvent;
