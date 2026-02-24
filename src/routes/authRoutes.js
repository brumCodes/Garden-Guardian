const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define a rota de postagem do formulário de cadastro
router.post('/cadastro', authController.register);
router.post('/login', authController.login);

module.exports = router;
