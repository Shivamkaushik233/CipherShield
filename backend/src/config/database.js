const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions:
    process.env.DB_SSL === "true"
      ? { ssl: { require: true, rejectUnauthorized: false } } // needed for most managed Postgres (e.g. Render)
      : {},
});

module.exports = sequelize;
