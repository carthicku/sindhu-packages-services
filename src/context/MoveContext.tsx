import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { MoveType } from '../config/planner';
import { scrollToElement, scrollToTop } from '../lib/scroll';

export type Mode = 'home' | 'office';

/** A one-off request for the planner to prefill itself (e.g. from a CTA). */
export type PlannerRequest = {
  id: number;
  moveType?: MoveType;
  requirement?: string;
  pickup?: string;
  destination?: string;
  /** Background update (e.g. Home/Office chooser): apply without scrolling or overriding other choices. */
  silent?: boolean;
};

type MoveContextValue = {
  mode: Mode;
  setMode: (m: Mode) => void;
  plannerRequest: PlannerRequest | null;
  /** Prefills the Move Planner and scrolls it into view. */
  openPlanner: (req?: Omit<PlannerRequest, 'id'>) => void;
};

const MoveContext = createContext<MoveContextValue | null>(null);

export function scrollToSection(id: string) {
  if (id === 'top') {
    scrollToTop();
    return true;
  }
  const el = document.getElementById(id);
  if (!el) return false;
  scrollToElement(el);
  return true;
}

export function MoveProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('home');
  const [plannerRequest, setPlannerRequest] = useState<PlannerRequest | null>(null);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    setPlannerRequest({ id: Date.now(), moveType: m, silent: true });
  }, []);

  const openPlanner = useCallback((req: Omit<PlannerRequest, 'id'> = {}) => {
    if (req.moveType === 'home' || req.moveType === 'office') setModeState(req.moveType);
    setPlannerRequest({ ...req, id: Date.now() });
    // Let the planner apply the prefill before scrolling.
    requestAnimationFrame(() => {
      scrollToSection('planner');
      const heading = document.getElementById('planner-heading');
      heading?.focus({ preventScroll: true });
    });
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, plannerRequest, openPlanner }),
    [mode, setMode, plannerRequest, openPlanner],
  );

  return <MoveContext.Provider value={value}>{children}</MoveContext.Provider>;
}

export function useMove() {
  const ctx = useContext(MoveContext);
  if (!ctx) throw new Error('useMove must be used inside MoveProvider');
  return ctx;
}
