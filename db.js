const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, 'events.db'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS event_packages (
    id TEXT PRIMARY KEY,
    tid TEXT NOT NULL,
    sent_at TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    package_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    type TEXT NOT NULL,
    data TEXT NOT NULL,
    FOREIGN KEY(package_id) REFERENCES event_packages(id)
  )`);
});

module.exports = db; 