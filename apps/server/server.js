'use strict';

require('dotenv').config();

const app = require('./src/app');
const { connectDB } = require('./src/database/connection');

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT} [${ENV}]`);
  });
};

startServer();