import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, HeartHandshake } from 'lucide-react';
import { lazy } from 'react';
import { SceneFallback } from '../components/illustrations/Illustrations';
import { LazyScene } from '../components/three/LazyScene';
import { Button } from '../components/ui/Button';
import { RouteGlyph } from '../components/ui/Section';
import { site } from '../config/site';
import { scrollToSection, useMove } from '../context/MoveContext';

const HeroScene = lazy(() => import('../components/three/scenes/HeroScene'));

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

export function Hero() {
  const { openPlanner } = useMove();

  return (
    <section id="top" aria-labelledby="hero-heading" className="relative isolate min-h-[100svh] overflow-hidden bg-gradient-to-b from-[#F6F2EC] via-warm-100 to-[#EFEAE1]">
      <LazyScene
        className="!absolute inset-0 -z-10"
        preloadMargin="0px"
        label="A branded Sindhu Packages Services truck arrives at a modern home where packed cartons wait by the entrance."
        fallback={<SceneFallback variant="hero" />}
      >
        <HeroScene />
      </LazyScene>

      {/* Readability wash behind the copy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-warm-100 via-warm-100/80 to-transparent lg:bg-gradient-to-r lg:from-warm-100 lg:via-warm-100/75 lg:to-transparent"
        style={{ maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)' }}
      />

      <div className="container-site flex min-h-[100svh] flex-col pb-10 pt-28 sm:pt-32 lg:justify-center lg:pb-24 lg:pt-24">
        <div className="max-w-xl lg:max-w-[34rem]">
          <motion.p {...rise(0)} className="eyebrow">
            <RouteGlyph />
            {site.tagline}
          </motion.p>
          <motion.h1
            {...rise(0.08)}
            id="hero-heading"
            className="mt-5 text-[2.5rem] font-extrabold leading-[1.04] text-navy-900 sm:text-6xl lg:text-[4.1rem]"
          >
            A New Beginning Deserves a <span className="relative whitespace-nowrap text-amber-500">Better Move.</span>
          </motion.h1>
          <motion.p {...rise(0.16)} className="mt-6 max-w-lg text-base leading-relaxed text-navy-600 sm:text-lg">
            From your first packed box to the last item placed in your new space, {site.name} helps you plan your move every step of
            the way.
          </motion.p>
          <motion.div {...rise(0.24)} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => openPlanner()} icon={<ArrowRight className="h-4 w-4" />}>
              Plan My Move
            </Button>
            <Button variant="secondary" onClick={() => scrollToSection('services')}>
              Explore Our Services
            </Button>
          </motion.div>
          <motion.p {...rise(0.32)} className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-navy-900/10 bg-white/90 px-4 py-2 text-sm font-semibold text-navy-700">
            <HeartHandshake className="h-4 w-4 text-amber-500" aria-hidden="true" />
            Your belongings. Handled with care.
          </motion.p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollToSection('choose')}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-navy-500 transition hover:text-navy-900 lg:inline-flex"
      >
        Start the journey
        <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
      </button>
    </section>
  );
}
