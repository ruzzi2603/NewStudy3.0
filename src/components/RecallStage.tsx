/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Zap,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Award,
  RefreshCw,
  Star,
  Frown,
  Smile,
  Meh
} from "lucide-react";
import { Lecture, Flashcard, QuizQuestion } from "../types";

interface RecallStageProps {
  lecture: Lecture;
  mode: "flashcards" | "quiz";
  onBack: () => void;
  onUpdateFlashcard: (flashcardId: string, difficulty?: "easy" | "good" | "hard", reviewState?: boolean) => Promise<void>;
}

export default function RecallStage({
  lecture,
  mode,
  onBack,
  onUpdateFlashcard,
}: RecallStageProps) {
  // Flashcard states
  const [fcIndex, setFcIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [fcStats, setFcStats] = useState<Record<string, "hard" | "good" | "easy">>({});
  const [completedRecall, setCompletedRecall] = useState(false);

  // Active recall Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedQuizOpt, setSelectedQuizOpt] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [submittedQuizQuestion, setSubmittedQuizQuestion] = useState(false);
  const [completedQuiz, setCompletedQuiz] = useState(false);

  const activeCards = lecture.flashcards;
  const activeQuizzes = lecture.quizzes;

  const handleFlashcardRating = async (rating: "hard" | "good" | "easy") => {
    const currentCard = activeCards[fcIndex];
    setFcStats({ ...fcStats, [currentCard.id]: rating });
    
    // Call DB update to save state persistently
    await onUpdateFlashcard(currentCard.id, rating, undefined);

    if (fcIndex < activeCards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setFcIndex(fcIndex + 1);
      }, 200);
    } else {
      setCompletedRecall(true);
    }
  };

  const handleToggleBookmark = async (card: Flashcard) => {
    const targetState = !card.reviewState;
    await onUpdateFlashcard(card.id, undefined, targetState);
  };

  const currentFlashcard = activeCards[fcIndex];

  // Quiz helper
  const handleQuizAnswerSubmit = () => {
    if (selectedQuizOpt === null) return;
    const currentQuiz = activeQuizzes[quizIndex];
    if (selectedQuizOpt === currentQuiz.correctAnswerIndex) {
      setQuizScore(quizScore + 1);
    }
    setSubmittedQuizQuestion(true);
  };

  const handleNextQuizQuestion = () => {
    setSelectedQuizOpt(null);
    setSubmittedQuizQuestion(false);
    if (quizIndex < activeQuizzes.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      setCompletedQuiz(true);
    }
  };

  const currentQuiz = activeQuizzes[quizIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12 font-sans" id="recall-workspace">
      {/* Barra de Navegação Superior */}
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-850 pb-5 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao Material</span>
        </button>

        <span className="text-xs bg-neutral-100 dark:bg-neutral-805 text-neutral-600 dark:text-neutral-400 font-mono border dark:border-neutral-750 px-3 py-1 rounded-full font-medium">
          {mode === "flashcards" ? "Memorização Ativa - Leitner" : "Quiz de Fixação e Diagnóstico"}
        </span>
      </div>

      {mode === "flashcards" ? (
        /* --- Fluxo de Flashcards ---- */
        <div className="flex flex-col gap-6" id="flashcard-game-flow">
          {activeCards.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
              Nenhum flashcard processado para este material.
            </div>
          ) : !completedRecall ? (
            <div className="flex flex-col gap-6 items-center">
              {/* Progresso e Favorito */}
              <div className="w-full flex justify-between items-center max-w-lg mb-2 text-xs font-mono text-neutral-400 dark:text-neutral-500 font-semibold uppercase">
                <span>
                  Flashcard {fcIndex + 1} de {activeCards.length}
                </span>

                <button
                  onClick={() => handleToggleBookmark(currentFlashcard)}
                  className={`flex items-center gap-1 transition-colors cursor-pointer ${
                    currentFlashcard.reviewState ? "text-yellow-500 font-bold" : "text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  <Star className={`h-4.5 w-4.5 ${currentFlashcard.reviewState ? "fill-yellow-500 text-yellow-500" : ""}`} />
                  <span>{currentFlashcard.reviewState ? "Marcado para Revisão" : "Marcar para Revisão"}</span>
                </button>
              </div>

              {/* CARD CONTAINER (Sistema flip) */}
              <div
                onClick={() => !isFlipped && setIsFlipped(true)}
                className="w-full max-w-lg min-h-[300px] cursor-pointer relative"
                id={`flashcard-card-box-${currentFlashcard.id}`}
              >
                <AnimatePresence mode="wait">
                  {!isFlipped ? (
                    <motion.div
                      key="front"
                      initial={{ opacity: 0, rotateY: -10 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-2xl p-8 flex flex-col justify-between items-center text-center"
                    >
                      <div className="w-full flex justify-start">
                        <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-bold uppercase">
                          PERGUNTA / CONCEITO
                        </span>
                      </div>

                      <p className="text-lg lg:text-xl font-bold font-sans tracking-tight text-neutral-900 dark:text-neutral-100 max-w-md my-auto leading-relaxed">
                        {currentFlashcard.question}
                      </p>

                      <span className="text-xs text-neutral-400 dark:text-neutral-500 animate-pulse font-mono tracking-wide mt-4">
                        [ CLIQUE PARA REVELAR A RESPOSTA ]
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ opacity: 0, rotateY: 10 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 bg-neutral-900 text-white dark:bg-neutral-950 dark:border dark:border-neutral-850 shadow-sm rounded-2xl p-8 flex flex-col justify-between items-center text-center"
                    >
                      <div className="w-full flex justify-start">
                        <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-bold uppercase">
                          AXIOMA / FUNDAMENTAÇÃO
                        </span>
                      </div>

                      <p className="text-sm lg:text-base font-light tracking-wide text-neutral-200 max-w-md my-auto leading-relaxed">
                        {currentFlashcard.answer}
                      </p>

                      <div className="w-full border-t border-neutral-850 pt-4 flex flex-col gap-2">
                        <span className="text-[10px] font-mono text-neutral-400 font-semibold tracking-wide uppercase">
                          QUAL FOI SEU NÍVEL DE RETENÇÃO?
                        </span>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFlashcardRating("hard");
                            }}
                            className="bg-neutral-800 hover:bg-neutral-750 text-xs py-2 px-2 rounded-lg font-bold border border-neutral-700 transition-colors flex items-center justify-center gap-1 cursor-pointer text-red-400"
                          >
                            <Frown className="h-4 w-4" />
                            <span>Difícil</span>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFlashcardRating("good");
                            }}
                            className="bg-neutral-800 hover:bg-neutral-750 text-xs py-2 px-2 rounded-lg font-bold border border-neutral-700 transition-colors flex items-center justify-center gap-1 cursor-pointer text-amber-400"
                          >
                            <Meh className="h-4 w-4" />
                            <span>Bom</span>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFlashcardRating("easy");
                            }}
                            className="bg-neutral-800 hover:bg-neutral-750 text-xs py-2 px-2 rounded-lg font-bold border border-neutral-700 transition-colors flex items-center justify-center gap-1 cursor-pointer text-green-400"
                          >
                            <Smile className="h-4 w-4" />
                            <span>Fácil</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Botões de navegação inferior sem pontuação */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    if (fcIndex > 0) setFcIndex(fcIndex - 1);
                  }}
                  disabled={fcIndex === 0}
                  className={`p-2.5 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${
                    fcIndex === 0
                      ? "border-neutral-150 text-neutral-300 dark:border-neutral-850 dark:text-neutral-700 pointer-events-none"
                      : "border-neutral-300 hover:bg-neutral-50 dark:border-neutral-750 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    if (fcIndex < activeCards.length - 1) setFcIndex(fcIndex + 1);
                  }}
                  disabled={fcIndex === activeCards.length - 1}
                  className={`p-2.5 rounded-lg border flex items-center justify-center cursor-pointer transition-colors ${
                    fcIndex === activeCards.length - 1
                      ? "border-neutral-150 text-neutral-300 dark:border-neutral-850 dark:text-neutral-700 pointer-events-none"
                      : "border-neutral-300 hover:bg-neutral-50 dark:border-neutral-750 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Painel de Metas Concluídas dos Flashcards */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center flex flex-col items-center gap-6 max-w-lg mx-auto shadow-sm"
              id="recall-completion-panel"
            >
              <div className="h-16 w-16 bg-neutral-950 dark:bg-white text-neutral-950 dark:text-white rounded-full flex items-center justify-center border dark:border-neutral-800 shadow-sm">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold tracking-tight text-neutral-955 dark:text-neutral-50 font-sans">
                  Sessão Finalizada!
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
                  Parabéns! Você completou a revisão ativa baseada em repetição espaçada para esta aula.
                </p>
              </div>

              {/* Estatísticas resumidas de memorização */}
              <div className="w-full border-t border-b border-neutral-100 dark:border-neutral-800/85 py-4 grid grid-cols-3 text-center">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold block">FAUSTO / FÁCIL</span>
                  <span className="text-xl font-bold font-mono text-green-500 mt-1 block">
                    {Object.values(fcStats).filter((v) => v === "easy").length}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold block">MÉDIO / BOM</span>
                  <span className="text-xl font-bold font-mono text-amber-500 mt-1 block">
                    {Object.values(fcStats).filter((v) => v === "good").length}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold block">DESAFIADOR / DIFÍCIL</span>
                  <span className="text-xl font-bold font-mono text-red-500 mt-1 block">
                    {Object.values(fcStats).filter((v) => v === "hard").length}
                  </span>
                </div>
              </div>

              <div className="w-full flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setFcIndex(0);
                    setIsFlipped(false);
                    setCompletedRecall(false);
                    setFcStats({});
                  }}
                  className="flex-1 py-3 text-xs font-bold border border-neutral-300 dark:border-neutral-750 text-neutral-700 dark:text-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-105 dark:hover:bg-neutral-800 flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reiniciar Sessão</span>
                </button>

                <button
                  onClick={onBack}
                  className="flex-1 py-3 text-xs bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold rounded-lg cursor-pointer transition-all"
                >
                  Voltar ao Assunto
                </button>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        /* --- Fluxo de Quiz Ativo --- */
        <div className="flex flex-col gap-6" id="quiz-recall-flow">
          {activeQuizzes.length === 0 ? (
            <p className="text-center p-12 text-neutral-400">
              Nenhum questionário diagnóstico disponível para este conteúdo.
            </p>
          ) : !completedQuiz ? (
            <div className="flex flex-col gap-6 max-w-xl mx-auto">
              <div className="flex justify-between items-center text-xs font-mono text-neutral-400 uppercase font-semibold mb-2">
                <span>
                  Questão {quizIndex + 1} de {activeQuizzes.length}
                </span>

                <span>Desempenho: {quizScore} acerto(s)</span>
              </div>

              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 flex flex-col gap-4">
                <h4 className="text-base lg:text-lg font-bold text-neutral-900 dark:text-neutral-100 font-sans">
                  {currentQuiz.question}
                </h4>

                {/* Alternativas */}
                <div className="flex flex-col gap-3 mt-2">
                  {currentQuiz.options.map((option, idx) => {
                    const isSelected = selectedQuizOpt === idx;
                    const isCorrect = idx === currentQuiz.correctAnswerIndex;

                    let btnStyle = "border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850 hover:bg-neutral-100 select-none text-neutral-750 dark:text-neutral-300";
                    if (isSelected && !submittedQuizQuestion) {
                      btnStyle = "border-neutral-900 dark:border-white bg-neutral-950 text-white dark:bg-white dark:text-neutral-900 font-bold";
                    } else if (submittedQuizQuestion && isCorrect) {
                      btnStyle = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300 font-bold";
                    } else if (submittedQuizQuestion && isSelected && !isCorrect) {
                      btnStyle = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={submittedQuizQuestion}
                        onClick={() => setSelectedQuizOpt(idx)}
                        className={`w-full py-3 px-4 rounded-lg border text-left text-xs transition-all cursor-pointer ${btnStyle}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {/* Explicação pedagógica detalhada em tempo real */}
                {submittedQuizQuestion && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={`p-4 rounded-lg border text-xs leading-relaxed mt-4 flex flex-col gap-1.5 ${
                      selectedQuizOpt === currentQuiz.correctAnswerIndex
                        ? "bg-green-500/5 border-green-500/15 text-green-800 dark:text-green-300"
                        : "bg-red-500/5 border-red-500/15 text-red-800 dark:text-red-350"
                    }`}
                  >
                    <span className="font-bold">
                      {selectedQuizOpt === currentQuiz.correctAnswerIndex
                        ? "Muito bem! Resposta Correta."
                        : "Dica de Fixação Acadêmica"}
                    </span>
                    <p className="opacity-95">{currentQuiz.explanation}</p>
                  </motion.div>
                )}

                {/* Ações de verificação ou prosseguimento */}
                <div className="mt-4 border-t border-neutral-100 dark:border-neutral-850 pt-4">
                  {!submittedQuizQuestion ? (
                    <button
                      onClick={handleQuizAnswerSubmit}
                      disabled={selectedQuizOpt === null}
                      className={`w-full py-3 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        selectedQuizOpt === null
                          ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                          : "bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900"
                      }`}
                    >
                      <span>Validar Resposta de Fixação</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuizQuestion}
                      className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Avançar para Próxima Questão</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Painel de Pontuação do Quiz Finalizado */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center flex flex-col items-center gap-6 max-w-lg mx-auto shadow-sm"
              id="quiz-completion"
            >
              <div className="h-16 w-16 bg-neutral-950 dark:bg-white text-neutral-950 dark:text-white rounded-full flex items-center justify-center shadow-sm">
                <Award className="h-8 w-8 text-yellow-500 fill-yellow-550" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold tracking-tight text-neutral-955 dark:text-neutral-50 font-sans">
                  Avaliação Concluída!
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
                  Seu índice de retenção cognitiva foi calculado de forma ideal. Veja seu saldo pedagógico:
                </p>
              </div>

              {/* Placa de pontuação final */}
              <div className="bg-neutral-50 dark:bg-neutral-805 border dark:border-neutral-750 px-8 py-5 rounded-xl flex flex-col items-center justify-center">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">TAXA DE PRECISÃO</span>
                <span className="text-3xl font-extrabold font-sans text-neutral-900 dark:text-neutral-50 mt-1">
                  {Math.round((quizScore / activeQuizzes.length) * 100)}% DE ACERTOS
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
                  Você acertou {quizScore} de {activeQuizzes.length} perguntas formuladas.
                </span>
              </div>

              <div className="w-full flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setQuizIndex(0);
                    setSelectedQuizOpt(null);
                    setQuizScore(0);
                    setSubmittedQuizQuestion(false);
                    setCompletedQuiz(false);
                  }}
                  className="flex-1 py-3 text-xs font-bold border border-neutral-300 dark:border-neutral-750 text-neutral-700 dark:text-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-105 dark:hover:bg-neutral-800 flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refazer Teste</span>
                </button>

                <button
                  onClick={onBack}
                  className="flex-1 py-3 text-xs bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold rounded-lg cursor-pointer transition-all"
                >
                  Voltar ao Material
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
