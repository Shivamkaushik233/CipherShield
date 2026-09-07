const sequelize = require("./database");

// Loads every model + association definition before syncing, then creates
// any tables that don't exist yet (see models/index.js for the note on
// why sync() is used here instead of versioned migrations).
async function connectDB() {
  try {
    require("../models");
    await sequelize.authenticate();
    console.log("[db] connected -> PostgreSQL");
    await sequelize.sync();
    console.log("[db] models synced");
  } catch (err) {
    console.error("[db] connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;

