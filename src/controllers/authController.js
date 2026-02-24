const bcrypt = require('bcryptjs');
const createConnection = require('../database/connection');
const jwt = require('jsonwebtoken');

const authController = {
    // Lógica de Cadastro
    async register(req, res) {
        const { nome, email, senha } = req.body;
        const db = await createConnection();

        try {
            const userExists = await db.get('SELECT * FROM users WHERE email = ?', [email]);
            if (userExists) return res.status(400).send('E-mail já cadastrado.');

            const salt = await bcrypt.genSalt(10);
            const hashSenha = await bcrypt.hash(senha, salt);

            await db.run(
                'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)',
                [nome, email, hashSenha]
            );

            console.log(`✅ Usuário ${nome} cadastrado!`);
            res.redirect('/login.html'); 
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro no servidor.');
        }
    },

    async login(req, res) {
        const { email, senha } = req.body;
        const db = await createConnection();

        try {
            // 1. Busca o usuário
            const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
            
            if (!user) {
                return res.status(401).send('E-mail ou senha incorretos.');
            }

            // 2. Compara a senha
            let senhaValida = await bcrypt.compare(senha, user.senha);
            
            // --- CORREÇÃO: Suporte para contas antigas ---
            if (!senhaValida) {
                // Se a criptografia falhar, verifica se é uma senha antiga (texto puro)
                if (user.senha === senha) {
                    senhaValida = true;
                    // Aproveita e atualiza para o formato seguro (hash) no banco
                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash(senha, salt);
                    await db.run('UPDATE users SET senha = ? WHERE id = ?', [hash, user.id]);
                }
            }

            if (!senhaValida) {
                return res.status(401).send('E-mail ou senha incorretos.');
            }

            // 3. GERAÇÃO DO TOKEN (Dentro do try e após validação)
            const token = jwt.sign(
                { id: user.id, nome: user.nome }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1d' }
            );

            // 4. ENVIO DO COOKIE E REDIRECIONAMENTO
            res.cookie('token', token, { httpOnly: true });
            console.log(`🚀 Usuário ${user.nome} logado com sucesso!`);
            
            return res.redirect('/dashboard.html');
            
        } catch (err) {
            console.error(err);
            return res.status(500).send('Erro no servidor.');
        }
    }
};

module.exports = authController;