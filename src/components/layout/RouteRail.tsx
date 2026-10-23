import { motion, useScroll, useSpring } from 'framer-motion';
import { scrollToSection } from '../../context/MoveContext';
import { routeStops } from './nav';

/**
 * The thin orange route line that runs beside the page on large screens,
 * filling as the visitor travels from the first section to the last.
 */
export function RouteRail() {
  const { scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <nav aria-label="Page journey" className="pointer-events-none fixed left-5 top-1/2 z-40 hidden h-[56vh] -translate-y-1/2 2xl:block">
      <div className="relative h-full w-3">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-navy-900/10" />
        <motion.div
          style={{ scaleY: fill }}
          className="absolute left-1/2 top-0 h-full w-[2px] origin-top -translate-x-1/2 rounded-full bg-amber-500"
        />
        <ol className="absolute inset-0 flex flex-col justify-between">
          {routeStops.map((stop) => (
            <li key={stop.id} className="group pointer-events-auto relative flex items-center justify-center">
              <button
                type="button"
                onClick={() => scrollToSection(stop.id)}
                className="h-3 w-3 rounded-full border-2 border-amber-500 bg-warm-100 transition hover:scale-125 hover:bg-amber-500"
              >
                <span className="sr-only">Go to {stop.label}</span>
              </button>
              <span className="pointer-events-none absolute left-6 whitespace-nowrap rounded-full bg-navy-900 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                {stop.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
