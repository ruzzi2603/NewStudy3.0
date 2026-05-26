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

// Helper to parse cookies from document or request headers
function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts.shift()?.trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join("="));
    }
  });
  return list;
}

function getSessionIdentifier(req: Request): { identifier: string; ip: string; sessionId: string | null } {
  const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown-ip";
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies["newstudy_session"] || null;
  return {
    identifier: sessionId || `ip-${ip}`,
    ip,
    sessionId,
  };
}

// Helper to hash passwords securely using PBKDF2 with dynamic salting (Criptografia de senhas)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

// Verify salted secure hash or legacy plain SHA256 hashes for backward compatibility
function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash.includes(":")) {
    const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
    return storedHash === legacyHash;
  }
  const [salt, hashValue] = storedHash.split(":");
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return testHash === hashValue;
}

// Custom in-memory sliding-window rate limiter builder
function rateLimiter(limitPerMinute = 60, customMessage?: string) {
  const ipTracker = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown-ip";
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
      const cookies = parseCookies(req.headers.cookie);
      const sessionId = cookies["newstudy_session"];
      if (!sessionId) {
        return res.status(401).json({ error: "Sessão expirada ou não autenticada por cookies." });
      }

      const user = await getUserById(sessionId);
      if (!user) {
        return res.status(401).json({ error: "Usuário da sessão não foi localizado." });
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
      const { name, email, password } = req.body;
      const { ip } = getSessionIdentifier(req);

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

      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Este endereço de email já está sendo utilizado por outro cadastro." });
      }

      const newUser: User = {
        id: `user-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString()
      };

      await createNewUser(newUser);
      incrementRegistration(ip);

      // Save session inside browser cookies (with SameSite=None; Secure in case of iframe development context)
      res.setHeader(
        "Set-Cookie",
        `newstudy_session=${newUser.id}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=31536000`
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

      // Save session inside browser cookies (SameSite=None; Secure for secure cross-site delivery in iframe)
      res.setHeader(
        "Set-Cookie",
        `newstudy_session=${user.id}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=31536000`
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
    res.setHeader(
      "Set-Cookie",
      "newstudy_session=; Path=/; HttpOnly; Secure; SameSite=None; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    );
    res.json({ success: true });
  });

  // --- STUDY MONOGRAPHS API Endpoints (scoped optionally by userId) ---

  // Get active system quotas and statistics
  app.get("/api/usage/statistics", async (req: Request, res: Response) => {
    try {
      const { identifier, ip, sessionId } = getSessionIdentifier(req);
      const currentLectures = await getLectures(sessionId || "system");
      const savedCount = currentLectures.filter(l => l.userId !== "system").length;
      const summary = getUsageSummary(identifier, ip, savedCount);
      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: "Erro ao carregar estatísticas e cotas: " + err.message });
    }
  });

  // Get all lectures
  app.get("/api/lectures", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId?.toString();
      const lectures = await getLectures(userId);
      res.json(lectures);
    } catch (err: any) {
      res.status(500).json({ error: "Não foi possível recuperar a lista de módulos de estudo: " + err.message });
    }
  });

  // Get single lecture
  app.get("/api/lectures/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const lecture = await getLecture(id);
      if (!lecture) {
        return res.status(404).json({ error: "Módulo de estudo não encontrado." });
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

      const lecture = await getLecture(id);
      if (!lecture) {
        return res.status(404).json({ error: "Módulo de estudo correspondente não encontrado." });
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
      const { identifier } = getSessionIdentifier(req);

      const qstLimit = checkQuestionLimit(identifier);
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

      // Call Gemini API client to ask
      const answer = await askQuestionAboutLecture(lecture, question, lecture.chatHistory || []);

      // Append user & AI messages
      const timestamp = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const userMsg = { sender: "user" as const, text: question, timestamp };
      const aiMsg = { sender: "ai" as const, text: answer, timestamp };

      if (!lecture.chatHistory) {
        lecture.chatHistory = [];
      }
      lecture.chatHistory.push(userMsg, aiMsg);

      await saveLecture(lecture);
      incrementQuestion(identifier);
      res.json({ answer, chatHistory: lecture.chatHistory });
    } catch (err: any) {
      console.error("Q&A Error:", err);
      res.status(500).json({ error: "Falha na resposta do assistente: " + err.message });
    }
  });

  // Strict rate limit on expensive AI generation requests (capped at 5 per minute per IP)
  app.post("/api/lectures", rateLimiter(5, "Você atingiu o limite de geração de novos materiais (max 5/min). Por favor, aguarde alguns instantes."), async (req: Request, res: Response) => {
    try {
      const { url, topicHint, userId } = req.body;
      const { identifier, sessionId } = getSessionIdentifier(req);

      // Check active deck space (max 15 elements to prevent database bloat)
      const currentLectures = await getLectures(userId || sessionId || "system");
      const savedCount = currentLectures.filter(l => l.userId !== "system").length;
      if (savedCount >= 15) {
        return res.status(403).json({
          error: "Limite de Segurança Excedido: Seu deck pessoal possui o limite máximo de 15 módulos de estudo carregados simultaneamente. Exclua um módulo antigo da sua biblioteca antes de gerar outro."
        });
      }

      // Check day limit window
      const genLimit = checkGenerationLimit(identifier);
      if (!genLimit.allowed) {
        return res.status(429).json({
          error: `Quota de Estudos Excedida: Limite diário de inteligência artificial atingido (${genLimit.limit} gerações/dia). Suas quotas serão limpas em ${genLimit.resetHours}h.`
        });
      }

      if (!url) {
        return res.status(400).json({ error: "A URL oficial do vídeo/módulo é obrigatória para processamento quântico." });
      }

      // Register generation click
      incrementGeneration(identifier);

      const newId = `lecture-${Date.now()}`;
      
      const newLecture: Lecture = {
        id: newId,
        userId: userId || "system",
        title: topicHint || "Analisando Novo Conteúdo com Inteligência Artificial...",
        sourceUrl: url,
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
          const generatedData = await generateLectureStudyMaterial(url, topicHint);

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
