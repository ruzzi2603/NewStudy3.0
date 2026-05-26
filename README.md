# Lumina Study 📚✨

Lumina Study é uma plataforma de estudos inteligente baseada em Inteligência Artificial que transforma vídeos educativos, seminários acadêmicos e links de aulas gravadas do YouTube em **pacotes completos de aprendizado ativo com alta taxa de retenção**. 

Alimentada pelo modelo de ponta **Gemini-3.5-Flash** através do SDK nativo do Google, a plataforma analisa o conteúdo em áudio, extrai os conceitos chave e as formulações científicas com alto rigor matemático e pedagógico.

---

## 🚀 Principais Funcionalidades

- 🎙️ **Transcrição Automatizada**: Mapeamento inteligente de tópicos sincronizado com marcadores temporais de áudio.
- 🎓 **Sumário Pedagógico de Alta Definição**: Visão geral e objetivos de aprendizado formulados como se tivessem sido escritos por um designer de currículo universitário sênior.
- 📐 **Fórmulas e Provas em LaTeX**: Extração matemática precisa com interpretador e glossário de variáveis individuais, ideal para STEM (Ciência, Tecnologia, Engenharia e Matemática).
- 🧠 **Active Recall com Estágio Spaced Repetition**: Cartões de memorização baseados na metodologia de repetição espaçada Leitner, com bookmarks e avaliações de dificuldade individual (Fácil, Médio, Difícil).
- 🏆 **Testes Diagnósticos Interativos**: Questionários de múltipla escolha com explicações completas para avaliar a compreensão conceitual.
- 💬 **Smart Companion (Syllabus Q&A)**: Um assistente por chat contextualizado e focado nas anotações e conteúdos da aula que responde a dúvidas sem alucinações.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React (v18+), TypeScript, Tailwind CSS, Motion (para micro-animações fluidas) e Lucide React (ícones).
- **Backend**: Node.js com Express e TypeScript Compilation executados via `tsx`.
- **Inteligência Artificial**: Google GenAI SDK (`@google/genai`) usando `gemini-3.5-flash`.
- **Estruturação de Dados**: Banco integrado local leve JSON encapsulado com persistência automática.

---

## 📋 Pré-requisitos para Execução

Para rodar este projeto localmente na sua máquina ou implantá-lo em seu próprio ambiente, você precisará ter instalado:

1. **Node.js** (versão 18 ou superior recomendado).
2. **NPM** (gerenciador de pacotes integrado ao Node.js).
3. Uma chave de API do **Google Gemini** (pode ser obtida gratuitamente em [Google AI Studio](https://aistudio.google.com/)).

---

## ⚙️ Passo a Passo e Instalação

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/lumina-study.git
cd lumina-study
```

### 2. Instalar as Dependências do Projeto
Execute o comando a seguir no terminal para baixar todos os módulos necessários:
```bash
npm install
```

### 3. Configurar as Variáveis de Ambiente
O projeto precisa da sua chave de API do Gemini para funcionar. No diretório raiz, você encontrará um arquivo chamado `.env.example`. 

1. Faça uma cópia deste arquivo e renomeie-a para `.env`:
   ```bash
   cp .env.example .env
   ```
2. Abra o arquivo `.env` criado e insira a sua chave do Gemini obtida no Google AI Studio:
   ```env
   GEMINI_API_KEY="SUA_CHAVE_API_AQUI"
   APP_URL="http://localhost:3000"
   ```

> ⚠️ **Aviso de Segurança**: Nunca faça commit do seu arquivo `.env` real ou de suas chaves em repositórios públicos de controle de versão (o arquivo `.env` já está listado no `.gitignore` por padrão).

### 4. Executar em Modo de Desenvolvimento (HMR / Recarga Automática)
Para iniciar o servidor backend juntamente com a recarga ágil do frontend, execute:
```bash
npm run dev
```
Agora, abra o seu navegador e acesse: **`http://localhost:3000`**.

---

## 🧪 Outros Scripts Úteis

- **Compilar para Produção**: Produz o pacote estático otimizado do React e compila o servidor TypeScript usando `esbuild`:
  ```bash
  npm run build
  ```
- **Iniciar Servidor de Produção**: Executa a aplicação otimizada de produção a partir do build final compilado em `./dist/server.cjs`:
  ```bash
  npm run start
  ```
- **Verificar Sintaxe e Tipos (Lint)**: Executa a validação formal de tipos TypeScript no codebase:
  ```bash
  npm run lint
  ```
- **Limpeza de Cache Local**: Remove artefatos temporários compilados e limpa o banco de dados inicializado:
  ```bash
  npm run clean
  ```

---

## 📂 Organização de Diretórios

```plaintext
├── .env.example          # Modelo de configuração de ambiente (sem segredos)
├── LICENSE               # Declaração formal de licença de uso do código
├── README.md             # Manual de instalação e arquitetura (Este arquivo)
├── db.json               # Banco de dados simulado auto-gerado para cache local
├── package.json          # Manifesto NPM com dependências e scripts de execução
├── server.ts             # Inicializador do Express e middlewares
└── src/
    ├── types.ts          # Definições formais de tipos TypeScript
    ├── main.tsx          # Ponto de entrada padrão do Vite
    ├── App.tsx           # Componente principal e roteamento reativo
    ├── index.css         # Configurações de estilo global e Tailwind
    ├── components/       # Componentes autônomos de UI/UX
    │   ├── Dashboard.tsx    # Tela de importação e biblioteca de aulas
    │   ├── LectureView.tsx  # Área de estudos, abas de conteúdo e Q&A Chat
    │   └── RecallStage.tsx  # Game Loop de Flashcards Leitner e Exame Diagnóstico
    └── server/           # Helpers do backend
        ├── ai.ts            # Implementações do Google GenAI SDK (Gemini)
        └── db.ts            # Operações de leitura/escrita no cache JSON
```

---

## 📜 Licença

Este software é disponibilizado sob a licença **Apache License 2.0**. Sinta-se à vontade para utilizar, modificar e redistribuir conforme as diretrizes documentadas no arquivo `LICENSE`.
