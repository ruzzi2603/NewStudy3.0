# NewStudy 3.0

NewStudy e uma plataforma de estudo com IA que transforma aulas, links e materiais didaticos em resumos, objetivos de aprendizado, transcricoes tematicas, formulas, flashcards, quizzes e chat contextual.

## O que o projeto entrega

- Importacao de aulas por link do YouTube
- Geração de resumo, topicos e conceitos-chave
- Flashcards e quiz para revisao ativa
- Chat com IA para tirar duvidas sobre a aula
- Autenticacao com sessao por cookie
- Area de documentos legais com Termos de Uso, Privacidade e Cookies

## Stack principal

- Frontend: React, TypeScript, Vite, Tailwind CSS e Motion
- Backend principal: Node.js, Express e TypeScript
- Persistencia: `db.json` com suporte opcional a PostgreSQL
- IA: Google GenAI SDK
- Admin legado/apoio: Django em `backend/`

## Como rodar localmente
## caso nao tenh o node: set PATH=C:\Users\14894087626\node-v22.22.3-win-x64;%PATH%
### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variaveis de ambiente

Copie o arquivo `.env.example` para `.env` e ajuste as chaves:

```bash
cp .env.example .env
```

Defina, no minimo:

- `GEMINI_API_KEY`
- `SESSION_SECRET`

Se voce for usar a parte Django, configure tambem:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `DJANGO_CORS_ALLOWED_ORIGINS`

### 3. Subir a aplicacao principal

```bash
npm run dev
```

Abra:

```text
http://localhost:3000
```

## Backend Django opcional

Se voce quiser usar o ambiente Django de administracao/apoio:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Painel admin:

```text
http://127.0.0.1:8000/admin/
```

## Scripts npm

- `npm run dev` - sobe o servidor Express com o frontend
- `npm run build` - gera o build de producao
- `npm run start` - executa o build gerado
- `npm run lint` - valida tipos TypeScript
- `npm run clean` - remove `dist` e `db.json`

## Estrutura principal

```text
server.ts              # Servidor Express e rotas principais
src/App.tsx            # Interface principal
src/components/        # Telas e blocos reutilizaveis
src/server/db.ts       # Persistencia local e Postgres
src/server/ai.ts       # Integracao com o modelo de IA
backend/               # Ambiente Django de apoio
```

## Area legal

O fluxo de cadastro agora exibe:

- Termos de Uso
- Politica de Privacidade
- Politica de Cookies

O aceite e obrigatorio para criar conta. O texto exibido na interface e uma minuta operacional pensada para publicacao, mas ainda deve ser revisada por advogado local antes de o produto entrar em producao.

## Aviso importante

Nao publique o projeto com `.env` real, credenciais, chaves de API ou dados de teste sensiveis no repositório.

## user esse comando no chatgpt para criar os diagramas corretamente:
 Você é um especialista em UML e em modelagem de sistemas para Visual Paradigm. Quero que você crie, com fidelidade máxima ao projeto abaixo, 3 diagramas UML para o sistema NewStudy 3.0:

1. Diagrama de Casos de Uso
2. Diagrama de Classes
3. Diagrama de Atividades

Use linguagem profissional, nomes em português, e siga notação UML correta como se o resultado fosse desenhado no Visual Paradigm. Não invente funcionalidades fora do projeto. Se algo não existir no projeto, não inclua. Se houver necessidade, separe claramente o que é frontend, backend e integrações externas.

Contexto do sistema:
O NewStudy 3.0 é uma plataforma de estudos com IA que transforma links e materiais didáticos em conteúdo educacional estruturado: resumos, objetivos de aprendizado, transcrições temáticas, fórmulas, flashcards, quizzes, chat contextual com IA e exportação de materiais.
O sistema tem frontend em React + TypeScript + Vite + Tailwind + Motion, backend principal em Node.js + Express + TypeScript, persistência local em db.json com suporte opcional a PostgreSQL, e um backend Django legado/apoio para administração e algumas rotas de apoio.
O usuário autentica por sessão com cookie. Existe área de perfil do usuário, configurações, segurança, legal docs, geração de PDF, exportação de estudo e interface para revisar conteúdos.

Regras importantes:
- Modele somente o que existe no projeto.
- Os diagramas devem refletir a estrutura real do sistema, não um sistema genérico.
- Use nomes de classes e casos de uso coerentes com o código e os modelos do projeto.
- Mostre relacionamentos corretos, cardinalidades, dependências e associações relevantes.
- Se for útil, inclua notas curtas explicando decisões de modelagem.
- A saída deve ser suficientemente detalhada para eu reproduzir no Visual Paradigm.
- Não use linguagem vaga. Seja específico.
- Se houver integração com IA, trate como sistema externo.
- Se houver integração com YouTube, trate como sistema externo.
- Se houver persistência em JSON/PostgreSQL/Django, represente corretamente o backend e os modelos de domínio.

Contexto funcional real do projeto:
- Cadastro e login de usuário
- Recuperar conta e alterar senha
- Logout
- Visualizar dashboard
- Importar aula por URL do YouTube
- Gerar estudo completo com IA
- Ver resumo, objetivos, transcrição, fórmulas e conceito-chave
- Navegar entre abas da aula
- Fazer perguntas ao chat de IA
- Ver flashcards e quizzes
- Exportar estudo em PDF
- Copiar guia em Markdown
- Gerenciar perfil do usuário
- Upload de foto de perfil
- Configurações extras da conta
- Ver histórico de estudo
- Ver documentos legais: termos, privacidade e cookies
- Contador de módulos do usuário
- Persistência de dados do usuário e das aulas

Quero que você entregue o resultado neste formato:

A. DIAGRAMA DE CASOS DE USO
- Identifique os atores principais e secundários.
- Inclua um ator principal de aluno/usuário.
- Inclua sistemas externos relevantes, como IA/Gemini, YouTube, armazenamento e backend/admin quando aplicável.
- Liste os casos de uso com nomes claros e em português.
- Mostre relações include e extend quando fizer sentido.
- Deixe claro o fluxo de autenticação, importação de aula, geração de conteúdo, estudo ativo, perfil, PDF e segurança.
- Os casos de uso devem refletir a navegação e as ações reais do site.

B. DIAGRAMA DE CLASSES
- Modele as classes centrais do domínio com base no projeto.
- Inclua pelo menos as entidades ligadas a:
  - User
  - Lecture
  - TranscriptSegment
  - Formula
  - Flashcard
  - QuizQuestion
  - ChatMessage
  - StudySession
  - ProfileStats
  - AccountPreferences
  - UserProfileData
- Se achar necessário, inclua classes de backend/modelos persistentes como:
  - StudyCategory
  - FlashCardManual
  - SystemSettings
  - StudentFeedback
  - SystemAnnouncement
  - AcademicCoupon
  - FAQItem
  - AIPromptTemplate
  - StudentStudySession
- Mostre composições/agrupamentos corretos, por exemplo Lecture contendo segmentos, fórmulas, flashcards, quizzes e chatHistory.
- Mostre o vínculo de User com Lecture por userId.
- Mostre atributos principais e tipos.
- Mostre multiplicidades.
- Se existir uma separação clara entre modelos do frontend e do backend, represente isso de forma limpa.

C. DIAGRAMA DE ATIVIDADES
Quero pelo menos 3 fluxos, ou 1 diagrama de atividades grande com raias, cobrindo:
1. Cadastro / login do usuário
2. Importação e geração de uma aula a partir de URL
3. Estudo de uma aula com chat, flashcards, quiz, exportação em PDF e navegação por abas

Requisitos do diagrama de atividades:
- Use raias/swimlanes quando apropriado.
- Inclua decisões, validações e caminhos de erro.
- Mostre autenticação, envio da URL, processamento da IA, salvamento do conteúdo, exibição do estudo e ações do usuário.
- Mostre o fluxo de exportação do PDF como etapa final de download direto.
- Se a atividade for longa, priorize clareza e sequência lógica.

Detalhes específicos para o diagrama de casos de uso:
- Casos de uso mínimos que precisam aparecer:
  - Cadastrar conta
  - Fazer login
  - Fazer logout
  - Recuperar senha
  - Editar perfil
  - Fazer upload de foto
  - Importar aula por URL
  - Gerar conteúdo da aula com IA
  - Visualizar resumo do estudo
  - Visualizar transcrição temática
  - Visualizar fórmulas
  - Fazer perguntas ao chat IA
  - Iniciar modo flashcards
  - Iniciar simulado/quiz
  - Exportar PDF do estudo
  - Copiar guia em Markdown
  - Acessar configurações da conta
  - Visualizar histórico de estudo
  - Visualizar termos, privacidade e cookies
- Considere a existência de uma sessão autenticada por cookie.
- Considere que o usuário pode ter conteúdo ligado à sua conta.
- Considere que o PDF exporta apenas o conteúdo da matéria, sem flashcards e sem testes.

Detalhes específicos do diagrama de classes:
- Não simplifique demais.
- Não faça classes genéricas demais como “Sistema” ou “Controle”.
- Prefira classes do domínio e classes de suporte reais.
- Mostre os tipos de coleção quando útil, por exemplo:
  - Lecture 1..* TranscriptSegment
  - Lecture 1..* Formula
  - Lecture 1..* Flashcard
  - Lecture 1..* QuizQuestion
  - Lecture 1..* ChatMessage
  - User 0..* Lecture
- Inclua atributos típicos como id, title, text, status, progress, createdAt, etc.
- Mostre enums quando fizer sentido, por exemplo status de lecture, atividades de estudo, temas, dificuldade de flashcard.
- Se usar classes de perfil, ligue UserProfileData aos dados exibidos no frontend.
- Se usar classes de persistência Django, separe-as visualmente das classes do frontend, se necessário.

Detalhes específicos do diagrama de atividades:
- Mostre o usuário clicando em “Criar conta”, “Entrar”, “Importar aula”, “Exportar PDF” e interagindo com a aula.
- Mostre validações como:
  - campos obrigatórios
  - senha mínima
  - aceite dos termos
  - URL válida
  - resposta da IA
  - conteúdo gerado com sucesso
- Mostre a persistência/recuperação do conteúdo.
- Mostre que o PDF é baixado automaticamente ao final.
- Mostre caminhos alternativos quando a IA falha, a URL é inválida ou o usuário não está autenticado.

Formatação da resposta:
- Primeiro me entregue um resumo curto da arquitetura que você inferiu.
- Depois entregue cada diagrama em bloco separado, com:
  - título
  - elementos principais
  - relacionamentos
  - observações de modelagem
- Se possível, inclua uma versão textual pronta para eu desenhar no Visual Paradigm.
- Se você usar alguma convenção de Visual Paradigm, descreva de forma prática.
- Seja detalhado, mas objetivo.

Importante:
Não gere código de aplicação. Quero apenas a modelagem UML e a descrição estruturada para desenhar no Visual Paradigm com fidelidade ao NewStudy 3.0.