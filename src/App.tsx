/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Lecture } from "./types";
import Dashboard from "./components/Dashboard";
import LectureView from "./components/LectureView";
import RecallStage from "./components/RecallStage";
import { BookOpen, Sparkles, User, LogOut, Check, AlertCircle, X, LogIn, Lock, Mail, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"dashboard" | "lecture" | "recall">("dashboard");
  const [recallMode, setRecallMode] = useState<"flashcards" | "quiz">("flashcards");

  // Theme state synchronized with Tailwind class lists (Claro e Escuro)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("newstudy_theme");
      return (saved === "light" || saved === "dark") ? saved : "dark"; // Default to dark theme
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("newstudy_theme", theme);
    } catch (err) {
      console.warn("Storage saving failed:", err);
    }
  }, [theme]);

  // Load state helpers
  const [isAdding, setIsAdding] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  // Authentication states
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem("newstudy_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Verify and recover active cookie sessions on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem("newstudy_user", JSON.stringify(data.user));
          }
        }
      } catch (err) {
        console.warn("Nenhum cookie de sessão ativo encontrado no carregamento.", err);
      }
    };
    restoreSession();
  }, []);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Fetch all monographs (optionally scoped by current logged in user)
  const fetchLectures = async () => {
    try {
      const url = user ? `/api/lectures?userId=${user.id}` : "/api/lectures";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLectures(data);
      }
    } catch (err) {
      console.error("Ops! Erro ao carregar a lista de materiais de estudos:", err);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, [user]);

  // Polling helper: if there are lectures with "ANALYZING" status, poll every 2 seconds to check progress
  useEffect(() => {
    const hasAnalyzing = lectures.some((l) => l.status === "ANALYZING");
    if (!hasAnalyzing) return;

    const interval = setInterval(() => {
      fetchLectures();
    }, 2000);

    return () => clearInterval(interval);
  }, [lectures]);

  // Actions routing
  const handleSelectLecture = (id: string) => {
    setSelectedLectureId(id);
    setCurrentView("lecture");
  };

  const handleAddLecture = async (lectureUrl: string, topicHint: string) => {
    setIsAdding(true);
    try {
      const res = await fetch("/api/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: lectureUrl,
          topicHint,
          userId: user ? user.id : "anonymous"
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro ao adicionar material.");
      }

      await fetchLectures();
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteLecture = async (id: string) => {
    try {
      const res = await fetch(`/api/lectures/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLectures((prev) => prev.filter((l) => l.id !== id));
        if (selectedLectureId === id) {
          setSelectedLectureId(null);
          setCurrentView("dashboard");
        }
      }
    } catch (err) {
      console.error("Erro ao remover o módulo de estudo:", err);
    }
  };

  const handleUpdateFlashcard = async (
    flashcardId: string,
    difficulty?: "easy" | "good" | "hard",
    reviewState?: boolean
  ) => {
    if (!selectedLectureId) return;
    try {
      const res = await fetch(`/api/lectures/${selectedLectureId}/flashcards/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flashcardId, difficulty, reviewState }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state directly
        setLectures((prev) => prev.map((l) => (l.id === selectedLectureId ? data.lecture : l)));
      }
    } catch (err) {
      console.error("Não foi possível persistir as alterações da revisão:", err);
    }
  };

  const handleAskQuestion = async (question: string) => {
    if (!selectedLectureId) return;
    setIsResponding(true);
    try {
      const res = await fetch(`/api/lectures/${selectedLectureId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (res.ok) {
        const data = await res.json();
        setLectures((prev) =>
          prev.map((l) =>
            l.id === selectedLectureId ? { ...l, chatHistory: data.chatHistory } : l
          )
        );
      }
    } catch (err) {
      console.error("Incapaz de acessar a inteligência artificial:", err);
    } finally {
      setIsResponding(false);
    }
  };

  // Auth Operations
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const endpoint = authTab === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = authTab === "login"
        ? { email: authEmail, password: authPassword }
        : { name: authName, email: authEmail, password: authPassword };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Operação falhou. Verifique as credenciais.");
      }

      if (data.user) {
        setUser(data.user);
        localStorage.setItem("newstudy_user", JSON.stringify(data.user));
        setIsAuthOpen(false);
        // Clean inputs
        setAuthEmail("");
        setAuthPassword("");
        setAuthName("");
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Falha ao invalidar cookies no logout:", err);
    }
    setUser(null);
    localStorage.removeItem("newstudy_user");
    setSelectedLectureId(null);
    setCurrentView("dashboard");
  };

  const activeLecture = lectures.find((l) => l.id === selectedLectureId);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 transition-colors duration-200 flex flex-col justify-between font-sans">
      
      {/* Redesenhado: Header de Alto Padrão em Violeta Sólido com Elementos de Vidro */}
      <header className="bg-[#7C3AED] sticky top-0 z-30 transition-all shadow-md select-none">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          
          <div
            onClick={() => setCurrentView("dashboard")}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="h-9 w-9 bg-neutral-950 text-white rounded-xl flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white font-sans leading-none">
                NewStudy
              </span>
              <span className="text-[10px] text-white/80 font-medium font-sans mt-0.5">
                Material Inteligente
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Toggler de Tema Translúcido (Claro / Escuro) */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 bg-white/5 border border-white/15 transition-all cursor-pointer shadow-xs shrink-0"
              title={theme === "dark" ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 30, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4.5 w-4.5 text-white" />
                  ) : (
                    <Moon className="h-4.5 w-4.5 text-white" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Widget de Informações / Sessão do Estudante */}
            {user ? (
              <div className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 py-1 px-4 rounded-full transition-all">
                <div className="h-7 w-7 rounded-full bg-[#3B82F6] text-white text-xs font-bold flex items-center justify-center uppercase shadow-inner select-none">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col items-start leading-none gap-0.5">
                  <span className="text-xs font-bold text-white text-left">
                    {user.name}
                  </span>
                  <span className="text-[9px] text-[#A78BFA] font-mono font-medium">estudante</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 hover:text-red-300 text-white/80 rounded-lg hover:bg-white/10 transition-all cursor-pointer ml-1"
                  title="Sair da Conta"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthTab("login");
                  setAuthError(null);
                  setIsAuthOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:bg-white/15 bg-white/5 border border-white/20 px-4 py-2 rounded-full transition-colors cursor-pointer"
              >
                <User className="h-3.5 w-3.5 text-white" />
                <span>Entrar / Cadastrar</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Roteador da Área de Trabalho Principal */}
      <main className="flex-1 pb-16">
        {currentView === "dashboard" && (
          <Dashboard
            lectures={lectures}
            onSelectLecture={handleSelectLecture}
            onAddLecture={handleAddLecture}
            onDeleteLecture={handleDeleteLecture}
            isAdding={isAdding}
          />
        )}

        {currentView === "lecture" && activeLecture && (
          <LectureView
            lecture={activeLecture}
            onBack={() => setCurrentView("dashboard")}
            onLaunchRecall={(mode) => {
              setRecallMode(mode);
              setCurrentView("recall");
            }}
            onAskQuestion={handleAskQuestion}
            isResponding={isResponding}
          />
        )}

        {currentView === "recall" && activeLecture && (
          <RecallStage
            lecture={activeLecture}
            mode={recallMode}
            onBack={() => setCurrentView("lecture")}
            onUpdateFlashcard={handleUpdateFlashcard}
          />
        )}
      </main>

      {/* Footer minimalista em Português */}
      <footer className="border-t border-neutral-200/60 dark:border-neutral-900 py-6 text-center text-xs text-neutral-450 dark:text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; 2026 Plataforma NewStudy. Todos os direitos reservados.</span>
          <span className="flex items-center gap-1 opacity-80">
            <Sparkles className="h-3 w-3 text-brand-mint" /> Desenvolvido com Gemini AI & PostgreSQL
          </span>
        </div>
      </footer>

      {/* Sleek, Center-Popup Modal de Autenticação Dual-Tab */}
      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop com blur sofisticado */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthOpen(false)}
              className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 lg:p-8 w-full max-w-md shadow-2xl relative z-10 flex flex-col gap-6"
            >
              <button
                onClick={() => setIsAuthOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded-2xl mb-3 shadow-md">
                  <User className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                  {authTab === "login" ? "Acesse sua conta estagiada" : "Crie seu deck acadêmico"}
                </h3>
                <p className="text-xs text-neutral-500 mt-1 font-light">
                  {authTab === "login"
                    ? "Conecte-se para puxar seus resumos de aulas salvos."
                    : "Guarde seus materiais individuais de forma privada."}
                </p>
              </div>

              {/* Seletor de Abas */}
              <div className="grid grid-cols-2 bg-neutral-100 dark:bg-neutral-805/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setAuthTab("login"); setAuthError(null); }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    authTab === "login"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm"
                      : "text-neutral-450 dark:text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab("register"); setAuthError(null); }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    authTab === "register"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm"
                      : "text-neutral-450 dark:text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  Criar Conta
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                {authTab === "register" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 font-mono tracking-wider uppercase">
                      Nome de Estudante
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: Matheus Vasconcelos"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full text-xs py-3 pl-9 pr-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-805 text-neutral-900 dark:text-neutral-150 focus:outline-none focus:border-neutral-900 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 font-mono tracking-wider uppercase">
                    E-mail Institucional ou Pessoal
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="Ex: estudante@newstudy.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full text-xs py-3 pl-9 pr-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-805 text-neutral-900 dark:text-neutral-150 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 font-mono tracking-wider uppercase">
                    Senha de Segurança
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                    <input
                      type="password"
                      required
                      placeholder="No mínimo 6 caracteres"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full text-xs py-3 pl-9 pr-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-805 text-neutral-900 dark:text-neutral-150 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </div>
                </div>

                {authError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs bg-red-500/5 border border-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                    <span>{authError}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 mt-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  {authLoading ? (
                    <div className="h-4 w-4 border-2 border-neutral-300 dark:border-neutral-600 border-t-white dark:border-t-black rounded-full animate-spin" />
                  ) : authTab === "login" ? (
                    <>
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Conectar ao Sistema</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Criar Cadastro Acadêmico</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
