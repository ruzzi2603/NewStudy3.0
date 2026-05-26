/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import pg from "pg";
import { Lecture, User } from "../types.js";

const DB_PATH = path.join(process.cwd(), "db.json");

const defaultLectures: Lecture[] = [
  {
    id: "lecture-1",
    userId: "system",
    title: "Emaranhamento Quântico e Teoria da Informação",
    sourceUrl: "https://www.youtube.com/watch?v=zN_3EAsbyNo",
    category: "Física Avançada",
    moduleName: "Módulo 4",
    duration: "42:15",
    status: "READY",
    progress: 100,
    summaryShort: "Uma imersão profunda nos fundamentos matemáticos do paradoxo EPR e da desigualdade de Bell no contexto da computação quântica moderna.",
    summaryFull: "Esta aula introduz o emaranhamento quântico, explorando o paradoxo EPR que intrigou os fundadores da mecânica quântica, e aprofunda-se na matemática dos Estados de Bell. Analisamos a desigualdade de Bell (formulação CHSH) e demonstramos como violações experimentais do realismo local provam que a informação quântica é distribuída de forma não-local, servindo como recurso essencial para a criptografia e teletransporte quântico.",
    learningObjectives: [
      "Definir a não-localidade na mecânica quântica em comparação ao realismo local clássico",
      "Deduzir e compreender a formulação CHSH da Desigualdade de Bell",
      "Analisar aplicações de emaranhamento na Distribuição de Chaves Quânticas (QKD)"
    ],
    keyConcept: {
      title: "O Estado de Bell",
      body: "Os estados de Bell são quatro estados quânticos específicos e maximamente emaranhados de dois qubits. Eles representam os exemplos mais simples possíveis de emaranhamento quântico."
    },
    transcriptionSegments: [
      { time: "00:00", text: "Bom dia a todos. Hoje vamos mergulhar no que Einstein chamou de 'ação fantasmagórica à distância'. Começaremos com o paradoxo EPR." },
      { time: "04:30", text: "Quando falamos de emaranhamento quântico, não estamos dizendo apenas que as variáveis estão correlacionadas, mas sim que a informação em si está distribuída globalmente pela função de onda." },
      { time: "12:15", text: "Vejamos a matemática dos Estados de Bell. Se tivermos dois qubits em um estado singleto, podemos escrever a função de onda como a superposição de estados de spin anti-correlacionados." },
      { time: "28:50", text: "Em 1964, John Stewart Bell demonstrou que qualquer teoria de variáveis ocultas locais deve satisfazer um limite matemático que deduziremos aqui. A mecânica quântica viola esse limite." },
      { time: "38:00", text: "Em conclusão, esta violação não é um problema, mas sim o recurso central que viabiliza tecnologias que vão desde o teletransporte quântico até a criptografia de grau militar." }
    ],
    formulas: [
      {
        title: "Função de Onda do Estado Singleto",
        latex: "|\\psi^-\\rangle = \\frac{1}{\\sqrt{2}} (|01\\rangle - |10\\rangle)",
        description: "Representa um par de qubits emaranhados com momento angular total nulo. Medir um qubit colapsa instantaneamente o outro no estado oposto.",
        variables: [
          { name: "|\\psi^-\\rangle", explanation: "O vetor de estado do sistema integrado" },
          { name: "|01\\rangle, |10\\rangle", explanation: "Estados base computacionais" }
        ],
        application: "Usado como o principal canal emaranhado no teletransporte quântico e na criptografia E91."
      },
      {
        title: "Desigualdade de Bell (CHSH)",
        latex: "|E(a,b) - E(a,b')| + |E(a',b) + E(a',b')| \\leq 2",
        description: "A desigualdade matemática sob a restrição do realismo local clássico. A mecânica quântica alcança o limite de Tsirelson de 2\\sqrt{2}, provando não-localidade.",
        variables: [
          { name: "E(x,y)", explanation: "Valor esperado das medições conjuntas nos ângulos de detecção x e y" },
          { name: "a, a', b, b'", explanation: "Configurações de ângulo dos detectores de Alice e Bob" }
        ],
        application: "Utilizada em segurança criptográfica para verificar se há um espião interceptando a chave secreta."
      }
    ],
    flashcards: [
      { id: "fc-1-1", question: "O que é emaranhamento quântico?", answer: "Um fenômeno físico onde múltiplas partículas interagem de forma que o estado quântico de cada partícula não pode ser descrito de forma independente das outras." },
      { id: "fc-1-2", question: "Qual limite o realismo local impõe à desigualdade CHSH?", answer: "Sob o realismo local absoluto, o valor da soma CHSH deve ser menor ou igual a 2." },
      { id: "fc-1-3", question: "Qual é a violação máxima quântica da desigualdade CHSH?", answer: "A mecânica quântica pode violar a desigualdade até o valor limite de 2\\sqrt{2} (~2.828), conhecido como limite de Tsirelson." },
      { id: "fc-1-4", question: "Cite uma aplicação prática do Teorema de Bell.", answer: "Protocolos de Distribuição de Chaves Quânticas (QKD) de segurança absoluta como o Ekert91." }
    ],
    quizzes: [
      {
        id: "q-1-1",
        question: "Qual das seguintes alternativas melhor descreve a conclusão do 'Paradoxo EPR' em relação ao realismo local?",
        options: [
          "A mecânica quântica é completa e não-local.",
          "A mecânica quântica deve estar incompleta, pois o realismo local deve ser preservado.",
          "O Teorema de Bell prova que variáveis ocultas físicas devem necessariamente existir."
        ],
        correctAnswerIndex: 1,
        explanation: "Einstein, Podolsky e Rosen argumentaram que a realidade física deveria ser estritamente local e completa. Com isso, as previsões não-locais sugeriam que a teoria quântica estava incompleta."
      },
      {
        id: "q-1-2",
        question: "Qual é o limite clássico para a desigualdade CHSH comparado com o limite quântico de Tsirelson?",
        options: [
          "O limite clássico é 1 e o Quântico é 2",
          "O limite clássico é 2 e o Quântico é 2.82",
          "O limite clássico é 4 e o Quântico é 8"
        ],
        correctAnswerIndex: 1,
        explanation: "Pelo realismo local clássico, o limite CHSH é de no máximo 2. Estados emaranhados violam isso, chegando a até 2\\sqrt{2} ≈ 2.82."
      }
    ],
    chatHistory: [],
    createdAt: new Date().toISOString()
  }
];

// Database structure used for file-based fallback
interface StorageSchema {
  users: User[];
  lectures: Lecture[];
}

let isPgConnected = false;
let pgPool: pg.Pool | null = null;

// Lazy initialize PG pool
function getPool(): pg.Pool | null {
  if (pgPool) return pgPool;

  const pgConnectionString = process.env.PG_DATABASE_URL || process.env.DATABASE_URL;
  const pgHost = process.env.PGHOST || process.env.DB_HOST;

  if (pgConnectionString || pgHost) {
    try {
      const isLocalHost = pgConnectionString && (pgConnectionString.includes("localhost") || pgConnectionString.includes("127.0.0.1"));
      const useSSL = pgConnectionString && !isLocalHost;

      const config: pg.PoolConfig = pgConnectionString
        ? { 
            connectionString: pgConnectionString,
            ssl: useSSL ? { rejectUnauthorized: false } : undefined
          }
        : {
            host: pgHost,
            user: process.env.PGUSER || process.env.DB_USER,
            password: process.env.PGPASSWORD || process.env.DB_PASSWORD,
            database: process.env.PGDATABASE || process.env.DB_NAME,
            port: parseInt(process.env.PGPORT || "5432", 10),
            ssl: pgHost && pgHost !== "localhost" && pgHost !== "127.0.0.1" ? { rejectUnauthorized: false } : undefined
          };

      pgPool = new pg.Pool({
        ...config,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      console.log("🐘 [Postgres] Tentando conexão com o banco de dados remoto...");
      return pgPool;
    } catch (err) {
      console.error("❌ [Postgres] Falha ao configurar Pool. Usando fallback local JSON.", err);
      return null;
    }
  }
  return null;
}

// Check database tables setup
export async function initializeDatabase() {
  const pool = getPool();
  if (!pool) {
    console.log("💾 [Storage] Usando persistência local segura (db.json) como mecanismo principal.");
    setupLocalDb();
    return;
  }

  try {
    const client = await pool.connect();
    isPgConnected = true;
    console.log("✨ [Postgres] Conectado com sucesso ao banco PostgreSQL!");

    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS lectures (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client.release();
    console.log("🛡️ [Postgres] Tabelas 'users' e 'lectures' verificadas/criadas com sucesso.");
  } catch (err) {
    isPgConnected = false;
    console.warn("⚠️ [Postgres] Erro ao conectar ao Postgres local. Ativando fallback db.json para estabilidade do servidor.", err);
    setupLocalDb();
  }
}

// Local file JSON setup helpers
function setupLocalDb() {
  if (!fs.existsSync(DB_PATH)) {
    const defaultData: StorageSchema = {
      users: [],
      lectures: defaultLectures,
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), "utf-8");
  } else {
    // Migrate schema if it's outdated (e.g. only array of lectures)
    try {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.lectures)) {
        if (!parsed.users) {
          parsed.users = [];
          fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), "utf-8");
        }
      } else if (Array.isArray(parsed)) {
        // Old structure was just array of lectures
        const migrated: StorageSchema = {
          users: [],
          lectures: parsed,
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(migrated, null, 2), "utf-8");
      }
    } catch {
      // Re-create if corrupt
      const defaultData: StorageSchema = {
        users: [],
        lectures: defaultLectures,
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), "utf-8");
    }
  }
}

function readLocalDb(): StorageSchema {
  try {
    setupLocalDb();
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { users: [], lectures: defaultLectures };
  }
}

function writeLocalDb(data: StorageSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao escrever no banco local db.json", err);
  }
}

// --- DB INTERFACE EXPORTS WITH FALLBACK ---

// Lectors queries
export async function getLectures(userId?: string): Promise<Lecture[]> {
  if (isPgConnected && pgPool) {
    try {
      const q = userId 
        ? { text: "SELECT data FROM lectures WHERE user_id = $1 ORDER BY created_at DESC", values: [userId] }
        : { text: "SELECT data FROM lectures ORDER BY created_at DESC", values: [] };
      
      const res = await pgPool.query(q.text, q.values);
      const rows = res.rows.map((r) => r.data as Lecture);
      
      // If user specific and empty, append system default lectures so the dashboard has template materials
      if (userId && rows.length === 0) {
        return defaultLectures;
      }
      return rows;
    } catch (err) {
      console.error("[Postgres] Erro em getLectures, usando fallback local.", err);
    }
  }

  // Fallback
  const db = readLocalDb();
  if (userId) {
    const userLectures = db.lectures.filter((l) => l.userId === userId || l.userId === "system");
    return userLectures.length > 0 ? userLectures : db.lectures;
  }
  return db.lectures;
}

export async function getLecture(id: string): Promise<Lecture | null> {
  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query("SELECT data FROM lectures WHERE id = $1", [id]);
      if (res.rows.length > 0) {
        return res.rows[0].data as Lecture;
      }
    } catch (err) {
      console.error("[Postgres] Erro em getLecture, usando fallback local.", err);
    }
  }

  const db = readLocalDb();
  return db.lectures.find((l) => l.id === id) || null;
}

export async function saveLecture(lecture: Lecture): Promise<void> {
  const targetUserId = lecture.userId || "system";
  if (isPgConnected && pgPool) {
    try {
      const exists = await pgPool.query("SELECT id FROM lectures WHERE id = $1", [lecture.id]);
      if (exists.rows.length > 0) {
        await pgPool.query("UPDATE lectures SET data = $1 WHERE id = $2", [JSON.stringify(lecture), lecture.id]);
      } else {
        await pgPool.query(
          "INSERT INTO lectures (id, user_id, data, created_at) VALUES ($1, $2, $3, $4)",
          [lecture.id, targetUserId, JSON.stringify(lecture), lecture.createdAt || new Date().toISOString()]
        );
      }
      return;
    } catch (err) {
      console.error("[Postgres] Erro em saveLecture, usando fallback local.", err);
    }
  }

  const db = readLocalDb();
  const idx = db.lectures.findIndex((l) => l.id === lecture.id);
  if (idx !== -1) {
    db.lectures[idx] = lecture;
  } else {
    db.lectures.unshift(lecture);
  }
  writeLocalDb(db);
}

export async function deleteLecture(id: string): Promise<void> {
  if (isPgConnected && pgPool) {
    try {
      await pgPool.query("DELETE FROM lectures WHERE id = $1", [id]);
      return;
    } catch (err) {
      console.error("[Postgres] Erro em deleteLecture, usando fallback local.", err);
    }
  }

  const db = readLocalDb();
  db.lectures = db.lectures.filter((l) => l.id !== id);
  writeLocalDb(db);
}

// User Accounts queries
export async function getUserByEmail(email: string): Promise<User | null> {
  const normEmail = email.toLowerCase().trim();
  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query("SELECT id, name, email, password_hash as \"passwordHash\", created_at as \"createdAt\" FROM users WHERE email = $1", [normEmail]);
      if (res.rows.length > 0) {
        return res.rows[0] as User;
      }
      return null;
    } catch (err) {
      console.error("[Postgres] Erro em getUserByEmail, usando fallback local.", err);
    }
  }

  const db = readLocalDb();
  return db.users.find((u) => u.email.toLowerCase() === normEmail) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  if (isPgConnected && pgPool) {
    try {
      const res = await pgPool.query("SELECT id, name, email, password_hash as \"passwordHash\", created_at as \"createdAt\" FROM users WHERE id = $1", [id]);
      if (res.rows.length > 0) {
        return res.rows[0] as User;
      }
      return null;
    } catch (err) {
      console.error("[Postgres] Erro em getUserById, usando fallback local.", err);
    }
  }

  const db = readLocalDb();
  return db.users.find((u) => u.id === id) || null;
}

export async function createNewUser(user: User): Promise<void> {
  if (isPgConnected && pgPool) {
    try {
      await pgPool.query(
        "INSERT INTO users (id, name, email, password_hash, created_at) VALUES ($1, $2, $3, $4, $5)",
        [user.id, user.name, user.email.toLowerCase().trim(), user.passwordHash, user.createdAt]
      );
      return;
    } catch (err) {
      console.error("[Postgres] Erro em createNewUser, usando fallback local.", err);
    }
  }

  const db = readLocalDb();
  db.users.push(user);
  writeLocalDb(db);
}

// Kept for backwards compatibility with legacy file-based reads if needed
export function readDb(): StorageSchema {
  return readLocalDb();
}

export function writeDb(data: StorageSchema) {
  writeLocalDb(data);
}
