require('dotenv').config(); // Ensure environment variables are loaded first
const app = require('./app');
const { testDbConnection } = require('./config/database'); // Import the test function

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test the database connection before starting the server
    await testDbConnection();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1); // Exit if DB connection fails
  }
};

startServer();