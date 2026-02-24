require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'src/public')));

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/public/assets/logo.png'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/public', 'index.html'));
});
const authRoutes = require('./src/routes/authRoutes');

app.use('/auth', authRoutes);

function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Acesso negado. Faça login." });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: "Token inválido." });
    }
}

const multer = require('multer');
const createConnection = require('./src/database/connection');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'src/public/uploads'));
    },
    filename: (req, file, cb) => {
        const extensao = path.extname(file.originalname);
        cb(null, Date.now() + extensao);
    }
});
const upload = multer({ storage });

app.post('/api/plantas', authenticateToken, upload.single('fotoPlanta'), async (req, res) => {
    try {
        const db = await createConnection();
        const { nome, especie } = req.body;
        const foto_url = req.file ? `/uploads/${req.file.filename}` : null;
        
        const user_id = req.user.id;

        await db.run(
            `INSERT INTO plants (user_id, nome, especie, foto_url) VALUES (?, ?, ?, ?)`,
            [user_id, nome, especie, foto_url]
        );

        res.status(201).json({ message: "Planta salva com sucesso!" });
    } catch (error) {
        console.error("Erro ao salvar a planta:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});
app.get('/api/plantas', authenticateToken, async (req, res) => {
    try {
        const db = await createConnection();
        const user_id = req.user.id;
        
        const plantas = await db.all('SELECT * FROM plants WHERE user_id = ? ORDER BY id DESC', [user_id]);
        
        res.json(plantas);
    } catch (error) {
        console.error("Erro ao buscar plantas:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});
app.delete('/api/plantas/:id', authenticateToken, async (req, res) => {
    try {
        const db = await createConnection();
        const plantaId = req.params.id;
        const user_id = req.user.id;

        await db.run('DELETE FROM activities WHERE plant_id = ?', [plantaId]);
        await db.run('DELETE FROM pests WHERE plant_id = ?', [plantaId]);

        const result = await db.run('DELETE FROM plants WHERE id = ? AND user_id = ?', [plantaId, user_id]);

        if (result.changes > 0) {
            res.json({ message: "Planta excluída com sucesso!" });
        } else {
            res.status(404).json({ error: "Planta não encontrada." });
        }
    } catch (error) {
        console.error("Erro ao excluir planta:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});
app.put('/api/plantas/:id', authenticateToken, upload.single('fotoPlanta'), async (req, res) => {
    try {
        const db = await createConnection();
        const plantaId = req.params.id;
        const user_id = req.user.id;
        const { nome, especie } = req.body;
        
        if (req.file) {
            const foto_url = `/uploads/${req.file.filename}`;
            await db.run(
                'UPDATE plants SET nome = ?, especie = ?, foto_url = ? WHERE id = ? AND user_id = ?',
                [nome, especie, foto_url, plantaId, user_id]
            );
        } else {
            await db.run(
                'UPDATE plants SET nome = ?, especie = ? WHERE id = ? AND user_id = ?',
                [nome, especie, plantaId, user_id]
            );
        }
        res.json({ message: "Planta atualizada com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar planta:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});
app.put('/api/plantas/:id/recursos', authenticateToken, async (req, res) => {
    try {
        const db = await createConnection();
        const { id } = req.params;
        const user_id = req.user.id;
        const { def_agua_qtd, def_agua_und, def_adubo_qtd, def_adubo_und, def_subs_qtd, def_subs_und, def_pest_qtd, def_pest_und } = req.body;

        await db.run(`
            UPDATE plants 
            SET def_agua_qtd=?, def_agua_und=?, def_adubo_qtd=?, def_adubo_und=?, def_subs_qtd=?, def_subs_und=?, def_pest_qtd=?, def_pest_und=?
            WHERE id = ? AND user_id = ?
        `, [def_agua_qtd, def_agua_und, def_adubo_qtd, def_adubo_und, def_subs_qtd, def_subs_und, def_pest_qtd, def_pest_und, id, user_id]);

        res.json({ message: "Recursos atualizados!" });
    } catch (error) {
        console.error("Erro ao atualizar recursos:", error);
        res.status(500).json({ error: "Erro no servidor" });
    }
});
app.post('/api/atividades', authenticateToken, async (req, res) => {
    try {
        const db = await createConnection();
        const { plant_id, tipo, data_atividade, acao, quantidade, unidade } = req.body;
        
        if (acao === 'registrar') {
            const existente = await db.get(
                `SELECT id FROM activities WHERE plant_id = ? AND tipo = ? AND data_planejada = ? AND status = 'pendente'`,
                [plant_id, tipo, data_atividade]
            );

            if (existente) {
                await db.run(
                    `UPDATE activities SET status = 'concluída', data_realizada = ?, quantidade = ?, unidade = ? WHERE id = ?`,
                    [data_atividade, quantidade, unidade, existente.id]
                );
            } else {
                await db.run(
                    `INSERT INTO activities (plant_id, tipo, data_planejada, data_realizada, status, quantidade, unidade) VALUES (?, ?, ?, ?, 'concluída', ?, ?)`,
                    [plant_id, tipo, data_atividade, data_atividade, quantidade, unidade]
                );
            }
        } else {
            await db.run(
                `INSERT INTO activities (plant_id, tipo, data_planejada, status, quantidade, unidade) VALUES (?, ?, ?, 'pendente', ?, ?)`,
                [plant_id, tipo, data_atividade, quantidade, unidade]
            );
        }

        res.status(201).json({ message: "Atividade salva com sucesso!" });
    } catch (error) {
        console.error("Erro ao salvar atividade:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});
app.get('/api/atividades', authenticateToken, async (req, res) => {
    try {
        const db = await createConnection();
        const user_id = req.user.id;
        const atividades = await db.all(`
            SELECT activities.*, plants.nome as planta_nome 
            FROM activities 
            INNER JOIN plants ON activities.plant_id = plants.id
            WHERE plants.user_id = ?
        `, [user_id]);
        res.json(atividades);
    } catch (error) {
        console.error("Erro ao buscar atividades:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});

app.post('/api/pests', authenticateToken, async (req, res) => {
    try {
        const db = await createConnection();
        const { plant_id, tipo_praga, data_detectada } = req.body;
        
        await db.run(
            `INSERT INTO pests (plant_id, tipo_praga, data_detectada) VALUES (?, ?, ?)`,
            [plant_id, tipo_praga, data_detectada]
        );
        
        res.json({ message: "Incidência de praga registrada!" });
    } catch (err) {
        console.error("Erro no Banco (POST /api/pests):", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/pests/stats', authenticateToken, async (req, res) => {
    try {
        const db = await createConnection();
        const user_id = req.user.id;
        const stats = await db.all(`
            SELECT strftime('%m', data_detectada) as mes, tipo_praga, COUNT(*) as total 
            FROM pests 
            INNER JOIN plants ON pests.plant_id = plants.id
            WHERE plants.user_id = ?
            GROUP BY mes, tipo_praga
            ORDER BY mes ASC
        `, [user_id]);
        res.json(stats);
    } catch (err) {
        console.error("Erro no Banco (GET /api/pests/stats):", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/user', authenticateToken, async (req, res) => {
    try {
        const db = await createConnection();
        const user = await db.get('SELECT id, nome, email FROM users WHERE id = ?', [req.user.id]);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar perfil" });
    }
});

app.put('/api/user', authenticateToken, async (req, res) => {
    try {
        const db = await createConnection();
        const { nome, email } = req.body;
        await db.run('UPDATE users SET nome = ?, email = ? WHERE id = ?', [nome, email, req.user.id]);
        res.json({ message: "Perfil atualizado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const db = await createConnection();
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ error: "Por favor, preencha nome, email e senha." });
        }

        const usuarioExistente = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (usuarioExistente) {
            return res.status(400).json({ error: "Este email já está cadastrado." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashSenha = await bcrypt.hash(senha, salt);

        await db.run(
            `INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)`,
            [nome, email, hashSenha]
        );

        const novoUsuario = await db.get('SELECT id, nome FROM users WHERE email = ?', [email]);

        const token = jwt.sign({ id: novoUsuario.id, nome: novoUsuario.nome }, process.env.JWT_SECRET);

        res.cookie('token', token, { httpOnly: true });

        res.status(201).json({ message: "Usuário cadastrado e logado com sucesso!" });
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});

async function iniciarServidor() {
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
        CREATE TABLE IF NOT EXISTS pests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plant_id INTEGER,
            tipo_praga TEXT NOT NULL,
            data_detectada DATE NOT NULL,
            status TEXT DEFAULT 'ativa',
            FOREIGN KEY (plant_id) REFERENCES plants (id)
        )
    `);
    
    try {
        await db.exec("ALTER TABLE activities ADD COLUMN quantidade REAL");
        await db.exec("ALTER TABLE activities ADD COLUMN unidade TEXT");
        console.log("✅ Colunas de quantidade adicionadas com sucesso!");
    } catch (e) {
    }

    try {
        const colunas = [
            'def_agua_qtd REAL', 'def_agua_und TEXT',
            'def_adubo_qtd REAL', 'def_adubo_und TEXT',
            'def_subs_qtd REAL', 'def_subs_und TEXT',
            'def_pest_qtd REAL', 'def_pest_und TEXT'
        ];
        for (const col of colunas) {
            await db.exec(`ALTER TABLE plants ADD COLUMN ${col}`).catch(() => {});
        }
        console.log("✅ Colunas de recursos padrão criadas!");
    } catch (e) {}

    app.listen(PORT, () => {
        console.log(`🚀 Garden Guardian rodando em http://localhost:${PORT}`);
    });
}

iniciarServidor();