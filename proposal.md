# 🌿 Garden Guardian

**CSI606-2025-01 - Remoto - Proposta de Trabalho Final**  
**Discente:** Larissa Ribeiro Brum — *23.2.8023*

O **Garden Guardian** é um sistema web desenvolvido para auxiliar no gerenciamento e cuidado de plantas domésticas. O projeto visa solucionar a dificuldade comum de organizar e manter rotinas de manutenção para quem possui um “jardim em casa”, centralizando o monitoramento de insumos, controle de pragas e agendamento de tarefas.

---

## 📋 Resumo

A aplicação permite que usuários cadastrados cataloguem suas plantas e registrem atividades. O grande diferencial é o **Dashboard rico em dados**, que não apenas monitora atividades, mas também o consumo de recursos (água, adubo, substrato) e a saúde das plantas, **gamificando** o processo através de um ranking de vitalidade.

---

## 🎯 Escopo do Projeto

### 🔐 1. Autenticação de Usuário

- Cadastro de novos usuários (e-mail e senha)  
- Login de usuários existentes  
- **Isolamento de dados:** cada usuário tem acesso exclusivo à sua coleção

---

### 🪴 2. Gerenciamento de Plantas (CRUD)

- **Cadastrar:** adição de novas plantas à coleção  
- **Listar:** visualização de todas as plantas cadastradas  
- **Editar:** atualização de dados da planta  
- **Remover:** exclusão de plantas da coleção

---

### 📊 3. Dashboard (Painel de Controle)

O coração da aplicação, focado em dados e gamificação:

- 🏆 **Gamificação (As Queridinhas):** pódio (1º, 2º e 3º lugar) das plantas com melhor índice de saúde  
- 🚨 **Alertas de Negligência:** barras de progresso indicando há quanto tempo as plantas não recebem cuidados  
- 📉 **Relatórios de Controle:**
  - Gráfico de pizza: distribuição por espécie/categoria  
  - Gráfico de linha: histórico de incidência de pragas  
- 💧 **Monitoramento de Recursos:** cards somando o consumo mensal de:
  - Água (L)
  - Adubo (Kg)
  - Substrato (Kg)
  - Pesticidas

---

### ✅ 4. Gestão de Tarefas

- **Próximas atividades:** checklist para os próximos dias  
- **Atividades expiradas:** lista de tarefas atrasadas prioritárias

---

### 📝 5. Detalhes e Histórico

- **Perfil da planta:** nome, espécie e indicador visual de *Nível de Cuidado* (satisfação)  
- **Linha do tempo:** registro vertical (timeline) de ações (regas, podas), diferenciando:
  - ✅ Tarefas concluídas  
  - ❌ Tarefas perdidas  

---

### 📅 6. Agenda

- Visualização em calendário (grade mensal)  
- Agendamento de atividades futuras  
- Registro de atividades passadas  

---

## 🚫 Restrições e Limitações

- **Sem funcionalidades sociais:** o sistema é estritamente pessoal (sem compartilhamento, seguidores ou fóruns)  
- **Sem notificações push/e-mail:** o uso é passivo; o usuário deve acessar a plataforma para conferir o cronograma  

---

## 🎨 Protótipos

Protótipos de alta fidelidade foram elaborados para definir a identidade visual e o fluxo. As imagens estão localizadas na pasta `/prototipos`.

- **Landing Page:** `lp.png`  
- **Login e Cadastro:** `login.png`, `cadastro.png`  
- **Dashboard:** `dashboard.png`  
- **Listagem "Minhas Plantas":** `minhas plantas.jpg`  
- **Detalhes da planta:** `detalhes da planta.jpg`  
- **Agenda:** `agenda.png`  
