/** Keys typed into form fields, tab lists, radio groups or dialogs belong to those controls. */
export function isInteractiveTarget(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  if (!t?.closest) return false;
  if (t.closest('input, textarea, select, [contenteditable="true"], [role="tablist"], [role="radiogroup"], [role="dialog"], [role="menu"]')) return true;
  if ((e.key === ' ' || e.key === 'Enter') && t.closest('button, a, summary')) return true;
  return false;
}
