require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const { User } = require("../models");

const DEMO_USERS = [
  { name: "Aditi Sharma", email: "customer@ciphershield.dev", password: "password123", role: "customer" },
  { name: "Rahul Mehta", email: "analyst@ciphershield.dev", password: "password123", role: "analyst" },
  { name: "Security Admin", email: "admin@ciphershield.dev", password: "password123", role: "admin" },
  { name: "Priya Auditor", email: "auditor@ciphershield.dev", password: "password123", role: "auditor" },
];

async function seed() {
  await connectDB();
  for (const u of DEMO_USERS) {
    const exists = await User.findOne({ where: { email: u.email } });
    if (exists) {
      console.log(`[seed] already exists: ${u.email}`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 10);
    await User.create({ name: u.name, email: u.email, passwordHash, role: u.role, avgAmount: 2500 });
    console.log(`[seed] created ${u.role}: ${u.email} / ${u.password}`);
  }
  console.log("[seed] done");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
