/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import ScrollDown from "./ScrollDown";
import PromoCarousel from "./PromoCarousel";
import { motion, AnimatePresence } from "motion/react";
import {
  Youtube,
  Search,
  BookOpen,
  Sparkles,
  Play,
  RotateCw,
  Trash2,
  Clock,
  ArrowRight,
  X,
  AlertCircle,
  UserCheck
} from "lucide-react";
import { Lecture } from "../types";
import { validateYouTubeUrl } from "../utils/youtube";

interface DashboardProps {
  lectures: Lecture[];
  onSelectLecture: (id: string) => void;
  onAddLecture: (url: string, topicHint: string) => Promise<void>;
  onDeleteLecture: (id: string) => void;
  isAdding: boolean;
}

export default function Dashboard({
  lectures,
  onSelectLecture,
  onAddLecture,
  onDeleteLecture,
  isAdding,
}: DashboardProps) {
  const [url, setUrl] = useState("");
  const [topicHint, setTopicHint] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dynamic user detection for helper callout
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  interface UsageStatistics {
    lectures: { current: number; limit: number; remaining: number; allowed: boolean };
    generations: { current: number; limit: number; remaining: number; allowed: boolean; resetHours: number };
    chatQuestions: { current: number; limit: number; remaining: number; allowed: boolean; resetHours: number };
    ip: string;
    identifier: string;
  }

  const [usageStats, setUsageStats] = useState<UsageStatistics | null>(null);
  const urlValidation = validateYouTubeUrl(url);

  const fetchUsageStats = async () => {
    try {
      const response = await fetch("/api/usage/statistics");
      if (response.ok) {
        const data = await response.json();
        setUsageStats(data);
      }
    } catch (err) {
      console.error("Erro ao carregar quotas/estatísticas de uso:", err);
    }
  };

  useEffect(() => {
    fetchUsageStats();
  }, [lectures, isAdding]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("newstudy_user");
      if (saved) setUser(JSON.parse(saved));
      else setUser(null);
    } catch {
      setUser(null);
    }

    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem("newstudy_user");
        setUser(saved ? JSON.parse(saved) : null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [lectures]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!urlValidation.valid || !urlValidation.normalizedUrl) {
      setError(urlValidation.message);
      return;
    }
    try {
      await onAddLecture(urlValidation.normalizedUrl, topicHint);
      setUrl("");
      setTopicHint("");
    } catch (err: any) {
      setError(err.message || "Não foi possível gerar os materiais. Verifique sua chave API ou conexão.");
    }
  };

  const filteredLectures = lectures.filter((l) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.summaryShort.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasLectures = lectures.length > 0;

  // Renderizador unificado do painel de importação, reutilizado nos dois layouts
  const renderImporterCard = (isCenteredWidth = false) => {
    return (
      <div
        className={`${
          isCenteredWidth ? "max-w-2xl mx-auto w-full" : "w-full"
        } newstudy-importer-panel bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-850 rounded-2xl p-6 lg:p-8 shadow-sm flex flex-col gap-6 text-left`}
        id="link-processor-panel"
      >
        <div>
          <h2 className="text-[10px]  font-sans tracking-tight text-neutral-900 dark:text-neutral-100 uppercase opacity-90">
            <Youtube className="h-5 w-5 text-red-500 fill-red-500" />
            <span className=" text-[10px] font-sans font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 uppercase opacity-90">Importar Aula do YouTube</span>
          </h2>
          <p className=" tracking-tight text-neutral dark:text-neutral-100 text-xs mt-1 font-sans opacity-85">
            Processamento didático em linguagem natural (PT-BR).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className=" text-[10px] font-sans font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 uppercase opacity-90">
              LINK DO VÍDEO DO YOUTUBE
            </label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`tracking-tight   w-full text-xs py-3 px-3.5 rounded-xl font-sans transition-all ${
                url.trim().length > 0 && !urlValidation.valid
                  ? "border-red-400/80 ring-1 ring-red-400/20"
                  : "border-white/25"
              }`}
                 id="topic-input"
              inputMode="url"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={url.trim().length > 0 && !urlValidation.valid}
            />
            {url.trim().length > 0 && !urlValidation.valid ? (
              <p className="text-[11px] text-red-200/90 leading-5">
                {urlValidation.message}
              </p>
            ) : (
              <p className="text-[11px] tracking-tight text-neutral-900 dark:text-neutral-100 leading-5">
                Aceitamos apenas vídeos do YouTube, como watch, youtu.be, shorts, live ou embed.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className=" text-[10px] font-sans font-semibold tracking-wide  text-neutral-900 dark:text-neutral-100 uppercase opacity-90">
              ASSUNTO OU CURSO DE ASSOCIAÇÃO (RECOMENDADO)
            </label>
            <input
              type="text"
              placeholder="Ex: Física II, Eletrodinâmica, Estruturas de Dados MIT"
              value={topicHint}
              onChange={(e) => setTopicHint(e.target.value)}
              className="tracking-tight   w-full text-xs py-3 px-3.5 rounded-xl font-sans transition-all"
              id="topic-input"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-xs bg-red-500/5 text-red-650 dark:text-red-400 p-3 rounded-xl flex items-center gap-2 border border-red-500/10"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isAdding || !urlValidation.valid}
            className={`w-full text-xs font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isAdding || !urlValidation.valid
                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700  border border-neutral-300 dark:border-neutral-700 shadow-xs hover:scale-[1.01]"
            }`}
            id="analyze-submit-button"
          >
            {isAdding ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin text-brand-mint" />
                <span>Sintetizando Material Temático...</span>
              </>
            ) : (
              <>
                <span>Estruturar Conteúdo com IA</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* CONTROLE DE COTAS DO SISTEMA */}
        <div className="border-t border-neutral-100 dark:border-neutral-850 pt-4 flex flex-col gap-3 font-sans">
          <span className=" font-sans  text-neutral-900 dark:text-neutral-100 opacity-90  text-[10px] tracking-wide uppercase">
            CONTROLE DE COTAS DO SISTEMA :
          </span>

          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between items-center text-[11px]">
              <span className="  text-neutral-900 dark:text-neutral-100 opacity-80">
                Módulos Ativos no Deck
              </span>
              <span className="text-neutral-900 dark:text-neutral-100 font-mono ">
                {usageStats ? `${usageStats.lectures.current} / ${usageStats.lectures.limit}` : "0 / 15"}
              </span>
            </div>
            <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border dark:border-neutral-850">
              <div
                className="h-full bg-neutral-400 dark:bg-neutral-600 rounded-full transition-all duration-300"
                style={{
                  width: usageStats
                    ? `${Math.min(100, (usageStats.lectures.current / usageStats.lectures.limit) * 100)}%`
                    : "0%",
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between items-center text-[11px]">
              <span className=" text-neutral-900 dark:text-neutral-100 opacity-80">
                Gerações por IA (Últimas 24h)
              </span>
              <span className="text-neutral-900 dark:text-neutral-100 font-mono ">
                {usageStats ? `${usageStats.generations.current} / ${usageStats.generations.limit}` : "0 / 5"}
              </span>
            </div>
            <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border dark:border-neutral-850">
              <div
                className="h-full bg-neutral-400 dark:bg-neutral-600 rounded-full transition-all duration-300"
                style={{
                  width: usageStats
                    ? `${Math.min(100, (usageStats.generations.current / usageStats.generations.limit) * 100)}%`
                    : "0%",
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between items-center text-[11px]">
              <span className=" text-neutral-900 dark:text-neutral-100 opacity-80">
                Perguntas ao Tutor (Últimas 24h)
              </span>
              <span className=" text-neutral-900 dark:text-neutral-100 font-mono">
                {usageStats ? `${usageStats.chatQuestions.current} / ${usageStats.chatQuestions.limit}` : "0 / 30"}
              </span>
            </div>
            <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border dark:border-neutral-850">
              <div
                className="h-full bg-neutral-450 dark:bg-neutral-500 rounded-full transition-all duration-300"
                style={{
                  width: usageStats
                    ? `${Math.min(100, (usageStats.chatQuestions.current / usageStats.chatQuestions.limit) * 100)}%`
                    : "0%",
                }}
              />
            </div>
          </div>
        </div>

        {/* Aviso de visitante opcional */}
        {!user && (
          <div className="dark:bg-neutral-905 border dark:border-neutral-800/80 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-neutral-500 dark:text-neutral-400 leading-normal">
            <UserCheck className="h-4 w-4 text-brand-mint shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-neutral-800 dark:text-neutral-200">Usando como visitante</p>
          </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 lg:py-16 font-sans flex flex-col gap-10 lg:gap-14" id="dashboard-container">
      
      {/* SEÇÃO HERO CONSTANTE NO TOPO (Padrão Estético Elevado) */}
      <div className="newstudy-hero text-center flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full  mb-6 shadow-sm"
        >
        
          <span></span>
        </motion.div>
        
<div className="hole">
  <i></i>
  <i></i>
  <i></i>
  <i></i>
  <i></i>
  <i></i>
  <i></i>
  <i></i>
  <i></i>
  <i></i>
</div>

        <div className="relative inline-block px-10 py-5 mb-5 max-w-full overflow-visible">
          {/* Animated concentric rounded outline rings */}
          

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl lg:text-5xl font-extrabold tracking-tight text-brand-black dark:text-mint-400 font-sans leading-tight relative z-10" id="txtHr"
          >
            
              {user ? `Bem vindo ${user.name}, o que vamos estudar hoje?` : "O que vamos estudar hoje?"}
            
          </motion.h1>
        
        </div>
       
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm lg:text-base text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto font-sans font-light leading-relaxed"
   id="txtsec"     >
          Converta vídeos do youtube em apostilas dinâmicas, fórmulas e flashcards inteligentes, questões e muito mais em segundos, tudo para o seu melhor aprendizado.
        </motion.p>
        <ScrollDown />
         <div className="separator"></div>
        <div className="newstudy-promo-carousel">
          <PromoCarousel />
        </div>
      </div>

      {/* ÁREA DE PRODUTIVIDADE EM GRID DE DOIS PAINÉIS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PAINEL DA ESQUERDA: IMPORTADOR */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5" id="linkhero"
        >
          {renderImporterCard(false)}
        </motion.div>

        {/* PAINEL DA DIREITA: BIBLIOTECA DE MATERIAIS */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 flex flex-col gap-6"
         
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg tracking-tight text-brand-black dark:text-mint-400  flex items-center font-sans" id="ser">
                <span>Seu Deck de Estudo</span>
                <span className="text-xs border border-neutral-300 dark:border-neutral-700 h-6 w-6 inline-flex items-center justify-center rounded-full font-mono  text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-850 ml-1.5 select-none font-sans">
                  {lectures.length}
                </span>
              </h2>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-sans mt-0.5">
                {user ? `Arquivos de ${user.name} armazenados no PostgreSQL.` : "Arquivos do visitante armazenados no PostgreSQL."}
              </p>
            </div>

            {/* Caixa de filtro rápido */}
            <div className="relative w-full sm:w-64 font-sans">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Pesquisar por assunto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-neutral-250 dark:border-neutral-750 bg-white dark:bg-neutral-905 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[#7C3AED] transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 p-0.5 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {filteredLectures.length === 0 && !isAdding ? (
              <div className="bg-white dark:bg-neutral-900 border border-dashed border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-12 text-center text-neutral-450 dark:text-neutral-500 flex flex-col items-center gap-3 shadow-xs">
                <BookOpen className="h-8 w-8 text-neutral-300 dark:text-neutral-800 font-light" />
                <div>
                  <p className="text-sm font-medium">Nenhum material de estudo encontrado.</p>
                  <p className="text-xs mt-0.5 opacity-80">Gere um material colando um link do YouTube ao lado.</p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {isAdding && (
                  <motion.div
                    key="adding-skeleton"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-850 rounded-2xl p-5 flex flex-col gap-3 relative animate-pulse shadow-xs"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="h-3.5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded font-mono" />
                          <span className="text-neutral-250 dark:text-neutral-750 font-sans text-xs">•</span>
                          <span className="h-3.5 w-12 bg-neutral-200 dark:bg-neutral-800 rounded" />
                        </div>
                        <div className="h-5 bg-neutral-250 dark:bg-neutral-750 rounded w-3/4 mt-1" />
                      </div>
                      <div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
                    </div>
                    <div className="space-y-2 mt-2">
                      <div className="h-3 bg-neutral-150 dark:bg-neutral-805 rounded w-full" />
                      <div className="h-3 bg-neutral-150 dark:bg-neutral-850 rounded w-4/5" />
                    </div>
                    <div className="mt-2 flex flex-col gap-1">
                      <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border dark:border-neutral-850">
                        <div className="h-full rounded-full w-1/4 bg-brand-mint animate-pulse" />
                      </div>
                      <span className="text-[10px] text-brand-mint font-mono flex items-center gap-1.5 mt-0.5">
                        <RotateCw className="h-3 animate-spin text--brand-mint" />
                        Iniciando requisição inteligente e estruturando dados com a tecnologia Gemini AI...
                      </span>
                    </div>
                  </motion.div>
                )}

                {filteredLectures.map((lecture) => {
                  const isAnalyzing = lecture.status === "ANALYZING";
                  const isFailed = lecture.status === "FAILED";

                  return (
                    <motion.div
                      key={lecture.id}
                      layout
                    
                      className="newstudy-lecture-card group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 hover:border-neutral-350 dark:hover:border-neutral-750 rounded-2xl p-6 transition-all flex flex-col gap-3 relative cursor-pointer shadow-xs"
                    >
                      <div className="flex justify-between items-start gap-4" >
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-sans  tracking-wider uppercase text-neutral-450 dark:text-neutral-500">
                              {lecture.category || "FÍSICA GERAL"}
                            </span>
                            <span className="text-neutral-200 dark:text-neutral-800 font-sans text-xs">•</span>
                            <span className="text-[10px] text-neutral-550 dark:text-neutral-400 font-mono flex items-center gap-1 bg-neutral-100/50 dark:bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-200/50 dark:border-neutral-750">
                              <Clock className="h-3 w-3 text-brand-mint" />
                              {lecture.duration || "25:00"}
                            </span>
                            {lecture.moduleName && (
                              <>
                                <span className="text-neutral-250 dark:text-neutral-800 font-sans text-xs">•</span>
                                <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-sans font-medium">
                                  {lecture.moduleName}
                                </span>
                              </>
                            )}
                          </div>

                          <h3
                            onClick={() => !isAnalyzing && !isFailed && onSelectLecture(lecture.id)}
                            className={`text-base lg:text-lg tracking-tight text-brand-black dark:text-mint-400  mt-1 cursor-pointer transition-colors font-sans hover:opacity-90`}
                          >
                            {lecture.title}
                          </h3>
                        </div>

                        {/* Status / Ações */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onDeleteLecture(lecture.id)}
                            className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-all cursor-pointer text-neutral-450"
                            title="Remover Material"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          {isAnalyzing && (
                            <span className="text-[10px] font-mono bg-blue-500/10 text-blue-650 dark:text-blue-400 px-2 py-1 rounded border border-blue-500/20 shadow-inner animate-pulse">
                              {lecture.progress}% COMPLETADO
                            </span>
                          )}

                          {isFailed && (
                            <span className="text-[10px] font-mono bg-red-500/10 text-red-650 dark:text-red-450 px-2 py-1 rounded border border-red-500/20">
                              FALHOU
                            </span>
                          )}

                          {lecture.status === "READY" && (
                            <button
                              onClick={() => onSelectLecture(lecture.id)}
                              className="px-3.5 py-1.5 text-xs bg-[#ffffff] hover:bg-[#bfbfbf] text-[#000000] hover:text-[#ffffff] border border-[#BAE6FD]/40 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02]"
                            >
                              <Play className="h-3 w-3 fill-current text-[#898989]" />
                              <span>Estudar</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {lecture.summaryShort}
                      </p>

                      {/* Progresso de geração de estudos em tempo real com barra estilosa */}
                      {isAnalyzing && (
                        <div className="mt-2 flex flex-col gap-1">
                          <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border dark:border-neutral-850">
                            <motion.div
                              initial={{ width: "10%" }}
                              animate={{ width: `${lecture.progress}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full rounded-full bg-gradient-to-right from-brand-mint to-sky-400"
                            />
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 mt-0.5 animate-pulse">
                            <RotateCw className="h-3 w-3 animate-spin text-brand-mint" />
                            Analisando narrativas e extraindo conceitos...
                          </span>
                        </div>
                      )}

                      {/* Falha ou Erros de diagnóstico detalhados */}
                      {isFailed && (
                        <div className="text-xs text-red-500 bg-red-500/5 p-3 rounded-xl border border-red-500/10 mt-1 leading-normal">
                          {lecture.summaryFull}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
