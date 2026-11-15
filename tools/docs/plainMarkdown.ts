/**
 * Converts inline code spans (`like this`) to plain text so Markdown viewers that style inline code
 * in red / pink show normal body text. Fenced code blocks are kept (Flow prompts are copied from them).
 *
 *   npx tsx tools/docs/plainMarkdown.ts            # every project .md file
 *   npx tsx tools/docs/plainMarkdown.ts a.md b.md  # selected files
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SPAN = /(?<!`)(`+)(?!`)(.+?)(?<!`)\1(?!`)/g;
const FENCE = /^\s*(```|~~~)/;
const WORD = /[\p{L}\p{N}]/u;

/** Escapes characters that would turn into Markdown / HTML / math once the code span is removed. */
function escapePlain(s: string): string {
  let r = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '*' || c === '$') r += `\\${c}`;
    else if (c === '_' && !(WORD.test(s[i - 1] ?? '') && WORD.test(s[i + 1] ?? ''))) r += '\\_';
    else if (c === '<' && /[A-Za-z/!]/.test(s[i + 1] ?? '')) r += '&lt;';
    else r += c;
  }
  return r;
}

export function plainMarkdown(md: string): string {
  let inFence = false;
  return md
    .split('\n')
    .map((line) => {
      if (FENCE.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence || !line.includes('`')) return line;
      return line.replace(SPAN, (_m, _ticks: string, body: string) => {
        const inner = /^ .* $/.test(body) && body.trim() ? body.slice(1, -1) : body;
        return escapePlain(inner);
      });
    })
    .join('\n');
}

const SKIP = new Set(['node_modules', 'dist', 'public', 'raw_assets', '.git', '.cursor']);

function mdFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) mdFiles(p, out);
    else if (name.toLowerCase().endsWith('.md')) out.push(p);
  }
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const root = process.cwd();
  const files = process.argv.length > 2 ? process.argv.slice(2).map((f) => join(root, f)) : mdFiles(root);
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    const dst = plainMarkdown(src);
    if (dst !== src) {
      writeFileSync(f, dst);
      console.log(`plain: ${relative(root, f)}`);
    }
  }
}
