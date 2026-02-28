const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');

const dbPath = process.env.DATABASE_URL.replace('file:', '');
const sqlite = new Database(dbPath);
const adapter = new PrismaBetterSqlite3(sqlite);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
