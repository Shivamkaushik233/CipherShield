// Converts Sequelize model instances (with `...Ref` associations eager-
// loaded) into plain JSON shaped exactly like the original Mongoose API,
// so the existing frontend needs zero changes after this backend's
// database swap. See models/index.js for the alias-naming rationale.

function plain(instance) {
  if (instance === null || instance === undefined) return instance;
  return typeof instance.get === "function" ? instance.get({ plain: true }) : instance;
}

function mapUser(u) {
  const o = plain(u);
  if (!o) return o;
  return {
    _id: o.id,
    id: o.id,
    name: o.name,
    email: o.email,
    role: o.role,
    trustScore: o.trustScore,
    totalTransactions: o.totalTransactions,
    successfulPayments: o.successfulPayments,
    previousFrauds: o.previousFrauds,
    avgAmount: o.avgAmount,
    createdAt: o.createdAt,
  };
}

function mapDevice(d) {
  const o = plain(d);
  if (!o) return o;
  return { ...o, _id: o.id };
}

function mapTransaction(t) {
  const o = plain(t);
  if (!o) return o;
  const mapped = {
    ...o,
    _id: o.id,
    userId: o.userRef ? mapUser(o.userRef) : o.userId,
    deviceId: o.deviceRef ? mapDevice(o.deviceRef) : o.deviceId,
  };
  delete mapped.userRef;
  delete mapped.deviceRef;
  return mapped;
}

function mapNote(n) {
  const o = plain(n);
  if (!o) return o;
  return { _id: o.id, authorName: o.authorName, text: o.text, createdAt: o.createdAt };
}

function mapTimelineEvent(t) {
  const o = plain(t);
  if (!o) return o;
  return { event: o.event, at: o.at, meta: o.meta };
}

function mapCase(c) {
  const o = plain(c);
  if (!o) return o;
  const mapped = {
    ...o,
    _id: o.id,
    userId: o.userRef ? mapUser(o.userRef) : o.userId,
    assignedTo: o.assignedToRef ? mapUser(o.assignedToRef) : o.assignedToId ? { _id: o.assignedToId } : null,
    transactionId: o.transactionRef ? mapTransaction(o.transactionRef) : o.transactionId,
    notes: Array.isArray(o.notes) ? o.notes.map(mapNote) : [],
    timeline: Array.isArray(o.timeline) ? o.timeline.map(mapTimelineEvent) : [],
  };
  delete mapped.userRef;
  delete mapped.assignedToRef;
  delete mapped.transactionRef;
  return mapped;
}

function mapNotification(n) {
  const o = plain(n);
  if (!o) return o;
  return { ...o, _id: o.id };
}

function mapAuditLog(l) {
  const o = plain(l);
  if (!o) return o;
  return { ...o, _id: o.id };
}

function mapBlock(b) {
  const o = plain(b);
  if (!o) return o;
  return { ...o, _id: o.id, timestamp: Number(o.timestamp) };
}

function mapDocument(d) {
  const o = plain(d);
  if (!o) return o;
  return { ...o, _id: o.id };
}

function mapSession(s) {
  const o = plain(s);
  if (!o) return o;
  const mapped = { ...o, _id: o.id, deviceId: o.deviceRef ? mapDevice(o.deviceRef) : o.deviceId };
  delete mapped.deviceRef;
  return mapped;
}

module.exports = {
  mapUser,
  mapDevice,
  mapTransaction,
  mapNote,
  mapTimelineEvent,
  mapCase,
  mapNotification,
  mapAuditLog,
  mapBlock,
  mapDocument,
  mapSession,
};
