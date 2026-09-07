const { FraudCase, Transaction, User, CaseNote, CaseTimelineEvent, Notification } = require("../models");
const { emitToAnalysts, emitToUser } = require("../sockets");
const { renderCaseReportPdf } = require("../services/pdfReports");
const { mapCase, mapTransaction } = require("../utils/mappers");

const VALID_TRANSITIONS = {
  open: ["investigating", "closed"],
  investigating: ["resolved", "open"],
  resolved: ["closed", "reopened"],
  closed: ["reopened"],
  reopened: ["investigating", "closed"],
};

const CASE_INCLUDES = [
  { model: User, as: "userRef", attributes: ["id", "name", "email", "trustScore"] },
  { model: User, as: "assignedToRef", attributes: ["id", "name", "email"] },
  {
    model: Transaction,
    as: "transactionRef",
    include: [{ model: User, as: "userRef", attributes: ["id", "name", "email", "trustScore"] }],
  },
  { model: CaseNote, as: "notes" },
  { model: CaseTimelineEvent, as: "timeline" },
];

async function listCases(req, res) {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.priority) where.priority = req.query.priority;
    if (req.query.assignedTo) where.assignedToId = req.query.assignedTo;

    const cases = await FraudCase.findAll({
      where,
      include: CASE_INCLUDES,
      order: [["createdAt", "DESC"]],
      limit: 200,
    });

    res.json({ items: cases.map(mapCase) });
  } catch (err) {
    res.status(500).json({ message: "Failed to load cases", error: err.message });
  }
}

async function getCase(req, res) {
  try {
    const fraudCase = await FraudCase.findByPk(req.params.id, { include: CASE_INCLUDES });
    if (!fraudCase) return res.status(404).json({ message: "Case not found" });
    res.json({ case: mapCase(fraudCase) });
  } catch (err) {
    res.status(500).json({ message: "Failed to load case", error: err.message });
  }
}

async function updateStatus(req, res) {
  try {
    const { status, resolutionSummary } = req.body;
    const fraudCase = await FraudCase.findByPk(req.params.id);
    if (!fraudCase) return res.status(404).json({ message: "Case not found" });

    const allowed = VALID_TRANSITIONS[fraudCase.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Cannot move case from '${fraudCase.status}' to '${status}'` });
    }

    fraudCase.status = status;
    if (status === "resolved") {
      fraudCase.resolvedAt = new Date();
      fraudCase.resolutionSummary = resolutionSummary || fraudCase.resolutionSummary;
    }
    await fraudCase.save();
    await CaseTimelineEvent.create({ caseId: fraudCase.id, event: `Status changed to ${status} by ${req.user.name}` });

    await Notification.create({
      role: "analyst",
      type: "case_update",
      message: `Case ${fraudCase.caseNumber} moved to ${status}`,
      relatedId: fraudCase.id,
      severity: "info",
    });

    const full = await FraudCase.findByPk(fraudCase.id, { include: CASE_INCLUDES });
    emitToAnalysts("case:update", { case: mapCase(full) });
    emitToUser(fraudCase.userId, "case:update", { caseNumber: fraudCase.caseNumber, status });

    res.json({ case: mapCase(full) });
  } catch (err) {
    res.status(500).json({ message: "Failed to update case", error: err.message });
  }
}

async function assignCase(req, res) {
  try {
    const { analystId } = req.body;
    const fraudCase = await FraudCase.findByPk(req.params.id);
    if (!fraudCase) return res.status(404).json({ message: "Case not found" });

    fraudCase.assignedToId = analystId;
    await fraudCase.save();
    await CaseTimelineEvent.create({ caseId: fraudCase.id, event: `Assigned by ${req.user.name}`, meta: { analystId } });

    const full = await FraudCase.findByPk(fraudCase.id, { include: CASE_INCLUDES });
    emitToAnalysts("case:update", { case: mapCase(full) });
    res.json({ case: mapCase(full) });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign case", error: err.message });
  }
}

async function addNote(req, res) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Note text is required" });

    const fraudCase = await FraudCase.findByPk(req.params.id);
    if (!fraudCase) return res.status(404).json({ message: "Case not found" });

    await CaseNote.create({ caseId: fraudCase.id, authorId: req.user.id, authorName: req.user.name, text });
    await CaseTimelineEvent.create({ caseId: fraudCase.id, event: `Note added by ${req.user.name}` });

    const full = await FraudCase.findByPk(fraudCase.id, { include: CASE_INCLUDES });
    emitToAnalysts("case:update", { case: mapCase(full) });
    res.json({ case: mapCase(full) });
  } catch (err) {
    res.status(500).json({ message: "Failed to add note", error: err.message });
  }
}

async function priority(req, res) {
  try {
    const { priority } = req.body;
    const fraudCase = await FraudCase.findByPk(req.params.id);
    if (!fraudCase) return res.status(404).json({ message: "Case not found" });
    fraudCase.priority = priority;
    await fraudCase.save();
    await CaseTimelineEvent.create({ caseId: fraudCase.id, event: `Priority changed to ${priority} by ${req.user.name}` });

    const full = await FraudCase.findByPk(fraudCase.id, { include: CASE_INCLUDES });
    emitToAnalysts("case:update", { case: mapCase(full) });
    res.json({ case: mapCase(full) });
  } catch (err) {
    res.status(500).json({ message: "Failed to update priority", error: err.message });
  }
}

async function downloadCaseReport(req, res) {
  try {
    const fraudCase = await FraudCase.findByPk(req.params.id, { include: CASE_INCLUDES });
    if (!fraudCase) return res.status(404).json({ message: "Case not found" });
    const mapped = mapCase(fraudCase);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=case-${fraudCase.caseNumber}.pdf`);
    renderCaseReportPdf(mapped, mapped.transactionId).pipe(res);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate report", error: err.message });
  }
}

module.exports = { listCases, getCase, updateStatus, assignCase, addNote, priority, downloadCaseReport };
