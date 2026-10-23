import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

/** Small route-line glyph used before eyebrows — the brand's orange line in miniature. */
export function RouteGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 10" className={`h-2.5 w-10 ${className}`} aria-hidden="true">
      <circle cx="4" cy="5" r="3" fill="currentColor" />
      <path d="M8 5h24" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="36" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

type HeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  id?: string;
  align?: 'left' | 'center';
  dark?: boolean;
};

export function SectionHeading({ eyebrow, title, description, id, align = 'left', dark = false }: HeadingProps) {
  const center = align === 'center';
  return (
    <Reveal className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      <p className={`eyebrow ${dark ? 'text-amber-300' : ''}`}>
        <RouteGlyph />
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`mt-4 text-3xl font-extrabold leading-[1.1] sm:text-4xl lg:text-[2.75rem] ${dark ? 'text-white' : 'text-navy-900'}`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-5 text-base leading-relaxed sm:text-lg ${dark ? 'text-navy-100' : 'text-navy-600'}`}>{description}</p>
      )}
    </Reveal>
  );
}

/** Fades and lifts content into view once. Reduced-motion users get a plain fade (see MotionConfig). */
export function Reveal({ children, delay = 0, y = 24, ...rest }: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
