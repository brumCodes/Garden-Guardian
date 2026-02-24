function abrirModal(idModal) {
    document.getElementById(idModal).style.display = 'flex';
}

function fecharModal(idModal) {
    document.getElementById(idModal).style.display = 'none';
}

function abrirModalNovaPlanta() {
    document.getElementById('formPlanta').reset(); 
    document.getElementById('plantaId').value = ""; 
    document.getElementById('tituloModal').textContent = "Nova Planta";
    document.querySelector('.btn-solid-modal').textContent = "SALVAR PLANTA";
    document.getElementById('file-name').textContent = "Nenhuma foto escolhida";
    abrirModal('modalPlanta');
}

document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'fotoPlanta') {
        const fileName = e.target.files[0] ? e.target.files[0].name : "Nenhuma foto escolhida";
        document.getElementById('file-name').textContent = fileName;
    }
});

window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
    }
}

document.querySelector('.garden-form').addEventListener('submit', async function(e) {
    e.preventDefault(); 

    const formData = new FormData(this);
    const botaoSalvar = this.querySelector('.btn-solid-modal');
    const idPlanta = document.getElementById('plantaId').value; 
    
    botaoSalvar.textContent = "SALVANDO..."; 

    const url = idPlanta ? `/api/plantas/${idPlanta}` : '/api/plantas';
    const metodo = idPlanta ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: metodo,
            body: formData 
        });

        if (response.ok) {
            this.reset();
            fecharModal('modalPlanta');
            window.location.reload(); 
        } else {
            console.error("Erro ao salvar a planta.");
            botaoSalvar.textContent = idPlanta ? "ATUALIZAR PLANTA" : "SALVAR PLANTA";
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        botaoSalvar.textContent = idPlanta ? "ATUALIZAR PLANTA" : "SALVAR PLANTA";
    }
});

async function carregarPlantas() {
    try {
        const response = await fetch('/api/plantas');
        const plantas = await response.json();
        
        const grid = document.querySelector('.plants-grid');
        const addCard = document.querySelector('.add-card'); 
        
        grid.innerHTML = ''; 
        grid.appendChild(addCard); 

        plantas.forEach(planta => {
            const foto = planta.foto_url ? planta.foto_url : 'https://via.placeholder.com/200x150?text=Sem+Foto';
            
            const card = document.createElement('div');
            card.className = 'card';
            
            card.innerHTML = `
                <div style="position: relative; width: 100%; height: 150px; overflow: hidden; border-bottom: 1px solid #EBDDC8;">
                    <img src="${foto}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="action-overlay">
                        <button class="btn-edit-card" onclick="prepararEdicao(${planta.id}, \`${planta.nome}\`, \`${planta.especie}\`)">✏️</button>
                        <button class="btn-delete-card" onclick="excluirPlanta(${planta.id})">X</button>
                        <button class="btn-settings-card" onclick='prepararRecursos(${JSON.stringify(planta).replace(/'/g, "&#39;")})'>⚙️</button>
                    </div>
                </div>
                <div style="padding: 15px; text-align: center;">
                    <strong style="display: block; color: var(--brown-board); margin-bottom: 5px; font-size: 1.1rem;">${planta.nome}</strong>
                    <span style="font-size: 0.75rem; color: var(--gray-inactive); text-transform: uppercase; font-weight: 600;">${planta.especie}</span>
                </div>
            `;
            
            card.onclick = (e) => {
                if(!e.target.closest('.action-overlay')) {
                    abrirDetalhesPlanta(planta);
                }
            };

            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar plantas:", error);
    }
}

async function excluirPlanta(id) {
    try {
        const response = await fetch(`/api/plantas/${id}`, { method: 'DELETE' });
        if (response.ok) { carregarPlantas(); } 
        else { console.error("Erro ao tentar excluir a planta."); }
    } catch (error) { console.error("Erro ao excluir:", error); }
}

function toggleModoExcluir() {
    const grid = document.querySelector('.plants-grid');
    grid.classList.toggle('modo-excluir'); 
    grid.classList.remove('modo-editar'); 
    document.getElementById('btn-toggle-excluir').classList.toggle('active'); 
    document.getElementById('btn-toggle-editar').classList.remove('active');
    document.getElementById('btn-toggle-recursos').classList.remove('active');
}

function toggleModoRecursos() {
    const grid = document.querySelector('.plants-grid');
    grid.classList.toggle('modo-recursos'); 
    grid.classList.remove('modo-excluir'); 
    grid.classList.remove('modo-editar');
    document.getElementById('btn-toggle-recursos').classList.toggle('active');
    document.getElementById('btn-toggle-excluir').classList.remove('active');
    document.getElementById('btn-toggle-editar').classList.remove('active');
}

function toggleModoEditar() {
    const grid = document.querySelector('.plants-grid');
    grid.classList.toggle('modo-editar'); 
    grid.classList.remove('modo-excluir'); 
    grid.classList.remove('modo-recursos');
    document.getElementById('btn-toggle-editar').classList.toggle('active'); 
    document.getElementById('btn-toggle-excluir').classList.remove('active');
    document.getElementById('btn-toggle-recursos').classList.remove('active');
}

function prepararEdicao(id, nome, especie) {
    document.getElementById('plantaId').value = id;
    document.querySelector('input[name="nome"]').value = nome;
    document.querySelector('select[name="especie"]').value = especie;
    
    document.getElementById('tituloModal').textContent = "Editar Planta";
    document.querySelector('.btn-solid-modal').textContent = "ATUALIZAR PLANTA";
    document.getElementById('file-name').textContent = "Manter foto (ou escolha nova)";
    
    abrirModal('modalPlanta');
}

function prepararRecursos(planta) {
    document.getElementById('idPlantaRecurso').value = planta.id;
    document.getElementById('nomePlantaRecurso').textContent = planta.nome;

    document.getElementById('def_agua_qtd').value = planta.def_agua_qtd || '';
    document.getElementById('def_agua_und').value = planta.def_agua_und || 'ml';
    
    document.getElementById('def_adubo_qtd').value = planta.def_adubo_qtd || '';
    document.getElementById('def_adubo_und').value = planta.def_adubo_und || 'g';

    document.getElementById('def_subs_qtd').value = planta.def_subs_qtd || '';
    document.getElementById('def_subs_und').value = planta.def_subs_und || 'kg';

    document.getElementById('def_pest_qtd').value = planta.def_pest_qtd || '';
    document.getElementById('def_pest_und').value = planta.def_pest_und || 'ml';

    abrirModal('modalRecursos');
}

document.getElementById('formRecursos').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('idPlantaRecurso').value;
    
    const dados = {
        def_agua_qtd: document.getElementById('def_agua_qtd').value,
        def_agua_und: document.getElementById('def_agua_und').value,
        def_adubo_qtd: document.getElementById('def_adubo_qtd').value,
        def_adubo_und: document.getElementById('def_adubo_und').value,
        def_subs_qtd: document.getElementById('def_subs_qtd').value,
        def_subs_und: document.getElementById('def_subs_und').value,
        def_pest_qtd: document.getElementById('def_pest_qtd').value,
        def_pest_und: document.getElementById('def_pest_und').value
    };

    await fetch(`/api/plantas/${id}/recursos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });

    fecharModal('modalRecursos');
    carregarPlantas();
});

function abrirDetalhesPlanta(planta) {
    const modal = document.getElementById('modalDetalhes');
    
    document.getElementById('detalheNome').textContent = planta.nome;
    document.getElementById('detalheEspecie').textContent = planta.especie;
    document.getElementById('detalheFoto').src = planta.foto_url || 'https://via.placeholder.com/600';
    
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);

    buscarHistoricoReal(planta.id);
}

function fecharModalFull() {
    const modal = document.getElementById('modalDetalhes');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 400);
}

async function buscarHistoricoReal(plantaId) {
    const lista = document.getElementById('listaHistorico');
    lista.innerHTML = 'Carregando histórico...';

    try {
        const res = await fetch('/api/atividades');
        const todasAtividades = await res.json();
        
        const hoje = new Date().toISOString().split('T')[0];
        const historico = todasAtividades
            .filter(a => a.plant_id === plantaId && a.data_planejada <= hoje)
            .sort((a, b) => new Date(b.data_planejada) - new Date(a.data_planejada));

        lista.innerHTML = '';

        if (historico.length === 0) {
            lista.innerHTML = '<p style="text-align: center; color: #999; margin-top: 20px;">Ainda não há registros de histórico para esta planta.</p>';
        }

        let concluidas = 0;

        historico.forEach(ativ => {
            const isFeito = ativ.status === 'concluída';
            if(isFeito) concluidas++;
            
            const icon = isFeito ? 'icon-green' : 'icon-red';
            const check = isFeito ? '✔' : '✖';
            
            const dataFormatada = ativ.data_planejada.split('-').reverse().join('/');

            lista.innerHTML += `
                <div class="history-item">
                    <span class="${icon}">${check}</span>
                    <span><strong>${ativ.tipo}</strong> em ${dataFormatada}</span>
                </div>`;
        });

        atualizarNivelEmoji(concluidas, historico.length);

    } catch (error) {
        console.error(error);
        lista.innerHTML = 'Erro ao carregar histórico.';
    }
}

function atualizarNivelEmoji(concluidas, total) {
    document.querySelectorAll('.emoji').forEach(s => s.classList.remove('active'));
    
    if (total === 0) {
        document.getElementById('emoji-neutral').classList.add('active');
        return;
    }

    const percent = concluidas / total;
    if (percent > 0.8) document.getElementById('emoji-happy').classList.add('active');
    else if (percent > 0.5) document.getElementById('emoji-neutral').classList.add('active');
    else document.getElementById('emoji-sad').classList.add('active');
}

window.addEventListener('DOMContentLoaded', carregarPlantas);

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