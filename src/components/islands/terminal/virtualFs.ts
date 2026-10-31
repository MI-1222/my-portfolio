import type { VirtualFile } from './types';

/** 仮想ファイルシステムに格納される静的ファイル一覧。 */
export const VIRTUAL_FILES: Record<string, VirtualFile> = {
  'about.md': {
    name: 'about.md',
    description: 'プロフィールと設計思想の要約。',
    content: `# MI-1222 | Profile & Engineering Focus

- 所属: 東京科学大学 (旧 東京工業大学)
- 領域: Systems Software, Cloud Edge Architecture, Formal Verification
- 思想: 決定論的挙動、極小オーバーヘッド、型の恩恵を最大化する設計。
- 言語: Rust, Go, TypeScript, Lean 4
- 探求テーマ: 非自己回帰型モデルの超低遅延推論、定理証明系による安全性の数学的保証。
`,
  },
  'skills.txt': {
    name: 'skills.txt',
    description: '主要技術スタックと専門領域一覧。',
    content: `=====================================================
MI-1222 Technical Matrix
=====================================================

[Systems & Core]
- Rust: Non-autoregressive Inference, Memory Safety, CST Parsers
- Go: Cloud Run, Concurrency Pipelines, Edge Microservices
- Lean 4: Formal Verification, Mathlib, Interactive Theorem Proving

[Web & Cloud Platform]
- Cloudflare: Workers, D1, R2, Pages (Edge-native SSG/SSR)
- Astro 5.x: Content-driven Architecture, Zero-JS by default
- TypeScript & Tailwind CSS v4: Strict Type Safety & Token Design

[Engineering Standards]
- Clean Architecture, Zero-copy Deserialization, AST/CST Manipulation
`,
  },
  'contact.txt': {
    name: 'contact.txt',
    description: '公開連絡先とリポジトリリンク。',
    content: `[GitHub] https://github.com/MI-1222
[Portfolio] https://mi-1222.com (or current origin)
[Interactive] Use Command Palette (⌘K) or Terminal ([>_]) for fast navigation.
`,
  },
  '.secret': {
    name: '.secret',
    description: '隠しシステム設定ファイル。',
    content: `FLAG{RUST_MEMORY_SAFETY_AND_LEAN4_FORMAL_TRUTH}
Note: You found the hidden dotfile. No vulnerabilities here, only determinism!
`,
  },
};
