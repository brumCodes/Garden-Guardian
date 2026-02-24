const diasContainer = document.getElementById('diasCalendario');
const mesAnoTexto = document.getElementById('mesAno');

let dataAtual = new Date(); 

const dicionarioEmojis = {
    'rega': '💧',
    'adubo': '🌱',
    'poda': '✂️',
    'transplante': '🪴',
    'pesticida': '🛡️',
    'colheita': '🧺'
};

function mudarMes(direcao) {
    dataAtual.setMonth(dataAtual.getMonth() + direcao);
    renderizarCalendario();
}

async function renderizarCalendario() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth(); 
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    let atividades = [];
    try {
        const response = await fetch('/api/atividades');
        atividades = await response.json();
    } catch (error) {
        console.error("Erro ao carregar atividades:", error);
    }

    const atividadesPorDia = {};
    const mesString = String(mes + 1).padStart(2, '0'); 
    const anoString = String(ano);

    atividades.forEach(ativ => {
        if (!ativ.data_planejada) return;
        const [anoAtiv, mesAtiv, diaAtiv] = ativ.data_planejada.split('-');
        
        if (anoAtiv === anoString && mesAtiv === mesString) {
            const diaNum = parseInt(diaAtiv);
            if (!atividadesPorDia[diaNum]) atividadesPorDia[diaNum] = [];
            atividadesPorDia[diaNum].push(ativ);
        }
    });

    diasContainer.innerHTML = ''; 
    mesAnoTexto.innerHTML = `
        <span onclick="mudarMes(-1)" style="cursor: pointer; user-select: none; font-size: 1.5rem; color: var(--orange-main);">◀</span>
        <span style="cursor: default; margin: 0 15px;">${nomesMeses[mes]} ${ano}</span>
        <span onclick="mudarMes(1)" style="cursor: pointer; user-select: none; font-size: 1.5rem; color: var(--orange-main);">▶</span>
    `;

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    
    for (let i = 0; i < primeiroDia; i++) {
        const vazio = document.createElement('div');
        vazio.className = 'calendar-day';
        vazio.style.backgroundColor = '#FAFAFA';
        vazio.style.cursor = 'default';
        diasContainer.appendChild(vazio);
    }
    
    for (let i = 1; i <= ultimoDia; i++) {
        const diaBox = document.createElement('div');
        diaBox.className = 'calendar-day';
        
        const hoje = new Date();
        if (i === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()) {
            diaBox.style.backgroundColor = 'var(--orange-light)';
            diaBox.style.fontWeight = 'bold';
        }
        
        const ativsDoDia = atividadesPorDia[i] || [];
        let htmlEmojis = '';

        const limite = 3;
        for (let j = 0; j < Math.min(ativsDoDia.length, limite); j++) {
            htmlEmojis += `<span>${dicionarioEmojis[ativsDoDia[j].tipo] || '✅'}</span>`;
        }
        if (ativsDoDia.length > limite) {
            htmlEmojis += `<span style="font-size: 0.8rem; font-weight: bold; color: #888; margin-left: 2px;">(...)</span>`;
        }
        
        diaBox.innerHTML = `${i} <div class="day-content" style="display: flex; gap: 5px; margin-top: 8px;">${htmlEmojis}</div>`;
        
        diaBox.onclick = () => abrirModalDiaDetalhes(i, nomesMeses[mes], ativsDoDia);

        diasContainer.appendChild(diaBox);
    }

    const totalCelulas = primeiroDia + ultimoDia;
    const diasRestantes = totalCelulas % 7 === 0 ? 0 : 7 - (totalCelulas % 7);

    for (let i = 0; i < diasRestantes; i++) {
        const vazio = document.createElement('div');
        vazio.className = 'calendar-day';
        vazio.style.backgroundColor = '#FAFAFA';
        vazio.style.cursor = 'default';
        diasContainer.appendChild(vazio);
    }
}

function abrirModalDiaDetalhes(dia, nomeMes, atividadesDoDia) {
    document.getElementById('tituloModalDia').textContent = `Dia ${dia} de ${nomeMes}`;
    const lista = document.getElementById('listaAtividadesDia');
    lista.innerHTML = '';

    if (atividadesDoDia.length === 0) {
        lista.innerHTML = '<p style="text-align:center; color: var(--gray-inactive); margin-top: 20px;">Nenhuma atividade para este dia.</p>';
    } else {
        atividadesDoDia.forEach(ativ => {
            const emoji = dicionarioEmojis[ativ.tipo] || '✅';
            const nomeCuidado = ativ.tipo.charAt(0).toUpperCase() + ativ.tipo.slice(1); 
            
            const isConcluida = ativ.status === 'concluída';
            const estiloTexto = isConcluida ? 'text-decoration: line-through; color: var(--gray-inactive);' : 'color: var(--text-dark); font-weight: 500;';

            lista.innerHTML += `
                <div style="display: flex; align-items: center; gap: 15px; background: #FAFAFA; padding: 12px 20px; border-radius: 12px; border: 1px solid #EBDDC8;">
                    <span style="font-size: 1.5rem;">${emoji}</span>
                    <span style="font-size: 1.1rem; ${estiloTexto}">${nomeCuidado} - <strong>${ativ.planta_nome}</strong></span>
                </div>
            `;
        });
    }

    document.getElementById('modalDiaDetalhes').style.display = 'flex';
}

async function carregarPlantasSelect() {
    try {
        const response = await fetch('/api/plantas');
        const plantas = await response.json();
        const select = document.getElementById('plant_id');
        select.innerHTML = ''; 
        
        if (plantas.length === 0) {
            select.innerHTML = '<option value="">Nenhuma planta cadastrada</option>';
            return;
        }

        plantas.forEach(planta => {
            const option = document.createElement('option');
            option.value = planta.id; 
            option.textContent = `${planta.nome} (${planta.especie})`; 
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar plantas:", error);
    }
}

function abrirModalAtividade(acao) {
    document.getElementById('formAtividade').reset();
    document.getElementById('acaoAtividade').value = acao;
    
    const titulo = document.getElementById('tituloModalAtividade');
    const labelData = document.getElementById('labelData');
    const btnSalvar = document.getElementById('btnSalvarAtividade');

    if (acao === 'agendar') {
        titulo.textContent = "Agendar Cuidado";
        labelData.textContent = "Para quando?";
        btnSalvar.textContent = "AGENDAR";
    } else {
        titulo.textContent = "Registrar Cuidado";
        labelData.textContent = "Quando foi feito?";
        btnSalvar.textContent = "REGISTRAR";
    }

    document.getElementById('modalAtividade').style.display = 'flex';
    carregarPlantasSelect(); 
}

function fecharModalAtividade() {
    document.getElementById('modalAtividade').style.display = 'none';
}

document.getElementById('formAtividade').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btnSalvar = document.getElementById('btnSalvarAtividade');
    const textoOriginal = btnSalvar.textContent;
    btnSalvar.textContent = "SALVANDO...";

    const inputQtd = document.getElementById('quantidade');
    const inputUnd = document.getElementById('unidade');

    const dados = {
        acao: document.getElementById('acaoAtividade').value,
        plant_id: document.getElementById('plant_id').value,
        tipo: document.getElementById('tipo').value,
        data_atividade: document.getElementById('data_atividade').value,
        quantidade: inputQtd ? inputQtd.value : null,
        unidade: inputUnd ? inputUnd.value : null
    };

    try {
        const response = await fetch('/api/atividades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            fecharModalAtividade();
            btnSalvar.textContent = textoOriginal;
            renderizarCalendario();
        } else {
            alert("Erro ao salvar atividade.");
            btnSalvar.textContent = textoOriginal;
        }
    } catch (error) {
        console.error("Erro:", error);
        btnSalvar.textContent = textoOriginal;
    }
});

window.addEventListener('DOMContentLoaded', renderizarCalendario);

async function abrirModalPraga() {
    const modal = document.getElementById('modalPraga');
    const select = document.getElementById('selectPlantaPraga');
    
    const res = await fetch('/api/plantas');
    const plantas = await res.json();

    select.innerHTML = '<option value="">Selecione...</option>';
    plantas.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.nome;
        select.appendChild(option);
    });

    document.getElementById('dataPraga').valueAsDate = new Date();
    
    modal.style.display = 'flex';
}

function fecharModalPraga() {
    document.getElementById('modalPraga').style.display = 'none';
}

document.getElementById('formPraga').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const dados = {
        plant_id: document.getElementById('selectPlantaPraga').value,
        tipo_praga: document.getElementById('selectTipoPraga').value,
        data_detectada: document.getElementById('dataPraga').value
    };

    try {
        const response = await fetch('/api/pests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            fecharModalPraga();
        } else {
            alert("Erro ao salvar registro de praga.");
        }
    } catch (error) {
        console.error("Erro:", error);
    }
});

async function abrirModalPerfil() {
    let modal = document.getElementById('modalPerfil');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalPerfil';
        modal.className = 'modal-overlay'; 
        
        modal.innerHTML = `
            <div class="modal-box" style="min-height: auto; padding-bottom: 40px;">
                <div class="clip-metal"></div>
                <button class="close-modal" onclick="document.getElementById('modalPerfil').style.display='none'">&times;</button>
                <h2 class="form-title">Meu Perfil</h2>
                <form id="formPerfilDinamico">
                    <div class="input-group">
                        <label>Nome</label>
                        <input type="text" id="perfilNome" required>
                    </div>
                    <div class="input-group">
                        <label>E-mail</label>
                        <input type="email" id="perfilEmail" required>
                    </div>
                    <div class="form-footer" style="flex-direction: column; gap: 15px;">
                        <button type="submit" class="btn-solid-modal">SALVAR ALTERAÇÕES</button>
                        <button type="button" onclick="fazerLogout()" style="background: transparent; border: 2px solid #e74c3c; color: #e74c3c; padding: 12px; border-radius: 35px; cursor: pointer; font-weight: bold; width: 100%;">SAIR DA CONTA</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => { if(e.target === modal) modal.style.display = 'none'; });

        document.getElementById('formPerfilDinamico').addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            btn.textContent = "SALVANDO...";
            await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: document.getElementById('perfilNome').value,
                    email: document.getElementById('perfilEmail').value
                })
            });
            window.location.reload(); 
        });
    }
    
    try {
        const res = await fetch('/api/user');
        const user = await res.json();
        
        document.getElementById('perfilNome').value = user.nome;
        document.getElementById('perfilEmail').value = user.email;
        
        modal.style.display = 'flex';
    } catch (error) {
        console.error("Erro ao carregar perfil");
    }
}

function fazerLogout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const btnUser = document.querySelector('.header-icon-right');
    if (btnUser) {
        btnUser.onclick = abrirModalPerfil; 
        btnUser.style.cursor = 'pointer';
    }

    const formPerfil = document.getElementById('formPerfil');
    if (formPerfil) {
        formPerfil.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            btn.textContent = "SALVANDO...";

            await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: document.getElementById('perfilNome').value,
                    email: document.getElementById('perfilEmail').value
                })
            });
            window.location.reload(); 
        });
    }
});
