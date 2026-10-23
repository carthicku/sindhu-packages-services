import { ArrowRight, Check, Info } from 'lucide-react';
import { ServiceIllustration } from '../components/illustrations/Illustrations';
import { Reveal, SectionHeading } from '../components/ui/Section';
import { enabledServices, type Service } from '../config/services';
import { scrollToSection, useMove } from '../context/MoveContext';

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const { openPlanner } = useMove();
  const act = () =>
    service.action.kind === 'section'
      ? scrollToSection(service.action.target)
      : openPlanner({ moveType: service.action.moveType, requirement: service.action.requirement });

  return (
    <Reveal delay={(index % 4) * 0.06} className="h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-navy-900/5 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift">
        <div className="relative aspect-[16/10] overflow-hidden">
          <div className="h-full w-full transition duration-500 group-hover:scale-[1.04]">
            <ServiceIllustration kind={service.illustration} />
          </div>
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-navy-600">
            {service.category === 'residential' ? 'Residential' : service.category === 'commercial' ? 'Commercial' : 'Moving'}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-xl font-extrabold text-navy-900">{service.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-navy-600">{service.summary}</p>
          <ul className="mt-4 space-y-1.5">
            {service.points.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm font-medium text-navy-700">
                <Check className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
          {service.note && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-navy-50 px-3 py-2 text-xs leading-relaxed text-navy-600">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {service.note}
            </p>
          )}
          <div className="mt-auto pt-6">
            <button
              type="button"
              onClick={act}
              className="inline-flex items-center gap-2 rounded-full text-[15px] font-bold text-navy-900 transition hover:text-amber-600"
            >
              {service.cta}
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white transition group-hover:translate-x-1">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export function Services() {
  return (
    <section id="services" aria-labelledby="services-heading" className="section bg-warm-50">
      <div className="container-site">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="services-heading"
            eyebrow="All services"
            title="One Move. Everything That Goes With It."
            description="Explore the services you can enquire about. Each one leads to a tailored set of questions, so your requirements are clear from the start."
          />
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {enabledServices.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
