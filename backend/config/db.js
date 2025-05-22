const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Dehemi',
    database: process.env.DB_NAME || 'inventory_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database Connection Error:', err);
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Access denied. Please check your MySQL credentials.');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('Connection refused. Please check if MySQL server is running.');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('Database does not exist. Creating database...');
            createDatabase();
        }
    } else {
        console.log('Successfully connected to MySQL database');
        connection.release();
    }
});

// Function to create database if it doesn't exist
async function createDatabase() {
    try {
        const initPool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Dehemi'
        });

        const promiseInitPool = initPool.promise();
        
        await promiseInitPool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'inventory_system'}`);
        console.log('Database created successfully');
        
        // Read and execute the SQL file
        const fs = require('fs');
        const path = require('path');
        const sqlPath = path.join(__dirname, 'database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        await promisePool.query(sql);
        console.log('Database schema initialized successfully');
    } catch (error) {
        console.error('Error creating database:', error);
        process.exit(1);
    }
}

const promisePool = pool.promise();

module.exports = promisePool;