const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("database.db");

db.serialize(() => {

    db.run(`
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT,
        publicKey TEXT,
        privateKey TEXT
    )
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS signatures(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        texto TEXT,
        hash TEXT,
        assinatura TEXT,
        data TEXT
    )
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS logs(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assinaturaId INTEGER,
        resultado TEXT,
        data TEXT
    )
    `);

});

module.exports = db;