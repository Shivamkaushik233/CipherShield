require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const sockets = require("./sockets");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const caseRoutes = require("./routes/caseRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const simulatorRoutes = require("./routes/simulatorRoutes");
const auditRoutes = require("./routes/auditRoutes");
const vaultRoutes = require("./routes/vaultRoutes");

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "ok", service: "ciphershield-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/simulator", simulatorRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/vault", vaultRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

sockets.init(server);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => console.log(`[server] CipherShield backend listening on :${PORT}`));
});

module.exports = app;
