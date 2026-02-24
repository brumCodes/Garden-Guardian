const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
require('dotenv').config();

async function createConnection() {
    return open({
        filename: process.env.DATABASE_URL || './src/database/garden.db',
        driver: sqlite3.Database
    });
}

module.exports = createConnection;