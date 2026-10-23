import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ClipboardList,
  HandHeart,
  MessagesSquare,
  Minus,
  PackageCheck,
  Plus,
  Quote,
  Settings2,
  Star,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { lazy, useId, useState, type FormEvent } from 'react';
import { SceneFallback } from '../components/illustrations/Illustrations';
import { LazyScene } from '../components/three/LazyScene';
import { Button } from '../components/ui/Button';
import { Reveal, RouteGlyph, SectionHeading } from '../components/ui/Section';
import { faqs } from '../config/faq';
import { hasContactDetails, primaryPhone, site } from '../config/site';
import { scrollToSection, useMove } from '../context/MoveContext';

const FinaleScene = lazy(() => import('../components/three/scenes/FinaleScene'));

/* ---------------------------------------------------------------- Why choose */

const reasons: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: HandHeart,
    title: 'Careful Handling',
    body: 'Furniture, electronics and fragile belongings each need the right preparation. Identifying them early helps them be packed and handled appropriately.',
  },
  {
    icon: ClipboardList,
    title: 'Organized Planning',
    body: 'Sharing your property size, locations and requirements up front makes it easier to work out what your relocation actually involves.',
  },
  {
    icon: MessagesSquare,
    title: 'Clear Communication',
    body: 'Knowing what has been agreed — services, dates and arrangements — keeps everyone on the same page from enquiry to moving day.',
  },
  {
    icon: Settings2,
    title: 'Flexible Requirements',
    body: 'A studio apartment, a family home and a busy office all move differently. Your plan starts from your situation, not a fixed template.',
  },
];

export function WhyChoose() {
  return (
    <section id="why" aria-labelledby="why-heading" className="section on-dark overflow-hidden bg-navy-900 text-white">
      <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" aria-hidden="true" />
      <div className="container-site relative">
        <SectionHeading
          id="why-heading"
          dark
          eyebrow={`Why ${site.name}`}
          title="Every Move Deserves Thoughtful Planning."
          description="The details of a move matter. Here is what guides the way your relocation is planned."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.08}>
              <div className="group h-full rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition duration-300 hover:border-amber-500/50 hover:bg-white/[0.07]">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300 transition group-hover:bg-amber-500 group-hover:text-white">
                  <r.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-xl font-extrabold">{r.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-navy-100">{r.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- How it works */

const steps = [
  { title: 'Tell Us About Your Move', body: 'Provide your property type, pickup location, destination and requirements.', icon: ClipboardList },
  { title: 'Discuss Your Requirements', body: 'The company reviews your enquiry and confirms the relevant service details with you.', icon: MessagesSquare },
  { title: 'Prepare for Moving Day', body: 'The required packing and relocation arrangements are organised.', icon: PackageCheck },
  { title: 'Complete Your Move', body: 'Transportation and delivery proceed according to the confirmed arrangements.', icon: Truck },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="section">
      <div className="container-site">
        <SectionHeading id="how-heading" eyebrow="How it works" title="Four Steps From Enquiry to Arrival." align="center" />
        <ol className="relative mx-auto mt-16 grid max-w-5xl gap-10 lg:grid-cols-4 lg:gap-6">
          {/* Route line: vertical on mobile, horizontal on desktop */}
          <svg className="absolute bottom-6 left-[1.6rem] top-6 w-1 lg:hidden" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 2 100">
            <motion.path d="M1 0V100" stroke="#F57C1F" strokeWidth="2" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} />
          </svg>
          <svg className="absolute left-[12.5%] right-[12.5%] top-[1.6rem] hidden h-1 lg:block" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 2">
            <motion.path d="M0 1H100" stroke="#F57C1F" strokeWidth="2" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} />
          </svg>
          {steps.map((s, i) => (
            <li key={s.title} className="relative flex gap-5 lg:flex-col lg:items-center lg:text-center">
              <button
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                aria-pressed={active === i}
                aria-label={`Step ${i + 1}: ${s.title}`}
                className={`relative z-10 inline-flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-full border-[3px] text-base font-extrabold transition ${
                  active === i ? 'scale-110 border-amber-500 bg-amber-500 text-white shadow-lift' : 'border-amber-500 bg-warm-100 text-navy-900'
                }`}
              >
                0{i + 1}
              </button>
              <div className={`rounded-3xl p-1 transition lg:mt-6 lg:px-3 ${active === i ? '' : 'lg:opacity-70'}`}>
                <s.icon className="mb-3 hidden h-6 w-6 text-amber-500 lg:mx-auto lg:block" aria-hidden="true" />
                <h3 className="text-lg font-extrabold text-navy-900">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-navy-600">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Coverage */

export function Coverage() {
  const { openPlanner } = useMove();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (pickup.trim().length < 2) {
      setError('Enter your pickup city or area to continue.');
      return;
    }
    setError('');
    openPlanner({ pickup: pickup.trim(), destination: destination.trim() || undefined });
  };

  return (
    <section id="coverage" aria-labelledby="coverage-heading" className="section bg-warm-50">
      <div className="container-site grid items-center gap-12 lg:grid-cols-2">
        <SectionHeading
          id="coverage-heading"
          eyebrow="Service coverage"
          title="Where Are You Moving To?"
          description="Enter your pickup and destination areas. Availability for your locations is confirmed when your enquiry is reviewed."
        />
        <Reveal>
          <form onSubmit={submit} noValidate className="card relative overflow-hidden p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
              <div>
                <label htmlFor="cov-pickup" className="field-label">
                  Moving from
                </label>
                <input
                  id="cov-pickup"
                  className="field"
                  placeholder="City or area"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'cov-error' : undefined}
                  autoComplete="address-level2"
                />
              </div>
              <div className="hidden pb-3 text-amber-500 sm:block" aria-hidden="true">
                <RouteGlyph />
              </div>
              <div>
                <label htmlFor="cov-dest" className="field-label">
                  Moving to
                </label>
                <input id="cov-dest" className="field" placeholder="City or area" value={destination} onChange={(e) => setDestination(e.target.value)} autoComplete="address-level2" />
              </div>
            </div>
            {error && (
              <p id="cov-error" role="alert" className="field-error">
                {error}
              </p>
            )}
            {site.serviceAreas.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-400">Areas we serve</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {site.serviceAreas.map((a) => (
                    <li key={a}>
                      <button
                        type="button"
                        onClick={() => (pickup ? setDestination(a) : setPickup(a))}
                        className="rounded-full border border-navy-900/10 bg-warm-100 px-3.5 py-1.5 text-sm font-semibold text-navy-700 hover:border-amber-500"
                      >
                        {a}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button type="submit" className="mt-6 w-full sm:w-auto" icon={<ArrowRight className="h-4 w-4" />}>
              Continue to Move Planner
            </Button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Testimonials / what to expect */

const expectations = [
  { title: 'A conversation first', body: 'Your enquiry is reviewed and you are contacted to clarify the details before anything is arranged.' },
  { title: 'Questions that fit your move', body: 'Home moves and office moves need different information — you only share what is relevant.' },
  { title: 'Agreed arrangements', body: 'Services, dates and quotation are confirmed with you, so you know what has been arranged.' },
  { title: 'Help on both ends', body: 'From preparing belongings at pickup to placing them at the destination, as agreed for your move.' },
];

export function Testimonials() {
  if (site.testimonials.length === 0) {
    return (
      <section id="expect" aria-labelledby="expect-heading" className="section">
        <div className="container-site">
          <SectionHeading id="expect-heading" eyebrow="Your experience" title="What to Expect From Your Move" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {expectations.map((e, i) => (
              <Reveal key={e.title} delay={i * 0.06}>
                <div className="card h-full p-7">
                  <span className="text-sm font-extrabold text-amber-600">0{i + 1}</span>
                  <h3 className="mt-3 text-lg font-extrabold text-navy-900">{e.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-navy-600">{e.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section id="expect" aria-labelledby="expect-heading" className="section">
      <div className="container-site">
        <SectionHeading id="expect-heading" eyebrow="Testimonials" title="Experiences That Matter." />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {site.testimonials.map((t, i) => (
            <Reveal key={t.name + i} delay={i * 0.06}>
              <figure className="card h-full p-7">
                <Quote className="h-7 w-7 text-amber-500" aria-hidden="true" />
                {t.rating && (
                  <p className="mt-4 flex gap-0.5" aria-label={`${t.rating} out of 5`}>
                    {Array.from({ length: 5 }, (_, s) => (
                      <Star key={s} className={`h-4 w-4 ${s < t.rating! ? 'fill-amber-400 text-amber-400' : 'text-navy-200'}`} aria-hidden="true" />
                    ))}
                  </p>
                )}
                <blockquote className="mt-4 text-[15px] leading-relaxed text-navy-700">“{t.quote}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  {t.image && <img src={t.image} alt="" className="h-10 w-10 rounded-full object-cover" />}
                  <span>
                    <span className="block font-bold text-navy-900">{t.name}</span>
                    {t.moveType && <span className="text-sm text-navy-500">{t.moveType}</span>}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- About */

export function About() {
  const { openPlanner } = useMove();
  return (
    <section id="about" aria-labelledby="about-heading" className="section bg-warm-50">
      <div className="container-site grid gap-12 lg:grid-cols-2 lg:items-center">
        <SectionHeading
          id="about-heading"
          eyebrow="About us"
          title={<>Pack. Move. Settle.</>}
          description={`${site.name} is a packers and movers company that helps households and businesses plan their relocation — preparing belongings, loading, transporting and delivering them to the next space.`}
        />
        <Reveal>
          <div className="card p-8">
            <p className="text-[15px] leading-relaxed text-navy-700">
              A move is a journey from one space to another. Whether it is a family settling into a new home or a team setting up a new
              office, our aim is to help you plan that transition clearly — starting with the details that matter to you.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {['Pack', 'Move', 'Settle'].map((w, i) => (
                <div key={w} className="rounded-2xl bg-warm-100 px-3 py-4">
                  <span className="text-xs font-extrabold text-amber-600">0{i + 1}</span>
                  <p className="mt-1 text-lg font-extrabold text-navy-900">{w}</p>
                </div>
              ))}
            </div>
            <Button className="mt-6" size="md" onClick={() => openPlanner()} icon={<ArrowRight className="h-4 w-4" />}>
              Plan My Move
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- FAQ */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <li className="border-b border-navy-900/10">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-button`}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-6 py-5 text-left text-base font-bold text-navy-900 transition hover:text-amber-600 sm:text-lg"
        >
          {q}
          <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${open ? 'bg-amber-500 text-white' : 'bg-navy-900/5 text-navy-700'}`}>
            {open ? <Minus className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-button`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-6 pr-12 text-[15px] leading-relaxed text-navy-600">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="section">
      <div className="container-site grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading id="faq-heading" eyebrow="FAQ" title="Questions, Answered." description="Where an answer depends on availability or policy, it is confirmed when you discuss your move." />
        </div>
        <ul className="border-t border-navy-900/10 lg:col-span-8">
          {faqs.map((f) => (
            <FaqItem key={f.q} {...f} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Final CTA + contact */

export function FinalCta() {
  const { openPlanner } = useMove();
  return (
    <section id="contact" aria-labelledby="final-heading" className="on-dark relative isolate overflow-hidden bg-navy-900 text-white">
      <div className="relative h-[46vh] min-h-[320px] sm:h-[56vh]">
        <LazyScene
          className="!absolute inset-0"
          label="The branded truck parked on a road between a welcoming home and a newly organised office, joined by an orange route line."
          fallback={<SceneFallback variant="finale" dark />}
        >
          <FinaleScene />
        </LazyScene>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy-900 to-transparent" aria-hidden="true" />
      </div>
      <div className="container-site relative -mt-16 pb-24 text-center sm:-mt-24">
        <Reveal>
          <p className="eyebrow justify-center text-amber-300">
            <RouteGlyph />
            {site.tagline}
          </p>
          <h2 id="final-heading" className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            Your Next Chapter Starts Here.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-navy-100">Tell us about your move, and let’s work through the next steps together.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => openPlanner()} icon={<ArrowRight className="h-4 w-4" />}>
              Plan My Move
            </Button>
            <Button variant="light" onClick={() => scrollToSection('services')}>
              Explore Our Services
            </Button>
          </div>
          {hasContactDetails && (
            <p className="mt-8 text-sm text-navy-200">
              {primaryPhone && (
                <a href={`tel:${primaryPhone.tel}`} className="transition hover:text-white">
                  {primaryPhone.display}
                </a>
              )}
              {primaryPhone && site.contact.email && ' · '}
              {site.contact.email && (
                <a href={`mailto:${site.contact.email}`} className="transition hover:text-white">
                  {site.contact.email}
                </a>
              )}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
