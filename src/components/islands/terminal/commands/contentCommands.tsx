import type { CommandDefinition, CommandContext } from '../types';
import { projects } from '../../../../data/projects';
import { timelineCommits } from '../../../../data/history';

/**
 * プロジェクト・経歴・プロフィールなどのコンテンツ系コマンド群。
 */
export const contentCommands: CommandDefinition[] = [
  {
    name: 'whoami',
    description: '制作者のプロフィールとエンジニアリング思想を表示する。',
    usage: 'whoami',
    handler: (_args: string[], context: CommandContext) => {
      context.addLine({
        type: 'output',
        node: (
          <div class="space-y-1.5 py-1 text-xs">
            <div class="text-sm font-bold tracking-wide text-accent-cyan">
              MI-1222 | Systems, Cloud & Developer Experience Engineer
            </div>
            <div class="text-text-secondary">
              東京科学大学 (旧 東京工業大学) 所属。
            </div>
            <div class="leading-relaxed text-text-primary">
              Rust による非自己回帰型推論エンジンや高精度パーサー、Go / Cloud
              Run によるマイクロサービス、Lean 4
              による形式検証定理証明スキルの開発を探求しています。
            </div>
            <div class="flex flex-wrap gap-2 pt-1 text-[11px]">
              <span class="rounded border border-border-subtle bg-surface px-2 py-0.5 text-accent-cyan">
                Rust
              </span>
              <span class="rounded border border-border-subtle bg-surface px-2 py-0.5 text-accent-cyan">
                Go
              </span>
              <span class="rounded border border-border-subtle bg-surface px-2 py-0.5 text-accent-purple">
                Lean 4
              </span>
              <span class="text-accent-orange rounded border border-border-subtle bg-surface px-2 py-0.5">
                Cloudflare Workers
              </span>
              <span class="rounded border border-border-subtle bg-surface px-2 py-0.5 text-text-secondary">
                Astro 5.x
              </span>
            </div>
            <div class="pt-1 text-[11px] text-text-muted">
              関連コマンド: 'skills', 'projects', 'history', 'cat about.md'
            </div>
          </div>
        ),
      });
    },
  },
  {
    name: 'projects',
    description: '制作物の一覧または指定作品の詳細を表示する。',
    usage: 'projects [--category=<systems|cloud|productivity>] [project-id]',
    subCommands: [
      '--category=systems',
      '--category=cloud',
      '--category=productivity',
      'sokuto',
      'lean4-skills',
      'patto-md',
      'beamer-canvas',
    ],
    handler: (args: string[], context: CommandContext) => {
      // 特定IDの直接指定があるか判定する。
      const targetId = args.find((arg) => !arg.startsWith('--'));
      if (targetId) {
        const found = projects.find(
          (p) =>
            p.id.toLowerCase() === targetId.toLowerCase() ||
            p.title.toLowerCase() === targetId.toLowerCase(),
        );

        if (!found) {
          context.addLine({
            type: 'error',
            text: `制作物 '${targetId}' が見つかりませんでした。'projects' で一覧を確認してください。`,
          });
          return;
        }

        context.addLine({
          type: 'output',
          node: (
            <div class="space-y-2 py-1 text-xs">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-accent-cyan">
                  {found.title}
                </span>
                <span class="py-0.2 rounded border border-border-subtle px-1.5 font-mono text-[10px] text-text-muted uppercase">
                  {found.status}
                </span>
                {found.featured && (
                  <span class="py-0.2 bg-accent-orange/10 border-accent-orange/30 text-accent-orange rounded border px-1.5 font-mono text-[10px]">
                    Featured
                  </span>
                )}
              </div>
              <div class="text-text-secondary">{found.subtitle}</div>
              <div class="leading-relaxed text-text-primary">
                {found.summary}
              </div>

              {found.metrics && found.metrics.length > 0 && (
                <div class="grid grid-cols-2 gap-2 py-1 sm:grid-cols-3">
                  {found.metrics.map((m) => (
                    <div class="rounded border border-border-subtle bg-surface/60 p-1.5">
                      <div class="text-[10px] text-text-muted">{m.label}</div>
                      <div class="font-mono font-bold text-accent-green">
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div class="flex flex-wrap gap-1.5 pt-1">
                {found.tags.map((tag) => (
                  <span class="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
                    #{tag}
                  </span>
                ))}
              </div>

              <div class="flex gap-4 pt-1 text-[11px]">
                {found.link && (
                  <button
                    type="button"
                    class="flex cursor-pointer items-center gap-1 text-accent-cyan hover:underline"
                    onClick={() => {
                      context.closeTerminal();
                      context.navigateTo(found.link!);
                    }}
                  >
                    <span>詳細ページへ移動 →</span>
                  </button>
                )}
                {found.githubUrl && (
                  <a
                    href={found.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-text-secondary hover:text-text-primary hover:underline"
                  >
                    GitHub を開く ↗
                  </a>
                )}
              </div>
            </div>
          ),
        });
        return;
      }

      // カテゴリ絞り込み判定を行う。
      const categoryArg = args.find((arg) => arg.startsWith('--category='));
      const targetCategory = categoryArg ? categoryArg.split('=')[1] : null;

      const filtered = targetCategory
        ? projects.filter(
            (p) => p.category.toLowerCase() === targetCategory.toLowerCase(),
          )
        : projects;

      context.addLine({
        type: 'output',
        node: (
          <div class="space-y-2 py-1 text-xs">
            <div class="font-semibold text-accent-cyan">
              制作物一覧{' '}
              {targetCategory
                ? `(Category: ${targetCategory})`
                : `(全${projects.length}件)`}
              :
            </div>
            <div class="space-y-1">
              {filtered.map((item, idx) => (
                <div class="flex flex-col justify-between gap-1 border-b border-border-subtle/40 py-1 last:border-0 sm:flex-row sm:items-center">
                  <div class="flex items-center gap-2">
                    <span class="w-6 font-mono text-text-muted">
                      [{String(idx + 1).padStart(2, '0')}]
                    </span>
                    <button
                      type="button"
                      class="cursor-pointer text-left font-bold text-accent-green hover:underline"
                      onClick={() => {
                        context.addLine({
                          type: 'input',
                          text: `projects ${item.id}`,
                        });
                        contentCommands
                          .find((c) => c.name === 'projects')
                          ?.handler([item.id], context);
                      }}
                    >
                      {item.title}
                    </button>
                    {item.featured && (
                      <span class="py-0.2 bg-accent-orange/10 text-accent-orange border-accent-orange/20 rounded border px-1 text-[9px]">
                        Top
                      </span>
                    )}
                  </div>
                  <div class="truncate text-[11px] text-text-secondary sm:max-w-md">
                    {item.subtitle}
                  </div>
                </div>
              ))}
            </div>
            <div class="pt-1 text-[11px] text-text-muted">
              ヒント: 'projects &lt;id&gt;' で詳細表示、または 'projects
              --category=&lt;systems|cloud|productivity&gt;' で絞り込めます。
            </div>
          </div>
        ),
      });
    },
  },
  {
    name: 'history',
    description: 'Git風タイムラインの直近コミットログを表示する。',
    usage: 'history [-n <count>]',
    subCommands: ['-n', '5', '10'],
    handler: (args: string[], context: CommandContext) => {
      let count = 6;
      const countIdx = args.indexOf('-n');
      if (countIdx !== -1 && args[countIdx + 1]) {
        const parsed = parseInt(args[countIdx + 1], 10);
        if (!isNaN(parsed) && parsed > 0) {
          count = parsed;
        }
      }

      const recentCommits = timelineCommits.slice(0, count);

      context.addLine({
        type: 'output',
        node: (
          <div class="space-y-1.5 py-1 font-mono text-xs">
            <div class="font-bold text-accent-cyan">
              Git Commit Graph (Recent {recentCommits.length} commits):
            </div>
            <div class="space-y-1">
              {recentCommits.map((c) => (
                <div class="flex items-start gap-2">
                  <span class="font-bold text-accent-green select-none">*</span>
                  <span class="text-accent-orange">{c.hash}</span>
                  <span class="text-text-muted">[{c.timestamp}]</span>
                  <span class="flex-1 text-text-primary">
                    {c.commitMessage}
                  </span>
                  <span class="text-[11px] text-accent-purple">
                    ({c.branch})
                  </span>
                </div>
              ))}
            </div>
            <div class="flex items-center justify-between pt-2 text-[11px]">
              <span class="text-text-muted">
                全コミット数は {timelineCommits.length} 件です。
              </span>
              <button
                type="button"
                class="cursor-pointer text-accent-cyan hover:underline"
                onClick={() => {
                  context.closeTerminal();
                  context.navigateTo('/history');
                }}
              >
                /history ページを開く →
              </button>
            </div>
          </div>
        ),
      });
    },
  },
  {
    name: 'skills',
    description: '習得技術スタックと専門領域を一覧表示する。',
    usage: 'skills',
    handler: (_args: string[], context: CommandContext) => {
      context.addLine({
        type: 'output',
        node: (
          <div class="space-y-2 py-1 text-xs">
            <div class="text-sm font-bold text-accent-cyan">
              Core Technical Matrix:
            </div>
            <div class="space-y-1.5">
              <div>
                <span class="inline-block w-28 font-bold text-accent-green">
                  Systems & Core:
                </span>
                <span class="text-text-primary">
                  Rust (Non-autoregressive Inference, Memory Safety), Go, Lean 4
                  (Formal Verification)
                </span>
              </div>
              <div>
                <span class="inline-block w-28 font-bold text-accent-green">
                  Cloud & Infra:
                </span>
                <span class="text-text-primary">
                  Cloudflare Workers / D1 / R2, Google Cloud Run, Terraform,
                  Docker
                </span>
              </div>
              <div>
                <span class="inline-block w-28 font-bold text-accent-green">
                  Frontend & Edge:
                </span>
                <span class="text-text-primary">
                  Astro 5.x, TypeScript, Preact, Tailwind CSS v4, WebAssembly
                </span>
              </div>
              <div>
                <span class="inline-block w-28 font-bold text-accent-green">
                  Certifications:
                </span>
                <span class="text-text-primary">
                  応用情報技術者 (AP), 基本情報技術者 (FE), LPIC-1
                </span>
              </div>
            </div>
            <div class="pt-1 text-[11px] text-text-muted">
              ヒント: 'cat skills.txt' でより詳細な定義ファイルを閲覧できます。
            </div>
          </div>
        ),
      });
    },
  },
];
