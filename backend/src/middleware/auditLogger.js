const { AuditLog } = require("../models");

// Wraps a route handler so every call is recorded to the audit trail,
// regardless of whether the underlying action succeeds.
// action: string like "case.status_changed" (dot-namespaced, enterprise style)
function withAudit(action, targetType) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      AuditLog.create({
        actorId: req.user?._id,
        actorName: req.user?.name,
        actorRole: req.user?.role,
        action,
        targetType: targetType || "",
        targetId: req.params.id || req.params.caseId || null,
        details: { body: req.body, status: res.statusCode },
        ip: req.ip,
      }).catch((e) => console.error("[audit] failed to write log:", e.message));
      return originalJson(body);
    };
    next();
  };
}

module.exports = withAudit;
