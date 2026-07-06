/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import {
  initializeDatabase,
  getLectures,
  getLecture,
  saveLecture,
  deleteLecture,
  getUserByEmail,
  getUserById,
  createNewUser
} from "./src/server/db.js";
import { generateLectureStudyMaterial, askQuestionAboutLecture } from "./src/server/ai.js";
import { Lecture, User } from "./src/types.js";
import { validateYouTubeUrl } from "./src/utils/youtube.js";
import {
  checkGenerationLimit,
  incrementGeneration,
  checkQuestionLimit,
  incrementQuestion,
  checkRegistrationLimit,
  incrementRegistration,
  getUsageSummary,
} from "./src/server/limits.js";

// Polyfill dotenv just in case
import dotenv from "dotenv";
dotenv.config();

const SESSION_COOKIE = "newstudy_session";
const GUEST_COOKIE = "newstudy_guest";
const DEFAULT_SESSION_SECRET = "newstudy-dev-session-secret";
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.DJANGO_SECRET_KEY ||
  DEFAULT_SESSION_SECRET;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const PASSWORD_ALGORITHM = "pbkdf2_sha512";
const PASSWORD_ITERATIONS = 210_000;

type SessionPayload = {
  type: "user" | "guest";
  sub: string;
  iat: number;
};

type RequestActor = {
  userId: string;
  identifier: string;
  ip: string;
  authenticated: boolean;
};

if (IS_PRODUCTION && SESSION_SECRET === DEFAULT_SESSION_SECRET) {
  console.warn(
    "[NewStudy Security] SESSION_SECRET nao foi definido. Configure um segredo forte antes de producao."
  );
}

// Helper to parse cookies from document or request headers
function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts.shift()?.trim();
    if (name) {
      try {
        list[name] = decodeURIComponent(parts.join("="));
      } catch {
        list[name] = parts.join("=");
      }
    }
  });
  return list;
}

function getRequestIp(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }
  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0].split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown-ip";
}

function timingSafeEqualString(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && crypto.timingSafeEqual(aBuffer, bBuffer);
}

function signPayload(payload: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
}

function createSignedToken(payload: Omit<SessionPayload, "iat">): string {
  const encodedPayload = Buffer.from(
    JSON.stringify({ ...payload, iat: Date.now() })
  ).toString("base64url");
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

function verifySignedToken(token: string | undefined): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = signPayload(encodedPayload);
  if (!timingSafeEqualString(signature, expectedSignature)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8"));
    if (
      (parsed.type === "user" || parsed.type === "guest") &&
      typeof parsed.sub === "string" &&
      parsed.sub.length > 0
    ) {
      return parsed as SessionPayload;
    }
  } catch {
    return null;
  }
  return null;
}

function serializeCookie(name: string, value: string, maxAgeSeconds: number): string {
  const sameSite = IS_PRODUCTION ? "None" : "Lax";
  const secure = IS_PRODUCTION ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${maxAgeSeconds}${secure}`;
}

function serializeExpiredCookie(name: string): string {
  const sameSite = IS_PRODUCTION ? "None" : "Lax";
  const secure = IS_PRODUCTION ? "; Secure" : "";
  return `${name}=; Path=/; HttpOnly; SameSite=${sameSite}; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`;
}

function appendCookie(res: Response, cookie: string): void {
  const current = res.getHeader("Set-Cookie");
  if (!current) {
    res.setHeader("Set-Cookie", cookie);
  } else if (Array.isArray(current)) {
    res.setHeader("Set-Cookie", [...current.map(String), cookie]);
  } else {
    res.setHeader("Set-Cookie", [String(current), cookie]);
  }
}

function getSignedUserId(req: Request): string | null {
  const cookies = parseCookies(req.headers.cookie);
  const session = verifySignedToken(cookies[SESSION_COOKIE]);
  return session?.type === "user" ? session.sub : null;
}

function getActor(req: Request, res?: Response, issueGuest = false): RequestActor {
  const ip = getRequestIp(req);
  const cookies = parseCookies(req.headers.cookie);

  const session = verifySignedToken(cookies[SESSION_COOKIE]);
  if (session?.type === "user") {
    return {
      userId: session.sub,
      identifier: session.sub,
      ip,
      authenticated: true,
    };
  }

  let guest = verifySignedToken(cookies[GUEST_COOKIE]);
  if (!guest && issueGuest && res) {
    guest = {
      type: "guest",
      sub: `guest-${crypto.randomBytes(12).toString("hex")}`,
      iat: Date.now(),
    };
    appendCookie(
      res,
      serializeCookie(
        GUEST_COOKIE,
        createSignedToken({ type: "guest", sub: guest.sub }),
        60 * 60 * 24 * 30
      )
    );
  }

  if (guest?.type === "guest") {
    return {
      userId: guest.sub,
      identifier: guest.sub,
      ip,
      authenticated: false,
    };
  }

  return {
    userId: "system",
    identifier: `ip-${ip}`,
    ip,
    authenticated: false,
  };
}

function canReadLecture(actor: RequestActor, lecture: Lecture): boolean {
  return lecture.userId === "system" || lecture.userId === actor.userId;
}

function canMutateLecture(actor: RequestActor, lecture: Lecture): boolean {
  return lecture.userId === actor.userId && lecture.userId !== "system";
}

// Helper to hash passwords securely using PBKDF2 with dynamic salting (Criptografia de senhas)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, 64, "sha512")
    .toString("hex");
  return `${PASSWORD_ALGORITHM}$${PASSWORD_ITERATIONS}$${salt}$${hash}`;
}

// Verify salted secure hash or legacy plain SHA256 hashes for backward compatibility
function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash.startsWith(`${PASSWORD_ALGORITHM}$`)) {
    const [, iterationsRaw, salt, hashValue] = storedHash.split("$");
    const iterations = Number(iterationsRaw);
    if (!Number.isFinite(iterations) || !salt || !hashValue) return false;
    const testHash = crypto
      .pbkdf2Sync(password, salt, iterations, 64, "sha512")
      .toString("hex");
    return timingSafeEqualString(testHash, hashValue);
  }

  if (!storedHash.includes(":")) {
    const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
    return timingSafeEqualString(storedHash, legacyHash);
  }
  const [salt, hashValue] = storedHash.split(":");
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return timingSafeEqualString(testHash, hashValue);
}

// Custom in-memory sliding-window rate limiter builder
function rateLimiter(limitPerMinute = 60, customMessage?: string) {
  const ipTracker = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getRequestIp(req);
    const now = Date.now();
    const entry = ipTracker.get(ip);

    if (!entry || now > entry.resetTime) {
      ipTracker.set(ip, {
        count: 1,
        resetTime: now + 60 * 1000, // 1 minute window
      });
      res.setHeader("X-RateLimit-Limit", limitPerMinute);
      res.setHeader("X-RateLimit-Remaining", limitPerMinute - 1);
      return next();
    }

    if (entry.count >= limitPerMinute) {
      const waitSeconds = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader("Retry-After", waitSeconds);
      return res.status(429).json({
        error: customMessage || `Muitas requisições detectadas. Por favor, aguarde ${waitSeconds} segundos antes de tentar novamente.`
      });
    }

    entry.count += 1;
    res.setHeader("X-RateLimit-Limit", limitPerMinute);
    res.setHeader("X-RateLimit-Remaining", limitPerMinute - entry.count);
    next();
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize persistent database tables
  await initializeDatabase();

  // Apply general global API rate limiter (120 reqs/min)
  app.use("/api/", rateLimiter(120));

  // --- AUTH ENDPOINTS ---

  // Recover active session from cookies
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const sessionUserId = getSignedUserId(req);
      if (!sessionUserId) {
        return res.json({ user: null });
      }

      const user = await getUserById(sessionUserId);
      if (!user) {
        return res.json({ user: null });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: "Erro interno ao restaurar sessão pelo cookie: " + err.message });
    }
  });

  // User Registration
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        password,
        acceptedTerms,
        acceptedLegalVersion,
      } = req.body;
      const { ip } = getActor(req);

      const regLimit = checkRegistrationLimit(ip);
      if (!regLimit.allowed) {
        return res.status(429).json({
          error: `Limite de inscrições diárias excedido segurança de rede (max ${regLimit.limit} contas diárias). Por favor, tente novamente em ${regLimit.resetHours}h ou utilize outra rede.`
        });
      }

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Todos os campos (nome, email e senha) são obrigatórios para a conta." });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "A senha de acesso deve possuir o tamanho mínimo de 6 caracteres." });
      }

      if (acceptedTerms !== true || typeof acceptedLegalVersion !== "string" || acceptedLegalVersion.trim().length === 0) {
        return res.status(400).json({
          error: "Para concluir o cadastro, confirme o aceite dos Termos de Uso, da Política de Privacidade e da Política de Cookies."
        });
      }

      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Este endereço de email já está sendo utilizado por outro cadastro." });
      }

      const newUser: User = {
        id: `user-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
        acceptedTerms: true,
        acceptedLegalVersion: acceptedLegalVersion.trim(),
        acceptedLegalAt: new Date().toISOString(),
        isActive: true,
      };

      await createNewUser(newUser);
      incrementRegistration(ip);

      appendCookie(
        res,
        serializeCookie(
          SESSION_COOKIE,
          createSignedToken({ type: "user", sub: newUser.id }),
          60 * 60 * 24 * 365
        )
      );

      // Return user context safely (excluding hash)
      res.json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: "Erro interno ao cadastrar usuário: " + err.message });
    }
  });

  // User Login Session
  app.post("/api/auth/login", rateLimiter(30, "Muitas tentativas de login consecutivas. Aguarde 60 segundos."), async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Preencha o email e senha correspondentes ao cadastro." });
      }

      const user = await getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "As credenciais inseridas estão incorretas ou não cadastradas." });
      }

      if (!verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ error: "As credenciais inseridas estão incorretas ou não cadastradas." });
      }

      appendCookie(
        res,
        serializeCookie(
          SESSION_COOKIE,
          createSignedToken({ type: "user", sub: user.id }),
          60 * 60 * 24 * 365
        )
      );

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: "Erro interno no processo de login: " + err.message });
    }
  });

  // User Logout Endpoint (clearing cookies)
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    appendCookie(res, serializeExpiredCookie(SESSION_COOKIE));
    res.json({ success: true });
  });

  // --- STUDY MONOGRAPHS API Endpoints (scoped optionally by userId) ---

  // Get active system quotas and statistics
  app.get("/api/usage/statistics", async (req: Request, res: Response) => {
    try {
      const actor = getActor(req, res, true);
      const currentLectures = await getLectures(actor.userId);
      const savedCount = currentLectures.filter((l) => l.userId === actor.userId).length;
      const summary = getUsageSummary(actor.identifier, actor.ip, savedCount);
      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: "Erro ao carregar estatísticas e cotas: " + err.message });
    }
  });

  // Get all lectures
  app.get("/api/lectures", async (req: Request, res: Response) => {
    try {
      const actor = getActor(req, res, true);
      const lectures = await getLectures(actor.userId);
      res.json(lectures);
    } catch (err: any) {
      res.status(500).json({ error: "Não foi possível recuperar a lista de módulos de estudo: " + err.message });
    }
  });

  // Get single lecture
  app.get("/api/lectures/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const actor = getActor(req, res, true);
      const lecture = await getLecture(id);
      if (!lecture) {
        return res.status(404).json({ error: "Módulo de estudo não encontrado." });
      }
      if (!canReadLecture(actor, lecture)) {
        return res.status(403).json({ error: "Voce nao tem acesso a este modulo de estudo." });
      }
      res.json(lecture);
    } catch (err: any) {
      res.status(500).json({ error: "Não foi possível resgatar o módulo: " + err.message });
    }
  });

  // Delete lecture
  app.delete("/api/lectures/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const actor = getActor(req, res, true);
      const lecture = await getLecture(id);
      if (!lecture) {
        return res.status(404).json({ error: "Modulo de estudo nao encontrado." });
      }
      if (!canMutateLecture(actor, lecture)) {
        return res.status(403).json({ error: "Voce so pode remover modulos do seu proprio deck." });
      }
      await deleteLecture(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Falha ao remover o módulo de estudo: " + err.message });
    }
  });

  // Update a flashcard difficulty or marked review state
  app.post("/api/lectures/:id/flashcards/review", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { flashcardId, difficulty, reviewState } = req.body;
      const actor = getActor(req, res, true);

      const lecture = await getLecture(id);
      if (!lecture) {
        return res.status(404).json({ error: "Módulo de estudo correspondente não encontrado." });
      }

      if (!canMutateLecture(actor, lecture)) {
        return res.status(403).json({ error: "Revisoes persistentes so podem alterar modulos do seu proprio deck." });
      }

      const fcIdx = lecture.flashcards.findIndex((fc) => fc.id === flashcardId);
      if (fcIdx === -1) {
        return res.status(404).json({ error: "Flashcard não identificado." });
      }

      if (difficulty !== undefined) {
        lecture.flashcards[fcIdx].difficulty = difficulty;
      }
      if (reviewState !== undefined) {
        lecture.flashcards[fcIdx].reviewState = reviewState;
      }

      await saveLecture(lecture);
      res.json({ success: true, lecture });
    } catch (err: any) {
      res.status(500).json({ error: "Não foi possível persistir a revisão: " + err.message });
    }
  });

  // Ask question about lecture context
  app.post("/api/lectures/:id/ask", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { question } = req.body;
      const actor = getActor(req, res, true);

      const qstLimit = checkQuestionLimit(actor.identifier);
      if (!qstLimit.allowed) {
        return res.status(429).json({
          error: `Controle de Quota: Você atingiu o limite de ${qstLimit.limit} dúvidas diárias com o tutor Inteligente. Suas quotas serão renovadas em ${qstLimit.resetHours}h.`
        });
      }

      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Pergunta de contexto não formulada." });
      }

      const lecture = await getLecture(id);
      if (!lecture) {
        return res.status(404).json({ error: "Conteúdo acadêmico não identificado." });
      }

      if (!canReadLecture(actor, lecture)) {
        return res.status(403).json({ error: "Voce nao tem acesso a este modulo de estudo." });
      }

      // Call Gemini API client to ask
      const answer = await askQuestionAboutLecture(lecture, question, lecture.chatHistory || []);

      // Append user & AI messages
      const timestamp = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const userMsg = { sender: "user" as const, text: question, timestamp };
      const aiMsg = { sender: "ai" as const, text: answer, timestamp };

      if (!lecture.chatHistory) {
        lecture.chatHistory = [];
      }
      const nextChatHistory = [...lecture.chatHistory, userMsg, aiMsg];
      if (canMutateLecture(actor, lecture)) {
        lecture.chatHistory = nextChatHistory;
        await saveLecture(lecture);
      }
      incrementQuestion(actor.identifier);
      res.json({ answer, chatHistory: nextChatHistory });
    } catch (err: any) {
      console.error("Q&A Error:", err);
      res.status(500).json({ error: "Falha na resposta do assistente: " + err.message });
    }
  });

  // Strict rate limit on expensive AI generation requests (capped at 5 per minute per IP)
  app.post("/api/lectures", rateLimiter(5, "Você atingiu o limite de geração de novos materiais (max 5/min). Por favor, aguarde alguns instantes."), async (req: Request, res: Response) => {
    try {
      const { url, topicHint } = req.body;
      const actor = getActor(req, res, true);
      const userId = actor.userId;

      // Check active deck space (max 15 elements to prevent database bloat)
      const currentLectures = await getLectures(userId);
      const savedCount = currentLectures.filter((l) => l.userId === userId).length;
      if (savedCount >= 15) {
        return res.status(403).json({
          error: "Limite de Segurança Excedido: Seu deck pessoal possui o limite máximo de 15 módulos de estudo carregados simultaneamente. Exclua um módulo antigo da sua biblioteca antes de gerar outro."
        });
      }

      // Check day limit window
      const genLimit = checkGenerationLimit(actor.identifier);
      if (!genLimit.allowed) {
        return res.status(429).json({
          error: `Quota de Estudos Excedida: Limite diário de inteligência artificial atingido (${genLimit.limit} gerações/dia). Suas quotas serão limpas em ${genLimit.resetHours}h.`
        });
      }

      const youtubeValidation = validateYouTubeUrl(typeof url === "string" ? url : "");
      if (!youtubeValidation.valid || !youtubeValidation.normalizedUrl) {
        return res.status(400).json({ error: youtubeValidation.message });
      }

      const normalizedUrl = youtubeValidation.normalizedUrl;

      // Register generation click
      incrementGeneration(actor.identifier);

      const newId = `lecture-${Date.now()}`;
      
      const newLecture: Lecture = {
        id: newId,
        userId,
        title: topicHint || "Analisando Novo Conteúdo com Inteligência Artificial...",
        sourceUrl: normalizedUrl,
        category: "Processando...",
        moduleName: "Módulo Dinâmico",
        duration: "00:00",
        status: "ANALYZING",
        progress: 10,
        summaryShort: "Mapeando narrativa e extraindo glossário de tópicos...",
        summaryFull: "Estamos processando a mídia através do Gemini. Por favor, aguarde alguns segundos.",
        learningObjectives: [],
        keyConcept: { title: "Iniciando...", body: "Aguardando estruturação..." },
        transcriptionSegments: [],
        formulas: [],
        flashcards: [],
        quizzes: [],
        chatHistory: [],
        createdAt: new Date().toISOString()
      };

      // Save initial processing stub
      await saveLecture(newLecture);

      // Return immediately so the UI is active and responsive, background does the heavy lifting
      res.json({ success: true, lecture: newLecture });

      // Run progressive processing in the background asynchronously
      (async () => {
        try {
          // Progress simulation benchmarks
          await new Promise((resolve) => setTimeout(resolve, 1500));
          let currentLecture = await getLecture(newId);
          if (currentLecture && currentLecture.status === "ANALYZING") {
            currentLecture.progress = 35;
            currentLecture.summaryShort = "Transcrevendo a narrativa do vídeo e mapeando conceitos educacionais...";
            await saveLecture(currentLecture);
          }

          await new Promise((resolve) => setTimeout(resolve, 1500));
          currentLecture = await getLecture(newId);
          if (currentLecture && currentLecture.status === "ANALYZING") {
            currentLecture.progress = 65;
            currentLecture.summaryShort = "Identificando equações científicas, variáveis e gerando flashcards de memorização...";
            await saveLecture(currentLecture);
          }

          // Trigger powerful AI translation & summary generation safely using @google/genai SDK
          const generatedData = await generateLectureStudyMaterial(normalizedUrl, topicHint);

          currentLecture = await getLecture(newId);
          if (currentLecture && currentLecture.status === "ANALYZING") {
            currentLecture.progress = 90;
            currentLecture.summaryShort = "Estruturando testes diagnósticos interativos de fixação e explicações pedagógicas...";
            await saveLecture(currentLecture);
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
          currentLecture = await getLecture(newId);
          if (currentLecture && currentLecture.status === "ANALYZING") {
            // Apply all successfully processed components at 100%
            const completeLecture: Lecture = {
              ...currentLecture,
              title: generatedData.title || currentLecture.title,
              category: generatedData.category || "Estudo Geral",
              moduleName: generatedData.moduleName || "Geral",
              duration: generatedData.duration || "24:00",
              status: "READY",
              progress: 100,
              summaryShort: generatedData.summaryShort || "Material acadêmico processado com êxito.",
              summaryFull: generatedData.summaryFull || "O material pedagógico e roteiros foram construídos de forma ideal.",
              learningObjectives: generatedData.learningObjectives || [],
              keyConcept: generatedData.keyConcept || { title: "Conceito Chave", body: "Explicação gerada pelo especialista inteligente." },
              transcriptionSegments: generatedData.transcriptionSegments || [],
              formulas: generatedData.formulas || [],
              flashcards: (generatedData.flashcards || []).map((fc: any, index: number) => ({
                id: `fc-${newId}-${index}`,
                question: fc.question,
                answer: fc.answer,
                difficulty: undefined,
                reviewState: false
              })),
              quizzes: (generatedData.quizzes || []).map((q: any, index: number) => ({
                id: `q-${newId}-${index}`,
                question: q.question,
                options: q.options,
                correctAnswerIndex: q.correctAnswerIndex,
                explanation: q.explanation
              })),
            };

            await saveLecture(completeLecture);
            console.log(`[NewStudy API] Geração concluída com sucesso para o ID: ${newId}`);
          }
        } catch (err: any) {
          console.error("[NewStudy API] Falha na análise inteligente em segundo plano:", err);
          const currentLecture = await getLecture(newId);
          if (currentLecture) {
            currentLecture.status = "FAILED";
            currentLecture.progress = 100;
            currentLecture.summaryShort = "Infelizmente, ocorreu um erro de processamento.";
            currentLecture.summaryFull = `Erro retornado pelo servidor do Gemini: ${err.message || err}. Por favor, certifique-se de usar uma chave API válida.`;
            await saveLecture(currentLecture);
          }
        }
      })();

    } catch (err: any) {
      console.error("[NewStudy API] Erro no endpoint principal de material:", err);
      res.status(500).json({ error: "Erro de servidor ao processar o material: " + err.message });
    }
  });

  // --- Vite Dev Middleware or Static Production Build integration ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 [NewStudy Server] Rodando com maestria na URL: http://localhost:${PORT}`);
  });
}

startServer();
