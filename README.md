# CSI606-2024-02 - Remoto - Trabalho Final - Resultados

## Discente: Larissa Ribeiro Brum

### Resumo
O **Garden Guardian** é uma aplicação web desenvolvida para auxiliar no gerenciamento e cuidado de plantas domésticas e jardins. O sistema permite que o usuário cadastre suas plantas, mantenha um histórico de cuidados (como rega, adubação, poda), visualize estatísticas de consumo de insumos e monitore a saúde do jardim através de um Dashboard interativo. O objetivo é facilitar a organização da rotina de jardinagem, prevenindo o esquecimento de tarefas essenciais e auxiliando no controle de pragas.

Vídeo de apresentação no youtube: https://youtu.be/SVSvManzlmc

---

### 1. Funcionalidades implementadas
O sistema conta com as seguintes funcionalidades principais, todas operacionais:

*   **Autenticação e Perfil:**
    *   Cadastro de novos usuários e Login seguro (com hash de senha e JWT).
    *   Edição de perfil (nome e e-mail).
    *   Logout e persistência de sessão via Cookies.
*   **Agenda e Atividades:**
    *   Calendário visual interativo para navegação entre meses.
    *   Agendamento de cuidados futuros (status "pendente").
    *   Registro de atividades já realizadas (status "concluída").
    *   Visualização detalhada das atividades do dia ao clicar no calendário.
*   **Controle de Pragas:**
    *   Registro de incidência de pragas (tipo, data e planta afetada).
*   **Dashboard Interativo:**
    *   **Modo Semente:** Tela de boas-vindas para usuários sem plantas cadastradas.
    *   **Estatísticas Gerais:** Total de plantas e espécies.
    *   **Pódio ("As Queridinhas"):** Ranking das plantas que mais receberam cuidados.
    *   **Alertas:** Listas de próximas atividades e atividades atrasadas (expiradas).
    *   **Monitoramento de Negligência:** Barra de progresso indicando plantas esquecidas há mais de 3 dias.
    *   **Gráficos:** Gráfico de pizza (distribuição de espécies) e gráfico de linha (incidência de pragas ao longo do ano) utilizando Chart.js.
    *   **Consumo de Insumos:** Cálculo automático do total de água (L), adubo (kg), etc., utilizados no mês.

### 2. Funcionalidades previstas e não implementadas
Algumas funcionalidades idealizadas inicialmente não foram incluídas nesta versão final:

*   Recuperação de senha ("Esqueci minha senha") via e-mail.
*   Sistema de notificações automáticas (push ou e-mail) para lembrar das atividades agendadas.

### 3. Outras funcionalidades implementadas
Além do escopo básico, foram adicionadas melhorias técnicas e de usabilidade:

*   **Gerenciamento de Plantas (CRUD):**
    *   Cadastro de plantas com foto (upload de imagem), nome e espécie.
    *   Edição e Exclusão de plantas.
    *   Visualização em grade (cards) na página "Minhas Plantas".
    
*   **Gerenciamento de Recursos (Padrões):**
    *   Configuração individual por planta da quantidade padrão de água, adubo, substrato e pesticida, facilitando o registro rápido de atividades.

### 4. Principais desafios e dificuldades
Durante o desenvolvimento, os principais desafios enfrentados foram:

*   **Integração do dashboard:** Configurar os gráficos para receberem dados dinâmicos da API e atualizarem corretamente sem sobreposição de canvas.

### 5. Instruções para instalação e execução

Para executar o projeto localmente, siga os passos abaixo:

**Pré-requisitos:** Ter o Node.js instalado.

1.  **Clonar ou baixar o projeto:**
    Extraia os arquivos em uma pasta de sua preferência.

2.  **Instalar as dependências:**
    Abra o terminal na pasta do projeto e execute:
    ```bash
    npm install
    ```

3.  **Executar o servidor:**
    No terminal, execute:
    ```bash
    npm start
    ```
    *(Ou `node server.js`)*

4.  **Acessar a aplicação:**
    Abra o navegador e acesse: `http://localhost:3000`

5.  **Primeiro Acesso:**
    Clique em "Cadastrar", crie uma conta e comece a usar.