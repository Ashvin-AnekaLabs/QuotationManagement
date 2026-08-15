require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/database');
const { initDatabase } = require('./src/database/init');

const PORT = process.env.PORT || 5000;

// Connect to Database, auto-initialize tables, and start HTTP server
const startServer = async () => {
  try {
    await connectDB();
    await initDatabase();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running smoothly!`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
