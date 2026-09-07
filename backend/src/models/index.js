// Wires up all Sequelize associations in one place.
//
// Schema management note: this project uses sequelize.sync() (called from
// config/db.js on boot) rather than versioned migrations. For a project
// this size that keeps deployment simple (no separate migration step to
// run/forget on Render) - the honest tradeoff is that schema changes are
// applied by re-running sync(), not tracked as reviewable SQL migration
// files. If you outgrow this, migrating to sequelize-cli migrations is a
// natural next step and the model definitions here translate directly.
//
// Association alias note: every "populate"-style relation is aliased with
// a `...Ref` suffix (e.g. Transaction.belongsTo(User, { as: "userRef" }))
// so the raw foreign key column (e.g. `userId`) and the loaded association
// never collide under the same key. Controllers then use the mapping
// helpers in utils/mappers.js to fold `userRef` back into the `userId`
// field in API responses - preserving the exact response shape the
// frontend already expects (`transaction.userId.name` etc.), so no
// frontend changes were needed for this backend rewrite.

const User = require("./User");
const Device = require("./Device");
const Session = require("./Session");
const Transaction = require("./Transaction");
const Block = require("./Block");
const FraudCase = require("./FraudCase");
const CaseNote = require("./CaseNote");
const CaseTimelineEvent = require("./CaseTimelineEvent");
const Notification = require("./Notification");
const AuditLog = require("./AuditLog");
const VaultDocument = require("./VaultDocument");

// --- Device / Session ---
User.hasMany(Device, { foreignKey: "userId" });
Device.belongsTo(User, { foreignKey: "userId", as: "userRef" });

User.hasMany(Session, { foreignKey: "userId" });
Session.belongsTo(User, { foreignKey: "userId", as: "userRef" });
Device.hasMany(Session, { foreignKey: "deviceId" });
Session.belongsTo(Device, { foreignKey: "deviceId", as: "deviceRef" });

// --- Transaction ---
User.hasMany(Transaction, { foreignKey: "userId" });
Transaction.belongsTo(User, { foreignKey: "userId", as: "userRef" });
Device.hasMany(Transaction, { foreignKey: "deviceId" });
Transaction.belongsTo(Device, { foreignKey: "deviceId", as: "deviceRef" });

// --- FraudCase ---
Transaction.hasMany(FraudCase, { foreignKey: "transactionId" });
FraudCase.belongsTo(Transaction, { foreignKey: "transactionId", as: "transactionRef" });
User.hasMany(FraudCase, { foreignKey: "userId", as: "ownedCases" });
FraudCase.belongsTo(User, { foreignKey: "userId", as: "userRef" });
User.hasMany(FraudCase, { foreignKey: "assignedToId", as: "assignedCases" });
FraudCase.belongsTo(User, { foreignKey: "assignedToId", as: "assignedToRef" });

FraudCase.hasMany(CaseNote, { foreignKey: "caseId", as: "notes" });
CaseNote.belongsTo(FraudCase, { foreignKey: "caseId" });

FraudCase.hasMany(CaseTimelineEvent, { foreignKey: "caseId", as: "timeline" });
CaseTimelineEvent.belongsTo(FraudCase, { foreignKey: "caseId" });

FraudCase.hasMany(VaultDocument, { foreignKey: "caseId", as: "documents" });
VaultDocument.belongsTo(FraudCase, { foreignKey: "caseId" });
User.hasMany(VaultDocument, { foreignKey: "uploaderId" });
VaultDocument.belongsTo(User, { foreignKey: "uploaderId", as: "uploaderRef" });

// --- Notification / AuditLog ---
User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId", as: "userRef" });

User.hasMany(AuditLog, { foreignKey: "actorId" });
AuditLog.belongsTo(User, { foreignKey: "actorId", as: "actorRef" });

module.exports = {
  User,
  Device,
  Session,
  Transaction,
  Block,
  FraudCase,
  CaseNote,
  CaseTimelineEvent,
  Notification,
  AuditLog,
  VaultDocument,
};
