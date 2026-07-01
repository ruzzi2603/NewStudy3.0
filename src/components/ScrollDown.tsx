import { ArrowDownToLine } from "lucide-react";

// Botão de atalho para a área de importação principal.
export default function ScrollDown() {
  const animateScrollTo = (targetY: number, duration = 900) => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const effectiveDuration = prefersReducedMotion ? 450 : duration;

    const startY = window.scrollY;
    const delta = targetY - startY;
    const startTime = performance.now();
    let timerId: number | undefined;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easing = prefersReducedMotion ? (t: number) => t : easeInOutCubic;

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / effectiveDuration, 1);
      const eased = easing(progress);
      window.scrollTo({ top: startY + delta * eased, behavior: "auto" });

      if (progress >= 1 && timerId !== undefined) {
        window.clearInterval(timerId);
        timerId = undefined;
      }
    };

    timerId = window.setInterval(() => {
      const now = performance.now();
      step(now);
      if (now - startTime >= effectiveDuration && timerId !== undefined) {
        window.clearInterval(timerId);
      }
    }, 16);

    step(performance.now());
  };

  const handleScroll = () => {
    const target = document.getElementById("link-processor-panel");
    const header = document.querySelector("header");
    const headerOffset = header ? header.getBoundingClientRect().height : 0;

    if (target) {
      const targetY = target.getBoundingClientRect().top + window.scrollY - headerOffset - 24;
      animateScrollTo(Math.max(0, targetY));
      return;
    }

    animateScrollTo(window.scrollY + window.innerHeight * 0.85);
  };

  return (
    <button
      type="button"
      className="scroll-down-btn"
      onClick={handleScroll}
      aria-label="Ir para a seção Importar Aula do YouTube"
      title="Ir para a seção Importar Aula do YouTube"
    >
      <div className="scroll-down-arrow">
      <ArrowDownToLine className="scroll-down-icon" aria-hidden="true" />
      <h1 className="scroll-down-text" >Começar</h1>
</div>
    </button>
  );
}
