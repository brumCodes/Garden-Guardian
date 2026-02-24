const createConnection = require('./connection');

async function initDb() {
    const db = await createConnection();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS plants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            nome TEXT NOT NULL,
            especie TEXT NOT NULL,
            nivel_cuidado INTEGER DEFAULT 0,
            foto_url TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plant_id INTEGER,
            tipo TEXT NOT NULL,
            data_planejada DATE NOT NULL,
            data_realizada DATE,
            status TEXT DEFAULT 'pendente',
            FOREIGN KEY (plant_id) REFERENCES plants (id)
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS pests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plant_id INTEGER,
            tipo_praga TEXT NOT NULL,
            data_detectada DATE NOT NULL,
            status TEXT DEFAULT 'ativa',
            FOREIGN KEY (plant_id) REFERENCES plants (id)
        )
    `);

    console.log("✅ Tabela de pragas criada com sucesso!");

    console.log("✅ Tabelas profissionais criadas com sucesso!");
}

require('dotenv').config();
const express = require('express');
const path = require('path');

async function startApp() {
    try {
        await initDb();

        const app = express();
        const PORT = process.env.PORT || 3000;

        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        app.use(express.static(path.join(__dirname, 'src/public')));

        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'src/public', 'index.html'));
        });

        app.listen(PORT, () => {
            console.log(`🚀 Garden Guardian rodando em http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("❌ Erro ao iniciar a aplicação:", err);
    }
}

startApp();