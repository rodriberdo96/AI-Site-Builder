import { HttpError } from '../utils/http-error.js';

const forbiddenTags = ['script', 'iframe', 'object', 'embed', 'applet', 'base', 'form', 'input', 'button', 'textarea', 'select', 'link'];
const dangerousUrlPattern = /(?:javascript|data|vbscript|file):/i;
const eventHandlerPattern = /\son[a-z]+\s*=/i;
const dangerousCssPattern = /expression\s*\(|@import|url\s*\(\s*(['"]?)\s*(?:javascript|data|vbscript|file):/i;
const serverCodePattern = /\b(?:require\s*\(|import\s+.*\s+from\s+['"](?:fs|child_process|net|tls|http|https|os|path|process)|process\.|eval\s*\(|Function\s*\(|fetch\s*\(\s*['"]https?:\/\/169\.254\.169\.254)/i;
const namedEntityMap: Record<string, string> = { colon: ':', newline: '\n', tab: '\t' };
const decodeCodePoint = (value: number): string => (
  Number.isInteger(value)
  && value >= 0
  && value <= 0x10ffff
  && !(value >= 0xd800 && value <= 0xdfff)
    ? String.fromCodePoint(value)
    : ''
);

const normalizeForUrlChecks = (value: string): string => value
  .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) => decodeCodePoint(Number.parseInt(hex, 16)))
  .replace(/&#(\d+);?/g, (_, decimal: string) => decodeCodePoint(Number.parseInt(decimal, 10)))
  .replace(/&([a-z]+);/gi, (match, entity: string) => namedEntityMap[entity.toLowerCase()] ?? match)
  .replace(/[\u0000-\u0020\u007f]+/g, '');

export const sanitizeHtml = (html: string): string => {
  let sanitized = html;

  for (const tag of forbiddenTags) {
    const paired = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    const selfClosing = new RegExp(`<${tag}\\b[^>]*\/?>`, 'gi');
    sanitized = sanitized.replace(paired, '').replace(selfClosing, '');
  }

  sanitized = sanitized
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(href|src|xlink:href)\s*=\s*(["']?)\s*(javascript|data|vbscript|file):[^"'\s>]*/gi, '')
    .replace(/style\s*=\s*("[^"]*"|'[^']*')/gi, (match) => (dangerousCssPattern.test(match) ? '' : match));

  return sanitized;
};

export const assertSafeGeneratedCode = (html: string): string => {
  if (html.length > 500_000) {
    throw new HttpError(413, 'Generated website is too large', 'GENERATED_CODE_TOO_LARGE');
  }

  const lowerHtml = html.toLowerCase();
  const normalizedHtml = normalizeForUrlChecks(html);
  const foundTag = forbiddenTags.find((tag) => new RegExp(`<${tag}\\b`, 'i').test(lowerHtml));
  if (foundTag) {
    throw new HttpError(400, `Generated website contains blocked <${foundTag}> content`, 'UNSAFE_GENERATED_CODE');
  }

  if (
    eventHandlerPattern.test(html)
    || dangerousUrlPattern.test(html)
    || dangerousCssPattern.test(html)
    || serverCodePattern.test(html)
    || dangerousUrlPattern.test(normalizedHtml)
    || dangerousCssPattern.test(normalizedHtml)
  ) {
    throw new HttpError(400, 'Generated website contains unsafe executable content', 'UNSAFE_GENERATED_CODE');
  }

  return sanitizeHtml(html);
};

export const createSafeStaticWebsite = (prompt: string): string => {
  const safePrompt = prompt.replace(/[<>]/g, '').slice(0, 280);
  const title = safePrompt.split(/[.!?]/)[0]?.trim() || 'AI Website';

  return assertSafeGeneratedCode(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: linear-gradient(135deg, #111827, #312e81 52%, #020617); color: #f8fafc; }
    main { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 72px 0; }
    nav, .hero, .card { border: 1px solid rgba(255,255,255,.14); background: rgba(15,23,42,.72); backdrop-filter: blur(18px); border-radius: 24px; box-shadow: 0 24px 80px rgba(0,0,0,.28); }
    nav { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; margin-bottom: 32px; }
    .brand { font-weight: 800; letter-spacing: -.03em; }
    .hero { padding: clamp(40px, 8vw, 88px); text-align: center; }
    h1 { margin: 0; font-size: clamp(2.6rem, 7vw, 5.8rem); line-height: .95; letter-spacing: -.07em; }
    p { color: #cbd5e1; font-size: 1.08rem; line-height: 1.75; }
    .cta { display: inline-flex; margin-top: 22px; padding: 14px 22px; border-radius: 999px; background: #6366f1; color: white; font-weight: 700; text-decoration: none; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: 22px; }
    .card { padding: 24px; }
    @media (max-width: 760px) { .grid { grid-template-columns: 1fr; } nav { align-items: flex-start; flex-direction: column; gap: 10px; } }
  </style>
</head>
<body>
  <main>
    <nav><div class="brand">${escapeHtml(title)}</div><div>Built with AI Site Builder</div></nav>
    <section class="hero">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(safePrompt)}</p>
      <a class="cta" href="#features">Explore the website</a>
    </section>
    <section id="features" class="grid" aria-label="Website highlights">
      <article class="card"><h2>Clear message</h2><p>Focused copy and layout communicate the core value quickly.</p></article>
      <article class="card"><h2>Responsive design</h2><p>The page adapts cleanly from mobile screens to desktop displays.</p></article>
      <article class="card"><h2>Ready to edit</h2><p>Use the visual editor and chat workflow to iterate safely.</p></article>
    </section>
  </main>
</body>
</html>`);
};

const escapeHtml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');
