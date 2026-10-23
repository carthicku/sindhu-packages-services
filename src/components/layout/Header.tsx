import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { scrollToSection, useMove } from '../../context/MoveContext';
import { Button } from '../ui/Button';
import { BrandLogo } from './Logo';
import { navItems } from './nav';

/** Navigates to a homepage section, from the homepage or any other page. */
export function useSectionLink() {
  const location = useLocation();
  const navigate = useNavigate();
  return (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      scrollToSection(id);
      window.history.replaceState(null, '', id === 'top' ? '/' : `/#${id}`);
    } else {
      navigate(id === 'top' ? '/' : `/#${id}`);
    }
  };
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('top');
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const navIds = navItems.map((n) => n.id);

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { openPlanner } = useMove();
  const sectionLink = useSectionLink();
  const location = useLocation();
  const active = useActiveSection(navIds);
  const menuButton = useRef<HTMLButtonElement>(null);
  const onHome = location.pathname === '/';

  // A 12px sentinel at the top of the document tells us when the page has scrolled,
  // without a scroll listener running on every scroll event.
  useEffect(() => {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:12px;pointer-events:none;';
    document.body.prepend(sentinel);
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    io.observe(sentinel);
    return () => {
      io.disconnect();
      sentinel.remove();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const planMove = () => {
    setOpen(false);
    if (onHome) openPlanner();
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? 'border-b border-navy-900/5 bg-warm-50/95 shadow-[0_8px_30px_-18px_rgba(10,22,43,0.35)]' : 'bg-transparent'
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>
      <div className={`container-site flex items-center justify-between gap-6 transition-all duration-300 ${scrolled ? 'h-16' : 'h-20'}`}>
        <Link to="/" onClick={sectionLink('top')} className="shrink-0 rounded-lg" aria-label="Sindhu Packages Services — home">
          <BrandLogo className="h-12 w-auto sm:h-14" />
        </Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = onHome && active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={item.id === 'top' ? '/' : `/#${item.id}`}
                    onClick={sectionLink(item.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={`relative rounded-full px-3 py-2 text-[13.5px] font-semibold transition-colors ${
                      isActive ? 'text-navy-900' : 'text-navy-600 hover:text-navy-900'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span layoutId="nav-active" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-amber-500" />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {onHome ? (
            <Button size="md" onClick={planMove} className="hidden sm:inline-flex" icon={<ArrowRight className="h-4 w-4" />}>
              Plan My Move
            </Button>
          ) : (
            <Link to="/#planner" className="hidden sm:inline-flex">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600">
                Plan My Move <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          )}
          <button
            ref={menuButton}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy-900/10 bg-white/70 text-navy-900 xl:hidden"
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Main"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-navy-900/5 xl:hidden"
          >
            <ul data-lenis-prevent className="container-site max-h-[calc(100dvh-5rem)] overflow-y-auto py-4">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.id === 'top' ? '/' : `/#${item.id}`}
                    onClick={(e) => {
                      setOpen(false);
                      sectionLink(item.id)(e);
                    }}
                    className="flex items-center justify-between rounded-xl px-2 py-3.5 text-lg font-bold text-navy-900 hover:bg-navy-900/5"
                  >
                    {item.label}
                    <ArrowRight className="h-4 w-4 text-amber-500" />
                  </a>
                </li>
              ))}
              <li className="mt-3">
                {onHome ? (
                  <Button onClick={planMove} className="w-full">
                    Plan My Move
                  </Button>
                ) : (
                  <Link to="/#planner" onClick={() => setOpen(false)} className="flex w-full justify-center rounded-full bg-amber-500 px-7 py-3.5 font-bold text-white">
                    Plan My Move
                  </Link>
                )}
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
