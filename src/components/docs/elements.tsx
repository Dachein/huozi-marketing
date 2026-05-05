/**
 * Shared visual primitives for /docs pages — H2, H3, paragraphs,
 * tables, code blocks. Pulled out of the original single-page docs
 * file so /docs, /docs/editions, /docs/auth, /docs/api can render
 * the same typography without each redefining helpers inline.
 *
 * Anchors on H2/H3 use href="#id" so deep-linking from one doc page
 * to a section of another (or from external blogs) keeps working.
 */

import { CopyButton } from "@/components/copy-button";
import type { Locale } from "@/lib/i18n";

/**
 * Pick the right per-locale variant of a string/node, falling back
 * sensibly when a translation is missing.
 *
 *   pick(locale, { zh: "你好", en: "Hi", ja: "こんにちは", fr: "Salut" })
 *
 * Order of preference for missing locales:
 *   1. The exact locale key.
 *   2. en (most readable second choice for tech docs).
 *   3. zh (default locale).
 *   4. The first variant that exists.
 *
 * Used by /docs pages to express bilingual or quad-lingual prose
 * inline without a per-string i18n key. Keep this co-located with
 * the docs visual primitives so all docs pages import from one
 * place.
 */
export function pick<T>(
  locale: Locale,
  variants: Partial<Record<Locale, T>>,
): T {
  if (variants[locale] !== undefined) return variants[locale] as T;
  if (variants.en !== undefined) return variants.en as T;
  if (variants.zh !== undefined) return variants.zh as T;
  for (const v of Object.values(variants) as T[]) {
    if (v !== undefined) return v;
  }
  // Should be unreachable if at least one variant is provided.
  throw new Error("pick: no variants given");
}

export function H2({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2 id={id} className="text-2xl font-bold mt-16 mb-4 scroll-mt-20">
      <a href={`#${id}`} className="hover:underline">
        {children}
      </a>
    </h2>
  );
}

export function H3({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h3 id={id} className="text-lg font-semibold mt-10 mb-3 scroll-mt-20">
      <a href={`#${id}`} className="hover:underline">
        {children}
      </a>
    </h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
      {children}
    </p>
  );
}

export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-lg text-muted-foreground">{children}</p>;
}

export function Code({ code, lang }: { code: string; lang?: string }) {
  return (
    <div className="relative group">
      <pre className="rounded-lg border border-border bg-[#1c1914] text-[#e8e0d0] p-4 pr-12 text-sm overflow-x-auto leading-relaxed">
        <code className={lang ? `language-${lang}` : undefined}>{code}</code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

export function Inline({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
      {children}
    </code>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border border-border rounded-lg">
        {children}
      </table>
    </div>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-2.5 font-medium border-b border-border bg-muted">
      {children}
    </th>
  );
}

export function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-4 py-2.5 border-b border-border/60 align-top">
      {children}
    </td>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 mb-4 text-sm leading-relaxed">
      {children}
    </div>
  );
}
