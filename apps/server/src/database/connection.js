'use strict';

const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

const pool = mysql.createPool(dbConfig);

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(` MySQL connected — host: ${dbConfig.host}, db: ${dbConfig.database}`);
    connection.release();
  } catch (error) {
    console.error(' MySQL connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };