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

        const patchesPath = path.join(__dirname, 'patches.sql');
        if (fs.existsSync(patchesPath)) {
            const patchStatements = fs
                .readFileSync(patchesPath, 'utf8')
                .split(';')
                .map((s) => s.trim())
                .filter((s) => s.length > 0 && !s.startsWith('--'));

            for (const statement of patchStatements) {
                try {
                    await connection.query(statement);
                } catch (error) {
                    if (error.code === 'ER_DUP_FIELDNAME') continue;
                    throw error;
                }
            }
        }

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
