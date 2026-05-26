<<<<<<< HEAD
# NewStudy 📚✨

NewStudy é uma plataforma de estudos inteligente baseada em Inteligência Artificial que transforma vídeos educativos, seminários acadêmicos e links de aulas gravadas do YouTube em **pacotes completos de aprendizado ativo com alta taxa de retenção**. 
=======

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
git clone https://github.com/seu-usuario/NewStudy3.0.git
cd newstudy3.0
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
## Acessar backend
 A sequência é: (python -m venv venv
venv\Scripts\activate) - (pip install -r requirements.txt) - (python manage.py migrate) - (python manage.py createsuperuser) - (python manage.py runserver) - acessse (http://127.0.0.1:8000/admin/)

Quando for adicionar funcionalidades ao backend:
 Crie as estruturas de migração das 11 tabelas adicionais:
  
    python manage.py makemigrations api

Aplique as migrações ao seu arquivo de banco:

     python manage.py migrate

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
## Sobre funcionalidades:
1. Cadastro de Alunos (User)
O que faz: Exibe a listagem de todos os estudantes que se registraram pela tela de cadastro da plataforma.
Utilidade: Permite ao Admin gerenciar contas de usuários, alterar dados cadastrais esquecidos, verificar e-mails e auditar a segurança.
2. Módulos de Estudo (AI) (Lecture)
O que faz: Monitora todos os materiais sintetizados por inteligência artificial até hoje (slides, resumos, etc.).
Utilidade: Permite ao Admin ver o que os alunos estão estudando, analisar o formato do JSON gerado e auditar/excluir conteúdo impróprio ou módulos órfãos.
3. Categorias de Estudo (StudyCategory)
O que faz: Gerencia as disciplinas temáticas que organizam os estudos no site (ex: "Programação", "Biologia", "Física").
Utilidade: O Admin pode criar ou mudar ícones (utilizando classes do Lucide) e desativar temporariamente pastas de matérias que o site não deve exibir.
4. Flashcards de Professores (FlashCardManual)
O que faz: Um banco de dados de flashcards criados manualmente pela coordenação pedagógica ou professores.
Utilidade: Permite inserir baralhos acadêmicos prontos de alta qualidade para que o estudante não dependa exclusivamente de flashcards gerados pela IA.
5. Configurações Globais (SystemSettings)
O que faz: Controla o comportamento do sistema e as chamadas da IA sem que você precise abrir ou alterar o código-fonte.
Utilidade: Permite mudar dinamicamente o modelo de IA que o site utilizará (ex: trocar de gemini-1.5-flash para gemini-2.0-flash), ajustar a criatividade da IA ("temperature") e até mesmo ligar ou desligar um Modo Manutenção global.
6. Feedbacks & Avaliações (StudentFeedback)
O que faz: Centraliza sugestões, depoimentos, elogios ou bugs que os estudantes enviarem pelo frontend.
Utilidade: Funciona como um painel de suporte onde o administrador atribui estrelas para o feedback e marca mensagens como "Resolvida/Lida".
7. Informativos & Banners (SystemAnnouncement)
O que faz: Modera os banners rotativos de aviso que aparecem na interface do estudante.
Utilidade: Permite ao Admin postar novidades, datas de provas, promoções acadêmicas e ajustar a cor de destaque do card direto pelo painel de controle.
8. Cupons de Desconto (AcademicCoupon)
O que faz: Cria cupons promocionais ou códigos de acesso VIP.
Utilidade: Permite simular campanhas de liberação de planos premium, gerando códigos reutilizáveis, definindo datas de expiração e limite máximo de resgates.
9. FAQ & Ajuda (FAQItem)
O que faz: Gerencia a base de conhecimento e perguntas frequentes do site.
Utilidade: O administrador pode inserir e ordenar pares de "Pergunta e Resposta" para guiar o estudante que está usando o NewStudy pela primeira vez.
10. Engenharia de Prompts (AIPromptTemplate)
O que faz: Guarda as diretrizes (prompts de sistema) utilizadas para conversar com a inteligência artificial do Gemini.
Utilidade: Permite ao admin alterar o tom, as regras de formatação e os limites éticos das respostas inteligentes fornecidas no chat ou nos slides sem mexer no código python.
11. Métricas de Estudo (StudentStudySession)
O que faz: Audita as estatísticas de estudo reais coletadas dos alunos da plataforma (Ex: "Leitura de Slides por 15 minutos" ou "Resolução de Quizzes por 20 minutos").
Utilidade: Coleta dados analíticos essenciais para que pedagogos entendam o tempo médio gasto e quais matérias engajam mais os alunos no site.