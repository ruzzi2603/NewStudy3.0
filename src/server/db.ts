/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import pg from "pg";
import { ChatMessage, Flashcard, Formula, Lecture, QuizQuestion, TranscriptSegment, User } from "../types.js";

type LectureDbRow = {
  is_active?: boolean;
  moderation_note?: string | null;
  data: Lecture;
};

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeFlashcards(value: unknown, lectureId: string): Flashcard[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item, index): Flashcard => {
      const question = asString(item.question, asString(item.front));
      const answer = asString(item.answer, asString(item.back));
      const difficulty =
        item.difficulty === "easy" || item.difficulty === "good" || item.difficulty === "hard"
          ? (item.difficulty as Flashcard["difficulty"])
          : undefined;
      return {
        id: asString(item.id, `fc-${lectureId}-${index}`),
        question,
        answer,
        difficulty,
        reviewState: typeof item.reviewState === "boolean" ? item.reviewState : false,
      };
    })
    .filter((item) => item.question.length > 0 || item.answer.length > 0);
}

function normalizeQuizzes(value: unknown, lectureId: string): QuizQuestion[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item, index) => {
      const options = Array.isArray(item.options)
        ? item.options.filter((option): option is string => typeof option === "string")
        : [];
      const correctAnswerIndex =
        typeof item.correctAnswerIndex === "number" && Number.isFinite(item.correctAnswerIndex)
          ? item.correctAnswerIndex
          : 0;
      return {
        id: asString(item.id, `q-${lectureId}-${index}`),
        question: asString(item.question),
        options,
        correctAnswerIndex,
        explanation: asString(item.explanation),
      };
    })
    .filter((item) => item.question.length > 0 && item.options.length > 0);
}

function normalizeLecture(raw: unknown): Lecture {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, any>;
  const id = asString(input.id, `lecture-${Date.now()}`);
  const keyConcept = input.keyConcept && typeof input.keyConcept === "object" ? input.keyConcept : {};

  return {
    id,
    userId: asString(input.userId, asString(input.user_id, "system")),
    title: asString(input.title, "Material de estudo"),
    sourceUrl: asString(input.sourceUrl, asString(input.source_url)),
    category: asString(input.category, "Estudo Geral"),
    moduleName: asString(input.moduleName, asString(input.module_name, "Geral")),
    duration: asString(input.duration, "00:00"),
    status: input.status === "ANALYZING" || input.status === "FAILED" ? input.status : "READY",
    progress: typeof input.progress === "number" ? Math.max(0, Math.min(100, input.progress)) : 100,
    summaryShort: asString(input.summaryShort, asString(input.summary_short)),
    summaryFull: asString(input.summaryFull, asString(input.summary_full)),
    learningObjectives: asStringArray(input.learningObjectives || input.learning_objectives),
    keyConcept: {
      title: asString(keyConcept.title, "Conceito chave"),
      body: asString(keyConcept.body, asString(keyConcept.description)),
    },
    transcriptionSegments: Array.isArray(input.transcriptionSegments)
      ? (input.transcriptionSegments as TranscriptSegment[])
      : [],
    formulas: Array.isArray(input.formulas) ? (input.formulas as Formula[]) : [],
    flashcards: normalizeFlashcards(input.flashcards, id),
    quizzes: normalizeQuizzes(input.quizzes, id),
    chatHistory: Array.isArray(input.chatHistory) ? (input.chatHistory as ChatMessage[]) : [],
    createdAt: asString(input.createdAt, asString(input.created_at, new Date().toISOString())),
  };
}

let isPgConnected = false;
let pgPool: pg.Pool | null = null;

function getPool(): pg.Pool | null {
  if (pgPool) return pgPool;

  const pgConnectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.PG_DATABASE_URL;
  const pgHost = process.env.PGHOST || process.env.DB_HOST;

  if (!pgConnectionString && !pgHost) {
    return null;
  }

  try {
    const isLocalHost = pgConnectionString
      ? pgConnectionString.includes("localhost") || pgConnectionString.includes("127.0.0.1")
      : pgHost === "localhost" || pgHost === "127.0.0.1";
    const useSSL = pgConnectionString ? !isLocalHost : pgHost !== "localhost" && pgHost !== "127.0.0.1";

    const config: pg.PoolConfig = pgConnectionString
      ? {
          connectionString: pgConnectionString,
          ssl: useSSL ? { rejectUnauthorized: false } : undefined,
        }
      : {
          host: pgHost,
          user: process.env.PGUSER || process.env.DB_USER,
          password: process.env.PGPASSWORD || process.env.DB_PASSWORD,
          database: process.env.PGDATABASE || process.env.DB_NAME,
          port: parseInt(process.env.PGPORT || "5432", 10),
          ssl: useSSL ? { rejectUnauthorized: false } : undefined,
        };

    pgPool = new pg.Pool({
      ...config,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    console.log("[Postgres] Tentando conexao com o banco de dados remoto...");
    return pgPool;
  } catch (err) {
    console.error("[Postgres] Falha ao configurar Pool.", err);
    return null;
  }
}

async function requirePool(): Promise<pg.Pool> {
  const pool = getPool();
  if (!pool) {
    throw new Error("DATABASE_URL/DIRECT_URL nao configurado ou banco remoto indisponivel.");
  }
  if (!isPgConnected) {
    await initializeDatabase();
  }
  if (!pgPool) {
    throw new Error("Falha ao inicializar conexao com o banco remoto.");
  }
  return pgPool;
}

export async function initializeDatabase() {
  const pool = getPool();
  if (!pool) {
    throw new Error("DATABASE_URL/DIRECT_URL nao configurado ou banco remoto indisponivel.");
  }

  try {
    const client = await pool.connect();
    isPgConnected = true;
    console.log("[Postgres] Conectado com sucesso ao banco PostgreSQL!");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        accepted_legal_version VARCHAR(50),
        accepted_legal_at TIMESTAMP WITH TIME ZONE
      );
    `);

    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS accepted_legal_version VARCHAR(50);`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS accepted_legal_at TIMESTAMP WITH TIME ZONE;`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS lectures (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        data JSONB NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        moderation_note TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`ALTER TABLE lectures ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;`);
    await client.query(`ALTER TABLE lectures ADD COLUMN IF NOT EXISTS moderation_note TEXT;`);
    await client.query(`ALTER TABLE lectures ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`);

    client.release();
    console.log("[Postgres] Tabelas 'users' e 'lectures' verificadas/criadas com sucesso.");
  } catch (err) {
    isPgConnected = false;
    throw err;
  }
}

export async function getLectures(userId?: string): Promise<Lecture[]> {
  const pool = await requirePool();
  const query = userId
    ? "SELECT data FROM lectures WHERE (user_id = $1 OR user_id = 'system') AND is_active = TRUE ORDER BY created_at DESC"
    : "SELECT data FROM lectures WHERE is_active = TRUE ORDER BY created_at DESC";
  const values = userId ? [userId] : [];
  const res = await pool.query(query, values);
  return res.rows.map((row) => normalizeLecture(row.data));
}

export async function getLecture(id: string): Promise<Lecture | null> {
  const pool = await requirePool();
  const res = await pool.query("SELECT data, is_active FROM lectures WHERE id = $1", [id]);
  if (res.rows.length === 0) {
    return null;
  }
  if (res.rows[0].is_active === false) {
    return null;
  }
  return normalizeLecture(res.rows[0].data);
}

export async function saveLecture(lecture: Lecture): Promise<void> {
  const pool = await requirePool();
  const normalizedLecture = normalizeLecture(lecture);
  const targetUserId = normalizedLecture.userId || "system";
  const exists = await pool.query("SELECT id, is_active, moderation_note FROM lectures WHERE id = $1", [normalizedLecture.id]);

  if (exists.rows.length > 0) {
    const existingRow = exists.rows[0] as LectureDbRow;
    await pool.query(
      "UPDATE lectures SET user_id = $1, data = $2, is_active = $3, moderation_note = $4, updated_at = NOW() WHERE id = $5",
      [
        targetUserId,
        JSON.stringify(normalizedLecture),
        existingRow.is_active !== false,
        existingRow.moderation_note ?? null,
        normalizedLecture.id,
      ]
    );
    return;
  }

  await pool.query(
    "INSERT INTO lectures (id, user_id, data, is_active, moderation_note, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())",
    [
      normalizedLecture.id,
      targetUserId,
      JSON.stringify(normalizedLecture),
      true,
      null,
      normalizedLecture.createdAt || new Date().toISOString(),
    ]
  );
}

export async function deleteLecture(id: string): Promise<void> {
  const pool = await requirePool();
  await pool.query("DELETE FROM lectures WHERE id = $1", [id]);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const pool = await requirePool();
  const normEmail = email.toLowerCase().trim();
  const res = await pool.query(
    "SELECT id, name, email, password_hash as \"passwordHash\", created_at as \"createdAt\", accepted_legal_version as \"acceptedLegalVersion\", accepted_legal_at as \"acceptedLegalAt\" FROM users WHERE email = $1",
    [normEmail]
  );
  return res.rows[0] ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const pool = await requirePool();
  const res = await pool.query(
    "SELECT id, name, email, password_hash as \"passwordHash\", created_at as \"createdAt\", accepted_legal_version as \"acceptedLegalVersion\", accepted_legal_at as \"acceptedLegalAt\" FROM users WHERE id = $1",
    [id]
  );
  return res.rows[0] ?? null;
}

export async function createNewUser(user: User): Promise<void> {
  const pool = await requirePool();
  await pool.query(
    "INSERT INTO users (id, name, email, password_hash, created_at, accepted_legal_version, accepted_legal_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [
      user.id,
      user.name,
      user.email.toLowerCase().trim(),
      user.passwordHash,
      user.createdAt,
      user.acceptedLegalVersion ?? null,
      user.acceptedLegalAt ?? null,
    ]
  );
}

export function readDb(): never {
  throw new Error("db.json foi descontinuado. Use o banco PostgreSQL/Supabase.");
}

export function writeDb(_data: unknown): never {
  throw new Error("db.json foi descontinuado. Use o banco PostgreSQL/Supabase.");
}
