document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('formCadastro');

    if (formCadastro) {
        formCadastro.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const btn = this.querySelector('button[type="submit"]');
            const textoOriginal = btn.textContent;
            btn.textContent = "CADASTRANDO...";
            btn.disabled = true;

            const dados = {
                nome: document.getElementById('nomeCadastro').value,
                email: document.getElementById('emailCadastro').value,
                senha: document.getElementById('senhaCadastro').value
            };

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                const result = await response.json();

                if (response.ok) {
                    alert("Cadastro realizado com sucesso! Bem-vindo(a) ao Garden Guardian.");
                    window.location.href = '/dashboard.html';
                } else {
                    alert(result.error || "Erro ao realizar cadastro.");
                }
            } catch (error) {
                console.error("Erro:", error);
                alert("Erro ao conectar com o servidor.");
            } finally {
                btn.textContent = textoOriginal;
                btn.disabled = false;
            }
        });
    }

    const formLogin = document.getElementById('formLogin');

    if (formLogin) {
        formLogin.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const btn = this.querySelector('button[type="submit"]');
            const msgErro = document.getElementById('msgErroLogin');
            const textoOriginal = btn.textContent;
            
            btn.textContent = "ENTRANDO...";
            btn.disabled = true;
            msgErro.style.display = 'none';

            const dados = {
                email: document.getElementById('email').value,
                senha: document.getElementById('senha').value
            };

            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                if (response.ok) {
                    window.location.href = '/dashboard.html';
                } else {
                    msgErro.textContent = "E-mail ou senha incorretos.";
                    msgErro.style.display = 'block';
                }
            } catch (error) {
                console.error("Erro:", error);
                msgErro.textContent = "Erro ao conectar com o servidor.";
                msgErro.style.display = 'block';
            } finally {
                btn.textContent = textoOriginal;
                btn.disabled = false;
            }
        });
    }
});