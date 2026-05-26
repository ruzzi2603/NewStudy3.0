import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, Clock, Lightbulb } from "lucide-react";

interface Slide {
  id: number;
  image: string;
  badge: string;
  title: string;
  description: string;
  color: string;
  accentIcon: React.ReactNode;
}

export default function PromoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const slides: Slide[] = [
    {
      id: 1,
      image: "/src/assets/images/ai_workspace_hero_1779742602115.png",
      badge: "INTELIGÊNCIA ARTIFICIAL",
      title: "Sintetize Vídeos em Apostilas Completas",
      description: "Nossa IA avançada extrai automaticamente fórmulas, conceitos teóricos estruturados e descrições profundas de qualquer vídeo do YouTube em poucos segundos.",
      color: "from-blue-600/90 to-neutral-900/40",
      accentIcon: <Sparkles className="h-4 w-4 text-brand-mint" />,
    },
    {
      id: 2,
      image: "/src/assets/images/concept_microlearning_1779742615958.png",
      badge: "REPETIÇÃO ESPAÇADA",
      title: "Fixação Ativa com Flashcards Dinâmicos",
      description: "Gere flashcards automaticamente com base no conteúdo assistido. Utilize o controle de dificuldade inteligente para otimizar o seu tempo de revisão acadêmica.",
      color: "from-emerald-600/90 to-neutral-900/40",
      accentIcon: <BookOpen className="h-4 w-4 text-emerald-400" />,
    },
    {
      id: 3,
      image: "/src/assets/images/interactive_study_1779742630029.png",
      badge: "SUPABASE & PERSISTÊNCIA",
      title: "Seu Histórico na Nuvem Permanente",
      description: "Todos os seus materiais, resumos e progressos são salvos com segurança utilizando o Supabase PostgreSQL. Estude em qualquer aparelho com total fluidez.",
      color: "from-indigo-600/90 to-neutral-900/40",
      accentIcon: <Lightbulb className="h-4 w-4 text-amber-400" />,
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isPlaying) {
      timeoutRef.current = setTimeout(() => {
        nextSlide();
      }, 6000);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, isPlaying]);

  return (
    <div 
      className="relative w-full overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-850 bg-neutral-100 dark:bg-neutral-900 shadow-sm"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      id="promo-carousel"
    >
      {/* Imagem + Overlay de Conteúdo */}
      <div className="relative aspect-[16/9] sm:aspect-[16/7] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Imagem de Fundo Gerada */}
            <img 
              src={slides[currentIndex].image} 
              alt={slides[currentIndex].title}
              className="w-full h-full object-cover select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
            {/* Gradiente de Mascaramento para alto contraste de texto em qualquer tema */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentIndex].color} via-neutral-950/70 to-transparent mix-blend-multiply`} />
            <div className="absolute inset-0 bg-neutral-950/20" />
            
            {/* Informações Textuais (Responsivas, posicionadas na esquerda) */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-10 lg:p-12 text-white max-w-xl md:max-w-2xl">
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex items-center gap-2 mb-2 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 w-fit"
              >
                {slides[currentIndex].accentIcon}
                <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-wider uppercase">
                  {slides[currentIndex].badge}
                </span>
              </motion.div>
              
              <motion.h3 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white line-clamp-2 md:leading-tight mb-2 sm:mb-3"
              >
                {slides[currentIndex].title}
              </motion.h3>
              
              <motion.p 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-xs sm:text-sm text-neutral-200 line-clamp-3 sm:line-clamp-2 font-light leading-relaxed mb-1"
              >
                {slides[currentIndex].description}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Sliders de Controles Manuais */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
          aria-label="Próximo slide"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* Paginação de Barra Fluida / Indicador de bolinhas */}
      <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-10">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
