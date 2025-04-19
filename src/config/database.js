const { Sequelize } = require('sequelize');
require('dotenv').config(); // Load environment variables from .env file

// Ensure required environment variables are set
const requiredEnvVars = ['DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD', 'DB_HOST', 'DB_DIALECT'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT, // e.g., 'mysql'
    port: process.env.DB_PORT || 3306, // Default MySQL port
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log SQL queries in development
    pool: { // Optional: Configure connection pooling
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Define naming conventions if needed (e.g., underscored)
    define: {
      underscored: true, // Use snake_case for automatically generated attributes like foreign keys
      timestamps: true, // Enable timestamps (createdAt, updatedAt) by default
      createdAt: 'created_at', // Match schema column names
      updatedAt: 'updated_at', // Match schema column names
    }
  }
);

// Test the connection
const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    // Exit the process if the database connection fails on startup
    process.exit(1);
  }
};

module.exports = { sequelize, testDbConnection };
