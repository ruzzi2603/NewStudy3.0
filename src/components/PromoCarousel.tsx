import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, Lightbulb } from "lucide-react";

interface Slide {
  id: number;
  badge: string;
  title: string;
  description: string;
  color: string;
  image: string; // Você pode colocar uma imagem padrão ou ilustrações
  accentIcon: React.ReactNode;
}

export default function PromoCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ícones de fallback aleatórios ou mapeados para deixar o visual bonito
  const getIcon = (badge: string) => {
    const b = badge.toLowerCase();
    if (b.includes("ia") || b.includes("artificil") || b.includes("novidade")) {
      return <Sparkles className="h-4 w-4 text-brand-mint" />;
    }
    if (b.includes("estudo") || b.includes("livro") || b.includes("manual")) {
      return <BookOpen className="h-4 w-4 text-emerald-400" />;
    }
    return <Lightbulb className="h-4 w-4 text-amber-400" />;
  };

  // Mapeamento visual das imagens de fundo para garantir que fiquem profissionais
  const getFallbackImage = (index: number) => {
    const images = [
      "/src/assets/images/ai_workspace_hero_1779742602115.png",
      "/src/assets/images/concept_microlearning_1779742615958.png",
      "/src/assets/images/interactive_study_1779742630029.png"
    ];
    return images[index % images.length];
  };

  useEffect(() => {
    // 1. Busca os anúncios vindos do Django API
    fetch("http://127.0.0.1:8000/api/announcements/") // coloque a URL correspondente do seu Django local/produção
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar anúncios");
        return res.json();
      })
      .then((data) => {
        // 2. Mapeia o JSON retornado para a estrutura que o Carrossel usa
        const formatted: Slide[] = data.map((item: any, idx: number) => ({
          id: item.id,
          badge: item.badge_text.toUpperCase(),
          title: item.title,
          description: item.subtitle,
          image: getFallbackImage(idx), // Fornece uma ilustração profissional de fundo
          color: "from-neutral-900/90 to-neutral-900/40", // Ou use item.accent_color dinâmico
          accentIcon: getIcon(item.badge_text),
        }));

        if (formatted.length > 0) {
          setSlides(formatted);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro na integração com Django:", err);
        setLoading(false);
      });
  }, []);

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isPlaying && slides.length > 0) {
      timeoutRef.current = setTimeout(() => {
        nextSlide();
      }, 6000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, isPlaying, slides]);

  // Se estiver carregando ou não houver nada no Django, podemos exibir fallback ou ficar invisível
  if (loading || slides.length === 0) {
    return (
      <div className="w-full h-44 flex items-center justify-center bg-neutral-900/10 dark:bg-neutral-900 rounded-2xl animate-pulse text-xs text-neutral-400">
        Iniciando painel de novidades integrado...
      </div>
    );
  }

  return (
    <div 
      className="relative w-full overflow-hidden rounded-2xl   bg-neutral-100 dark:bg-neutral-900 shadow-sm"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      id="promo-carousel"
    >
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
            <img 
              src={slides[currentIndex].image} 
              alt={slides[currentIndex].title}
              className="w-full h-full object-cover select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentIndex].color} via-neutral-950/70 to-transparent mix-blend-multiply`} />
            <div className="absolute inset-0 bg-neutral-950/20 flex items-center justify-center"  />
            
            <div className="absolute inset-0 flex flex-col justify-center items-center p-6 sm:p-8 md:p-10 lg:p-12 text-white max-w-xl md:max-w-2xl" id="expositivo">
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

        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-10">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}