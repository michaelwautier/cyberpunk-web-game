export type ControlScheme = 'wasd' | 'zqsd';

const STORAGE_KEY = 'neon-grid.control-scheme';

export const SCHEME_KEYS: Record<
  ControlScheme,
  { up: string; left: string; down: string; right: string }
> = {
  wasd: { up: 'W', left: 'A', down: 'S', right: 'D' },
  zqsd: { up: 'Z', left: 'Q', down: 'S', right: 'D' },
};

export function savedScheme(): ControlScheme | null {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === 'wasd' || value === 'zqsd' ? value : null;
}

export function saveScheme(scheme: ControlScheme): void {
  localStorage.setItem(STORAGE_KEY, scheme);
}

/** Synchronous best guess: saved preference, then browser locale (AZERTY regions → ZQSD). */
export function guessScheme(): ControlScheme {
  const saved = savedScheme();
  if (saved) return saved;
  const lang = navigator.language.toLowerCase();
  return lang.startsWith('fr') ? 'zqsd' : 'wasd';
}

/**
 * Async refinement via the Keyboard Layout API (Chromium only): reads what
 * character the physical W-position key produces. Falls back to guessScheme().
 */
export async function detectScheme(): Promise<ControlScheme> {
  const saved = savedScheme();
  if (saved) return saved;
  const keyboard = (navigator as { keyboard?: { getLayoutMap(): Promise<Map<string, string>> } })
    .keyboard;
  if (keyboard?.getLayoutMap) {
    try {
      const layout = await keyboard.getLayoutMap();
      if (layout.get('KeyW')?.toLowerCase() === 'z') return 'zqsd';
      if (layout.get('KeyW')?.toLowerCase() === 'w') return 'wasd';
    } catch {
      // permissions or API failure — fall through to locale guess
    }
  }
  return guessScheme();
}
