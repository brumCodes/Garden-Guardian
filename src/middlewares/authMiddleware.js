const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    // Busca o token nos cookies
    const token = req.cookies?.token;

    if (!token) {
        return res.redirect('/login.html'); // Sem crachá? Volta pro login!
    }

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decodificado; // Guarda os dados do dono do crachá
        next(); // Pode passar!
    } catch (err) {
        res.clearCookie('token');
        return res.redirect('/login.html');
    }
}

module.exports = verificarToken;