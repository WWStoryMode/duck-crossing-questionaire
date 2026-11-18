import { createContext, useContext } from 'react';
import type { TableId } from '../../../shared/types.js';

/** Presentation-wide state shared with slides (kept in the Presentation page so it survives slide changes). */
export interface PresentationCtx {
  liveTable: TableId;
  setLiveTable: (t: TableId) => void;
}

export const PresentationContext = createContext<PresentationCtx | null>(null);

export function usePresentation() {
  const ctx = useContext(PresentationContext);
  if (!ctx) throw new Error('usePresentation must be used inside <Presentation>');
  return ctx;
}
