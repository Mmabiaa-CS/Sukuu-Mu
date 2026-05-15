'use strict';

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config');

async function runMigrations() {
    const connection = await mysql.createConnection({
        ...dbConfig,
        multipleStatements: true
    });

    try {
        console.log('🚀 Running migrations...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        await connection.query(sql);

        console.log('✅ Migrations completed successfully.');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    runMigrations();
}

module.exports = runMigrations;
