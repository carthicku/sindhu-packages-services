import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { lazy, useRef, useState, type ReactNode } from 'react';
import { SceneFallback } from '../components/illustrations/Illustrations';
import { LazyScene } from '../components/three/LazyScene';
import { Button } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/Section';
import { prefersReducedMotion } from '../lib/device';
import { scrollToElement } from '../lib/scroll';

const JourneyScene = lazy(() => import('../components/three/scenes/JourneyScene'));

export type FocusArea = { id: string; zone: string; label: string; detail: string };

export type Stage = {
  title: string;
  body: string;
  /** Selectable areas shown on this stage (used on the first stage). */
  areas?: FocusArea[];
};

type Props = {
  id: string;
  kind: 'home' | 'office';
  eyebrow: string;
  heading: string;
  intro: string;
  stages: Stage[];
  /** Journey progress (0–4) at which each stage card is centred. */
  stageProgress: number[];
  sceneLabel: string;
  cta: { title: string; body: string; button: string; onClick: () => void };
  aside?: ReactNode;
};

function interpolate(points: number[], c: number) {
  const i = Math.min(Math.floor(c), points.length - 2);
  const f = c - i;
  return points[i] + (points[i + 1] - points[i]) * f;
}

export function JourneySection({ id, kind, eyebrow, heading, intro, stages, stageProgress, sceneLabel, cta, aside }: Props) {
  const list = useRef<HTMLOListElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const progress = useRef(0);
  const [active, setActive] = useState(0);
  const [focus, setFocus] = useState<string | null>(null);
  const n = stages.length;

  const { scrollYProgress } = useScroll({ target: list, offset: ['start center', 'end center'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const c = Math.min(Math.max(v * n - 0.5, 0), n - 1);
    progress.current = interpolate(stageProgress, c);
    const stage = Math.round(c);
    setActive((prev) => (prev === stage ? prev : stage));
  });

  const goTo = (i: number) => {
    const el = cards.current[i];
    if (el) scrollToElement(el, 'center');
  };

  const focusDetail = stages[0].areas?.find((a) => a.id === focus);

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="section">
      <div className="container-site">
        <SectionHeading id={`${id}-heading`} eyebrow={eyebrow} title={heading} description={intro} />
      </div>

      <div className="container-site relative mt-10 lg:mt-16 lg:grid lg:grid-cols-12 lg:gap-12">
        {/* Sticky 3D stage */}
        <div className="sticky top-[4.25rem] z-10 -mx-4 h-[44vh] sm:mx-0 lg:top-24 lg:order-2 lg:col-span-7 lg:h-[calc(100vh-8rem)]">
          <div className="relative h-full overflow-hidden border-y border-navy-900/5 bg-gradient-to-b from-[#EDF1F6] via-[#F3F0EA] to-[#ECE6DC] shadow-soft sm:rounded-[2rem] sm:border">
            <LazyScene className="!absolute inset-0" label={sceneLabel} fallback={<SceneFallback variant={kind} />}>
              <JourneyScene kind={kind} progress={progress} focus={active === 0 ? focusDetail?.zone ?? null : null} reducedMotion={prefersReducedMotion()} />
            </LazyScene>

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-5">
              <AnimatePresence mode="wait">
                <motion.p
                  key={active}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-navy-800 shadow-soft sm:text-sm"
                >
                  <span className="text-amber-600">0{active + 1}</span> · {stages[active].title}
                </motion.p>
              </AnimatePresence>
            </div>

            <nav aria-label={`${heading} stages`} className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
              <ol className="flex items-center gap-1.5 rounded-full bg-white/90 p-1.5 shadow-soft sm:mx-auto sm:w-fit">
                {stages.map((s, i) => (
                  <li key={s.title} className="flex-1 sm:flex-none">
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={active === i ? 'step' : undefined}
                      className={`flex w-full items-center justify-center gap-2 rounded-full px-2 py-1.5 text-xs font-bold transition sm:px-3.5 ${
                        active === i ? 'bg-navy-900 text-white' : 'text-navy-500 hover:bg-navy-900/5 hover:text-navy-900'
                      }`}
                    >
                      <span>{i + 1}</span>
                      <span className={active === i ? 'sr-only sm:not-sr-only' : 'sr-only'}>{s.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>

        {/* Story cards */}
        <div className="lg:order-1 lg:col-span-5 lg:pb-[24vh]">
          <ol ref={list} className="relative">
            <div className="absolute bottom-[25vh] left-[1.15rem] top-[25vh] hidden w-px bg-navy-900/10 lg:block" aria-hidden="true" />
            {stages.map((s, i) => (
              <li
                key={s.title}
                ref={(el) => (cards.current[i] = el)}
                data-stage={i}
                className="relative flex min-h-[64vh] items-center py-8 lg:min-h-[78vh] lg:pl-12"
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-2 top-1/2 hidden h-5 w-5 -translate-y-1/2 rounded-full border-[3px] transition-colors duration-300 lg:block ${
                    active >= i ? 'border-amber-500 bg-amber-500' : 'border-navy-900/15 bg-warm-100'
                  }`}
                />
                <div
                  className={`w-full rounded-3xl border bg-white p-6 transition-all duration-500 sm:p-8 ${
                    active === i ? 'border-amber-500/40 shadow-lift' : 'border-navy-900/5 opacity-60 shadow-soft'
                  }`}
                >
                  <p className="text-sm font-extrabold text-amber-600">Stage {String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-navy-900 sm:text-[1.75rem]">{s.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-navy-600 sm:text-base">{s.body}</p>
  
                  {s.areas && (
                    <div className="mt-6">
                      <p id={`${id}-areas`} className="text-xs font-bold uppercase tracking-[0.14em] text-navy-400">
                        Select an area to explore
                      </p>
                      <div role="group" aria-labelledby={`${id}-areas`} className="mt-3 flex flex-wrap gap-2">
                        {s.areas.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            aria-pressed={focus === a.id}
                            onClick={() => {
                              setFocus((f) => (f === a.id ? null : a.id));
                              if (active !== 0) goTo(0);
                            }}
                            className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                              focus === a.id
                                ? 'border-amber-500 bg-amber-500 text-white'
                                : 'border-navy-900/10 bg-warm-100 text-navy-700 hover:border-amber-500'
                            }`}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                      <div aria-live="polite" className="min-h-[4.5rem]">
                        <AnimatePresence mode="wait">
                          {focusDetail && (
                            <motion.p
                              key={focusDetail.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-navy-700"
                            >
                              <strong className="text-navy-900">{focusDetail.label}: </strong>
                              {focusDetail.detail}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="container-site mt-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-navy-900 p-8 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:p-12">
          <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <h3 className="text-2xl font-extrabold sm:text-3xl">{cta.title}</h3>
            <p className="mt-2 max-w-xl text-navy-100">{cta.body}</p>
            {aside}
          </div>
          <div className="on-dark relative mt-6 shrink-0 lg:mt-0">
            <Button onClick={cta.onClick} icon={<ArrowRight className="h-4 w-4" />}>
              {cta.button}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
