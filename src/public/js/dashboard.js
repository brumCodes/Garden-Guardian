async function carregarDashboard() {
    try {
        const resUser = await fetch('/api/user');
        if (resUser.ok) {
            const user = await resUser.json();
            document.getElementById('userWelcomeName').textContent = user.nome;
        }

        const resPlantas = await fetch('/api/plantas');

        if (resPlantas.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        
        let plantas = [];
        if (resPlantas.ok) {
            plantas = await resPlantas.json();
        }
        if (!Array.isArray(plantas)) plantas = [];

        const telaSemente = document.getElementById('modoSemente');
        const telaReal = document.getElementById('conteudoReal');

        if (plantas.length === 0) {
            telaSemente.style.display = 'flex';
            telaReal.style.display = 'none';
            return;
        } else {
            telaSemente.style.display = 'none';
            telaReal.style.display = 'block';

            const especiesUnicas = new Set(plantas.map(p => p.especie));
            document.getElementById('totalPlantasDash').textContent = plantas.length;
            document.getElementById('totalEspeciesDash').textContent = especiesUnicas.size;
        }

        const resAtividades = await fetch('/api/atividades');
        const atividades = await resAtividades.json();

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const msPorDia = 1000 * 60 * 60 * 24;

        function formatarDiaSemana(dataString) {
            const [y, m, d] = dataString.split('-');
            const data = new Date(y, m - 1, d);
            const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
            return dias[data.getDay()];
        }

        const contagemConcluidas = {};
        plantas.forEach(p => contagemConcluidas[p.nome] = 0);
        
        atividades.forEach(a => {
            if (a.status === 'concluída') {
                contagemConcluidas[a.planta_nome] = (contagemConcluidas[a.planta_nome] || 0) + 1;
            }
        });

        const ranking = Object.keys(contagemConcluidas)
            .map(nome => ({ nome, total: contagemConcluidas[nome] }))
            .sort((a, b) => b.total - a.total);

        const podiumContainer = document.querySelector('.podium-container');
        podiumContainer.innerHTML = '';

        const podiumOrdem = [
            { pos: 3, classe: 'p3', index: 2 },
            { pos: 1, classe: 'p1', index: 0 },
            { pos: 2, classe: 'p2', index: 1 }
        ];

        podiumOrdem.forEach(lugar => {
            const planta = ranking[lugar.index];
            const nomeExibir = planta ? planta.nome : '---';
            podiumContainer.innerHTML += `
                <div class="podium-item">
                    <span class="podium-name">🏆 ${nomeExibir}</span>
                    <div class="podium-block ${lugar.classe}">${lugar.pos}</div>
                </div>
            `;
        });

        const pendentes = atividades.filter(a => a.status === 'pendente' && a.data_planejada);
        
        const proximas = [];
        const expiradas = [];

        pendentes.forEach(a => {
            const [y, m, d] = a.data_planejada.split('-');
            const dataAtiv = new Date(y, m - 1, d);
            dataAtiv.setHours(0,0,0,0);

            if (dataAtiv >= hoje) {
                proximas.push(a);
            } else {
                expiradas.push(a);
            }
        });

        proximas.sort((a, b) => new Date(a.data_planejada) - new Date(b.data_planejada));
        expiradas.sort((a, b) => new Date(a.data_planejada) - new Date(b.data_planejada));

        const listaProximas = document.getElementById('listaProximasDash');
        listaProximas.innerHTML = '';
        proximas.slice(0, 4).forEach(a => {
            listaProximas.innerHTML += `
                <div class="list-item"><span class="icon-green">✔</span> <div><strong>${a.tipo}</strong> ${a.planta_nome}<br><span>/ ${formatarDiaSemana(a.data_planejada)}</span></div></div>
            `;
        });
        if(proximas.length === 0) listaProximas.innerHTML = '<p style="color:#999; font-size: 0.9rem;">Tudo limpo por aqui! Nenhuma tarefa futura.</p>';

        const listaExpiradas = document.getElementById('listaExpiradas');
        listaExpiradas.innerHTML = '';
        expiradas.slice(0, 4).forEach(a => {
            listaExpiradas.innerHTML += `
                <div class="list-item"><span class="icon-red">✖</span> <div><strong>${a.tipo}</strong> ${a.planta_nome}<br><span>/ ${formatarDiaSemana(a.data_planejada)}</span></div></div>
            `;
        });
        if(expiradas.length === 0) listaExpiradas.innerHTML = '<p style="color:#999; font-size: 0.9rem;">Parabéns! Nenhuma tarefa atrasada.</p>';

        const listaEsquecidas = document.getElementById('listaEsquecidas');
        listaEsquecidas.innerHTML = ''; 

        const plantasParaExibir = plantas.map(p => {
            const historicoReal = atividades.filter(a => 
                a.planta_nome === p.nome && 
                a.status === 'concluída' && 
                a.data_realizada
            );
            
            if (historicoReal.length > 0) {
                const datasConcluidas = historicoReal.map(a => new Date(a.data_realizada + 'T00:00:00'));
                const ultimaDataCuidado = new Date(Math.max(...datasConcluidas));
                ultimaDataCuidado.setHours(0,0,0,0);
                
                const diferencaMs = hoje.getTime() - ultimaDataCuidado.getTime();
                return { nome: p.nome, dias: Math.floor(diferencaMs / msPorDia) };
            }
            return { nome: p.nome, dias: 0 };
        }).filter(item => item.dias > 3);

        plantasParaExibir.sort((a, b) => b.dias - a.dias).slice(0, 3).forEach(esquecida => {
            let classeCor = esquecida.dias > 7 ? "danger" : "warning";
            let larguraBarra = esquecida.dias > 7 ? "95%" : "75%";
            let caveira = esquecida.dias > 7 ? " 💀" : "";

            listaEsquecidas.innerHTML += `
                <div class="bar-item">
                    <span>${esquecida.nome}</span>
                    <div class="bar-bg"><div class="bar-fill ${classeCor}" style="width: ${larguraBarra};">${esquecida.dias} dias sem cuidado${caveira}</div></div>
                </div>
            `;
        });

        if (listaEsquecidas.innerHTML === '') {
            listaEsquecidas.innerHTML = '<p style="color: #999; font-size: 0.9rem;">Todas as plantas receberam carinho recentemente!</p>';
        }
        const contagemEspecies = {};
        
        plantas.forEach(p => {
            const esp = p.especie.trim();
            const nomeFormatado = esp.charAt(0).toUpperCase() + esp.slice(1).toLowerCase();
            
            contagemEspecies[nomeFormatado] = (contagemEspecies[nomeFormatado] || 0) + 1;
        });

        const labelsPizza = Object.keys(contagemEspecies);
        const dadosPizza = Object.values(contagemEspecies);
        
        const coresBase = ['#00C853', '#B9F6CA', '#69F0AE', '#00E676', '#43A047', '#66BB6A'];
        const coresPizza = labelsPizza.map((_, i) => coresBase[i % coresBase.length]);

        new Chart(document.getElementById('graficoPizza').getContext('2d'), {
            type: 'pie',
            data: {
                labels: labelsPizza,
                datasets: [{
                    data: dadosPizza,
                    backgroundColor: coresPizza,
                    borderWidth: 0
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                    legend: { 
                        display: true, 
                        position: 'bottom',
                        labels: { boxWidth: 12, font: { size: 10 } }
                    } 
                } 
            }
        });

        let totalAguaMl = 0;
        let totalAduboG = 0;
        let totalSubstratoG = 0;
        let totalPesticidaMl = 0;

        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();
        
        const mapPlantas = {};
        plantas.forEach(p => mapPlantas[p.id] = p);

        atividades.forEach(a => {
            if (a.status === 'concluída' && a.data_realizada) {
                const dataReal = new Date(a.data_realizada + 'T00:00:00');
                
                if (dataReal.getMonth() === mesAtual && dataReal.getFullYear() === anoAtual) {
                    
                    let qtd = parseFloat(a.quantidade);
                    let und = a.unidade;

                    if (!qtd) {
                        const p = mapPlantas[a.plant_id];
                        if (p) {
                            if (a.tipo === 'rega') { qtd = p.def_agua_qtd; und = p.def_agua_und; }
                            else if (a.tipo === 'adubo') { qtd = p.def_adubo_qtd; und = p.def_adubo_und; }
                            else if (a.tipo === 'substrato' || a.tipo === 'transplante') { qtd = p.def_subs_qtd; und = p.def_subs_und; }
                            else if (a.tipo === 'pesticida' || a.tipo === 'tratamento') { qtd = p.def_pest_qtd; und = p.def_pest_und; }
                        }
                    }

                    if (qtd) {
                        let qtdNormalizada = parseFloat(qtd);
                        if (und === 'L' || und === 'kg') qtdNormalizada = qtdNormalizada * 1000;

                        if (a.tipo === 'rega') totalAguaMl += qtdNormalizada;
                        else if (a.tipo === 'adubo') totalAduboG += qtdNormalizada;
                        else if (a.tipo === 'substrato' || a.tipo === 'transplante') totalSubstratoG += qtdNormalizada;
                        else if (a.tipo === 'pesticida' || a.tipo === 'tratamento') totalPesticidaMl += qtdNormalizada;
                    }
                }
            }
        });

        function formatarUnidade(valor, unidadePequena, unidadeGrande) {
            if (valor >= 1000) return (valor / 1000).toFixed(1).replace('.', ',') + ' ' + unidadeGrande;
            return valor + ' ' + unidadePequena;
        }

        document.getElementById('qtdAgua').textContent = formatarUnidade(totalAguaMl, 'ml', 'L');
        document.getElementById('qtdAdubo').textContent = formatarUnidade(totalAduboG, 'g', 'kg');
        document.getElementById('qtdSubstrato').textContent = formatarUnidade(totalSubstratoG, 'g', 'kg');
        document.getElementById('qtdPesticida').textContent = formatarUnidade(totalPesticidaMl, 'ml', 'L');

        const resPests = await fetch('/api/pests/stats');
        const pestStats = await resPests.json();

        const mesesLabels = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        
        const pragasPorTipo = {};
        pestStats.forEach(stat => {
            if (!pragasPorTipo[stat.tipo_praga]) {
                pragasPorTipo[stat.tipo_praga] = Array(12).fill(0);
            }
            const mesIndex = parseInt(stat.mes) - 1;
            pragasPorTipo[stat.tipo_praga][mesIndex] += stat.total;
        });

        const cores = ['#E74C3C', '#F39C12', '#8E44AD', '#3498DB', '#2ECC71', '#16A085', '#2C3E50'];
        
        const datasets = Object.keys(pragasPorTipo).map((tipo, index) => ({
            label: tipo,
            data: pragasPorTipo[tipo],
            borderColor: cores[index % cores.length],
            backgroundColor: cores[index % cores.length],
            borderWidth: 2,
            tension: 0.3,
            fill: false
        }));

        if (datasets.length === 0) {
            datasets.push({
                label: 'Sem registros',
                data: Array(12).fill(0),
                borderColor: '#E74C3C',
                borderWidth: 1
            });
        }

        const ctxLinha = document.getElementById('graficoLinha').getContext('2d');
        if (window.meuGraficoLinha) window.meuGraficoLinha.destroy();

        window.meuGraficoLinha = new Chart(ctxLinha, {
            type: 'line',
            data: {
                labels: mesesLabels,
                datasets: datasets
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { 
                    legend: { display: true, position: 'bottom' }
                },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });

    } catch (error) {
        console.error("Erro ao carregar o dashboard:", error);
    }
}

async function abrirModalPerfil() {
    const modal = document.getElementById('modalPerfil');
    
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

const formPerfil = document.getElementById('formPerfil');
if (formPerfil) {
    formPerfil.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = this.querySelector('button[type="submit"]');
        const textoOriginal = btn.textContent;
        btn.textContent = "SALVANDO...";

        const dados = {
            nome: document.getElementById('perfilNome').value,
            email: document.getElementById('perfilEmail').value
        };

        await fetch('/api/user', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        window.location.reload();
    });
}

function fazerLogout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login.html';
}

window.addEventListener('DOMContentLoaded', carregarDashboard);
