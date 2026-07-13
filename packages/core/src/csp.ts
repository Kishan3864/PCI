/** Parses a CSP header value into directive -> token list (names lowercased). */
export function parseCsp(value: string): Map<string, string[]> {
  const directives = new Map<string, string[]>();
  for (const part of value.split(';')) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    const name = tokens.shift()?.toLowerCase();
    if (!name || directives.has(name)) continue;
    directives.set(
      name,
      tokens.map((t) => t.toLowerCase()),
    );
  }
  return directives;
}

const UNSAFE_TOKENS = ["'unsafe-inline'", "'unsafe-eval'"];

export interface CspWeakening {
  removedDirectives: string[];
  addedUnsafeTokens: Array<{ directive: string; token: string }>;
}

/**
 * Detects whether `after` is weaker than `before`: a directive that existed
 * before was removed, or an unsafe token was added to any directive.
 * Token/directive reordering is not a weakening. Returns null when not weakened.
 */
export function analyzeCspWeakening(before: string, after: string): CspWeakening | null {
  const prev = parseCsp(before);
  const next = parseCsp(after);

  const removedDirectives = [...prev.keys()].filter((name) => !next.has(name));

  const addedUnsafeTokens: CspWeakening['addedUnsafeTokens'] = [];
  for (const [directive, tokens] of next) {
    const prevTokens = new Set(prev.get(directive) ?? []);
    for (const token of tokens) {
      if (UNSAFE_TOKENS.includes(token) && !prevTokens.has(token)) {
        addedUnsafeTokens.push({ directive, token });
      }
    }
  }

  if (removedDirectives.length === 0 && addedUnsafeTokens.length === 0) return null;
  return { removedDirectives, addedUnsafeTokens };
}
