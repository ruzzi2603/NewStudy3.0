# NewStudy 3.0

NewStudy e uma plataforma de estudo com IA que transforma aulas, links e materiais didaticos em resumos, objetivos de aprendizado, transcricoes tematicas, formulas, flashcards, quizzes e chat contextual.

## O que o projeto entrega

- Importacao de aulas por link do YouTube
- Geração de resumo, topicos e conceitos-chave
- Flashcards e quiz para revisao ativa
- Chat com IA para tirar duvidas sobre a aula
- Autenticacao com sessao por cookie
- gerar pdf de cada estudo
- Area de documentos legais com Termos de Uso, Privacidade e Cookies

## Stack principal

- Frontend: React, TypeScript, Vite, Tailwind CSS e Motion
- Backend principal: Node.js, Express e TypeScript
- Persistencia: PostgreSQL/Supabase compartilhado entre o app principal e o Django
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
- `npm run clean` - remove `dist`

## Estrutura principal

```text
server.ts              # Servidor Express e rotas principais
src/App.tsx            # Interface principal
src/components/        # Telas e blocos reutilizaveis
src/server/db.ts       # Persistencia em PostgreSQL/Supabase
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

