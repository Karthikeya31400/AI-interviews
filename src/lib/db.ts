import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS interviews (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    position TEXT NOT NULL,
    status TEXT NOT NULL,
    score INTEGER,
    feedback TEXT,
    questions TEXT,
    evaluation TEXT,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS resume_analyses (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    fileName TEXT,
    analysis TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    displayName TEXT,
    photoURL TEXT,
    role TEXT DEFAULT 'USER',
    createdAt INTEGER NOT NULL
  );
`);

export default db;
