import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Building2, Check, Home } from 'lucide-react';
import { lazy } from 'react';
import { SceneFallback, ServiceIllustration } from '../components/illustrations/Illustrations';
import { LazyScene } from '../components/three/LazyScene';
import { Button } from '../components/ui/Button';
import { Reveal, RouteGlyph } from '../components/ui/Section';
import { enabledServices } from '../config/services';
import { scrollToSection, useMove, type Mode } from '../context/MoveContext';

const ExperienceScene = lazy(() => import('../components/three/scenes/ExperienceScene'));

const content: Record<Mode, { heading: string; copy: string; suggested: string[]; journey: string; journeyLabel: string }> = {
  home: {
    heading: 'A moving plan shaped around your household.',
    copy: 'Tell us about your home, your furniture and the belongings that need extra care. The Move Planner will ask about home size, packing and appliances — nothing you don’t need.',
    suggested: ['home-relocation', 'packing', 'furniture', 'local-moving', 'long-distance'],
    journey: 'home-relocation',
    journeyLabel: 'See the home moving journey',
  },
  office: {
    heading: 'A moving plan shaped around your workplace.',
    copy: 'Share your workstations, equipment and storage. The Move Planner will ask about your office size, IT equipment and document areas — not household questions.',
    suggested: ['office-relocation', 'packing', 'local-moving', 'long-distance', 'custom'],
    journey: 'office-relocation',
    journeyLabel: 'See the office moving journey',
  },
};

const options: { id: Mode; title: string; text: string; icon: typeof Home }[] = [
  { id: 'home', title: 'Moving My Home', text: 'For families, individuals, apartments, houses and personal belongings.', icon: Home },
  { id: 'office', title: 'Moving My Office', text: 'For businesses relocating workstations, furniture, equipment and office essentials.', icon: Building2 },
];

export function ChooseExperience() {
  const { mode, setMode, openPlanner } = useMove();
  const c = content[mode];
  const suggested = c.suggested.map((id) => enabledServices.find((s) => s.id === id)).filter((s) => !!s);

  return (
    <section id="choose" aria-labelledby="choose-heading" className="section overflow-hidden bg-warm-50">
      <div className="bg-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="container-site relative">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">
            <RouteGlyph />
            Choose your moving experience
          </p>
          <h2 id="choose-heading" className="mt-4 text-3xl font-extrabold leading-[1.1] sm:text-4xl lg:text-[2.75rem]">
            What are you moving?
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <div role="radiogroup" aria-labelledby="choose-heading" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {options.map((o, i) => {
                const selected = mode === o.id;
                return (
                  <Reveal key={o.id} delay={i * 0.08}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setMode(o.id)}
                      className={`group relative flex w-full overflow-hidden rounded-3xl border text-left transition duration-300 ${
                        selected
                          ? 'border-amber-500 bg-white shadow-lift ring-1 ring-amber-500'
                          : 'border-navy-900/10 bg-white/70 hover:-translate-y-0.5 hover:border-navy-900/25 hover:bg-white hover:shadow-soft'
                      }`}
                    >
                      <div className="relative hidden w-36 shrink-0 overflow-hidden sm:block lg:w-40">
                        <ServiceIllustration kind={o.id} />
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
                        <span className="flex items-center justify-between">
                          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${selected ? 'bg-amber-500 text-white' : 'bg-navy-900/5 text-navy-700'}`}>
                            <o.icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                              selected ? 'border-amber-500 bg-amber-500 text-white' : 'border-navy-900/20'
                            }`}
                            aria-hidden="true"
                          >
                            {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                          </span>
                        </span>
                        <span className="mt-2 text-xl font-extrabold text-navy-900">{o.title}</span>
                        <span className="text-[15px] leading-relaxed text-navy-600">{o.text}</span>
                      </div>
                    </button>
                  </Reveal>
                );
              })}
            </div>

            <div className="card mt-2 p-6" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-extrabold text-navy-900">{c.heading}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-navy-600">{c.copy}</p>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-navy-400">Suggested services</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {suggested.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() =>
                            s.action.kind === 'section'
                              ? scrollToSection(s.action.target)
                              : openPlanner({ moveType: s.action.moveType, requirement: s.action.requirement })
                          }
                          className="rounded-full border border-navy-900/10 bg-warm-100 px-3.5 py-1.5 text-sm font-semibold text-navy-700 transition hover:border-amber-500 hover:text-navy-900"
                        >
                          {s.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button size="md" onClick={() => openPlanner({ moveType: mode })} icon={<ArrowRight className="h-4 w-4" />}>
                      Plan My {mode === 'home' ? 'Home' : 'Office'} Move
                    </Button>
                    <Button size="md" variant="ghost" onClick={() => scrollToSection(c.journey)}>
                      {c.journeyLabel}
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-navy-900/5 bg-gradient-to-b from-[#EEF2F7] to-[#F6F1EA] shadow-soft lg:sticky lg:top-24 lg:aspect-auto lg:h-[min(620px,calc(100vh-8rem))]">
              <LazyScene
                className="!absolute inset-0"
                label={
                  mode === 'home'
                    ? 'A furnished apartment with a sofa, dining table, cartons, protective wrapping and a mover preparing belongings.'
                    : 'A modern office with desks, monitors, chairs, storage cabinets and labelled cartons ready for moving.'
                }
                fallback={<SceneFallback variant={mode} />}
              >
                <ExperienceScene mode={mode} />
              </LazyScene>
              <div className="pointer-events-none absolute left-5 top-5 rounded-full bg-white/85 px-4 py-2 text-sm font-bold text-navy-800 shadow-soft">
                {mode === 'home' ? 'Home relocation' : 'Office relocation'}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
