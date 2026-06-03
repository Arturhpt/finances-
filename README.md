# FinanceApp - Controle Financeiro Pessoal 📱💰

**FinanceApp** é um sistema completo, moderno e responsivo de controle financeiro pessoal. Ele foi desenvolvido com HTML, CSS e JavaScript puros (Vanilla JS), utilizando o **Firebase v10** para Autenticação e Banco de Dados (Firestore), e **Chart.js** para relatórios e análise de despesas.

O projeto inclui um **Modo de Demonstração (Local)** automático. Caso as credenciais do Firebase não sejam fornecidas, o aplicativo funcionará perfeitamente offline utilizando o `localStorage` do navegador para simular login, cadastro e operações de dados em tempo real.

---

## 🚀 Funcionalidades / Features

1. **Autenticação Segura (Firebase Auth / Mock)**:
   - Cadastro de novos usuários.
   - Login seguro e persistência de sessão.
   - Recuperação de senha por e-mail.
   - Logout seguro.

2. **Dashboard Dinâmico**:
   - Resumo em tempo real: Saldo Total, Total de Receitas e Total de Despesas.
   - Listagem dos últimos 5 lançamentos mais recentes.
   - Atalhos para ações rápidas (adicionar receitas/despesas e criar categorias).

3. **Controle Financeiro Completo (CRUD)**:
   - Adicionar, editar e deletar transações de receitas e despesas.
   - Categorias padrão e suporte a **Categorias Personalizadas** adicionadas pelo usuário.
   - Painel de filtros avançados: filtragem por tipo de transação, categoria e períodos de data.

4. **Relatórios Visuais (Chart.js)**:
   - Gráfico de barra de fluxo de caixa mensal (Receitas vs. Despesas) dos últimos 6 meses.
   - Gráfico doughnut de distribuição percentual das despesas por categorias.
   - Sumário financeiro do período ativo.

5. **Interface Premium & Responsiva**:
   - Visual limpo, profissional e moderno (estilo Fintech).
   - Suporte nativo a **Tema Claro (Light Mode)** e **Tema Escuro (Dark Mode)** com persistência da escolha do usuário.
   - Menu lateral retrátil e totalmente otimizado para celulares e computadores.
   - Animações e micro-transações suaves para melhor experiência do usuário (UX).

6. **Segurança Garantida**:
   - Isolamento completo de dados por usuário.
   - Arquivo de regras de segurança pronto para o Firebase Firestore (`firestore.rules`).

---

## 📂 Estrutura do Projeto / Project Structure

```text
FinanceApp/
├── css/
│   └── styles.css          # Design System, reset, variáveis HSL e estilos responsivos
├── js/
│   ├── firebase-config.js  # Inicialização do Firebase (e detecção de credenciais)
│   ├── auth.js             # Funções de Autenticação (Firebase Auth + Mock local)
│   ├── db.js               # Operações de Banco de Dados (Firestore + Mock local)
│   ├── charts.js           # Geração e atualização dinâmica dos gráficos com Chart.js
│   └── app.js              # Controlador principal da interface, eventos e estado
├── index.html              # Estrutura HTML5 semântica e contêineres das telas
├── firestore.rules         # Regras de segurança prontas para subir no Firebase Console
├── package.json            # Configuração do ambiente local de desenvolvimento com Vite
└── README.md               # Instruções de instalação, configuração e publicação
```

---

## 💻 Instalação e Execução Local / Local Installation

Para executar o projeto localmente com recarregamento em tempo real (Hot Reload), siga os passos abaixo:

### Pré-requisitos
- Ter o **Node.js** instalado na máquina.

### Passos
1. Clone ou baixe o diretório do projeto `FinanceApp`.
2. Abra o terminal no diretório do projeto.
3. Instale o servidor de desenvolvimento local (Vite):
   ```bash
   npm install
   ```
4. Inicie o servidor:
   ```bash
   npm run dev
   ```
5. Acesse o endereço exibido no terminal (geralmente `http://localhost:5173`) no seu navegador.

---

## 🔧 Configurando o Firebase / Configuring Firebase

Se você deseja conectar o projeto ao seu próprio banco de dados Firebase na nuvem, siga este passo a passo:

1. Acesse o [Firebase Console](https://console.firebase.google.com/) e faça login com sua conta do Google.
2. Clique em **Adicionar projeto** (Add Project) e dê o nome de `FinanceApp`.
3. No painel do projeto, ative os dois serviços necessários:
   - **Authentication**:
     1. Vá em *Build > Authentication* no menu lateral e clique em *Começar* (Get Started).
     2. Na aba *Método de login* (Sign-in method), selecione **E-mail/Senha** (Email/Password), ative a primeira chave e clique em *Salvar*.
   - **Cloud Firestore**:
     1. Vá em *Build > Firestore Database* e clique em *Criar banco de dados* (Create Database).
     2. Escolha a localização do servidor e inicie o banco no **Modo de Produção** (Production Mode).
4. Registre um aplicativo web no projeto Firebase:
   - Na página inicial do Console do Firebase, clique no ícone de **Web (`</>`)**.
   - Dê um apelido ao app (ex: `FinanceApp Web`) e clique em *Registrar app*.
   - Copie o objeto `firebaseConfig` gerado. Ele se parecerá com isto:
     ```javascript
     const firebaseConfig = {
       apiKey: "AIzaSy...",
       authDomain: "financeapp-xxxx.firebaseapp.com",
       projectId: "financeapp-xxxx",
       storageBucket: "financeapp-xxxx.appspot.com",
       messagingSenderId: "...",
       appId: "..."
     };
     ```
5. Abra o arquivo `js/firebase-config.js` no seu editor de código e substitua os placeholders do objeto `firebaseConfig` pelos dados que você copiou.
6. Configure as Regras de Segurança do Firestore:
   - No painel do Cloud Firestore, vá na aba **Regras** (Rules).
   - Copie o conteúdo do arquivo [firestore.rules](file:///C:/Users/Sandr/.gemini/antigravity/scratch/FinanceApp/firestore.rules) do projeto, cole-o na área de texto das regras e clique em **Publicar** (Publish).
7. Recarregue a página do seu FinanceApp. O aviso de "Modo de Demonstração" desaparecerá e você poderá cadastrar usuários reais que salvarão seus dados diretamente na nuvem!

---

## 🚀 Publicação e Hospedagem / Deployment

Como o FinanceApp é um aplicativo puramente estático (HTML, CSS e JS cliente), ele pode ser hospedado de forma 100% gratuita nas principais plataformas:

### 1. Vercel
1. Instale o CLI da Vercel globalmente ou faça login no site da [Vercel](https://vercel.com/).
2. Conecte sua conta do GitHub e importe o repositório do projeto.
3. A Vercel detectará automaticamente o arquivo `package.json` e configurará o build do Vite (`npm run build`).
4. Clique em **Deploy**. O projeto estará no ar em segundos!

### 2. Netlify
1. Faça login no [Netlify](https://www.netlify.com/).
2. Vá em *Add new site > Import from Git* e conecte seu repositório.
3. Defina os comandos de Build:
   - *Build command*: `npm run build` ou `vite build`
   - *Publish directory*: `dist`
4. Clique em **Deploy site**.

### 3. GitHub Pages
Se você deseja publicar via GitHub Pages de maneira simples (sem scripts de build CI):
1. Faça o commit e envie seu código para um repositório no GitHub.
2. Certifique-se de que o repositório é público.
3. No menu superior do repositório, clique em **Settings** > **Pages** (no menu esquerdo).
4. Em *Build and deployment*, defina a fonte (*Source*) como **Deploy from a branch**.
5. Selecione a branch principal (ex: `main` ou `master`) e a pasta raiz (`/root`). Clique em **Save**.
6. Em alguns minutos, seu site estará ativo no endereço `https://seu-usuario.github.io/nome-do-repositorio/`.
*(Nota: Certifique-se de que os caminhos dos arquivos CSS/JS no HTML não possuam barras absolutas no início caso o repositório não seja a raiz do domínio)*.
