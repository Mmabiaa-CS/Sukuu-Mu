'use strict';

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dbConfig = require('../config/db.config');

const SALT_ROUNDS = 12;

async function seed() {
    const connection = await mysql.createConnection({
        ...dbConfig,
        multipleStatements: true
    });

    try {
        console.log('🌱 Seeding database...');

        // 1. Ensure roles exist
        await connection.query(`
      INSERT IGNORE INTO roles (name) VALUES ('admin'), ('teacher'), ('student');
    `);

        // 2. Get admin role ID
        const [roles] = await connection.query('SELECT id FROM roles WHERE name = ?', ['admin']);
        const adminRoleId = roles[0].id;

        // 3. Get admin credentials from .env
        const username = process.env.ADMIN_USERNAME;
        const password = process.env.ADMIN_PASSWORD;
        const firstName = process.env.ADMIN_FIRST_NAME;
        const lastName = process.env.ADMIN_LAST_NAME;
        const fullName = `${firstName} ${lastName}`;

        // 4. Check if admin user already exists
        const [users] = await connection.query('SELECT id FROM users WHERE email = ?', [username]);

        if (users.length === 0) {
            console.log(`👤 Creating admin user: ${username}`);
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            await connection.query(
                'INSERT INTO users (name, email, password, role_id, is_active) VALUES (?, ?, ?, ?, 1)',
                [fullName, username, hashedPassword, adminRoleId]
            );
            console.log('✅ Admin user created successfully.');
        } else {
            console.log('ℹ️ Admin user already exists. Updating password and name...');
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            await connection.query(
                'UPDATE users SET name = ?, password = ?, role_id = ? WHERE email = ?',
                [fullName, hashedPassword, adminRoleId, username]
            );
            console.log('✅ Admin user updated successfully.');
        }

        console.log('✨ Seeding completed.');
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

seed();
