import type { CommandDefinition, CommandContext } from '../types';

/**
 * ユーモアと技術スタックの深さを表現するイースターエッグコマンド群。
 */
export const easterEggCommands: CommandDefinition[] = [
  {
    name: 'neofetch',
    description: 'システム情報とASCIIアートロゴを表示する。',
    usage: 'neofetch',
    subCommands: ['--short'],
    handler: (_args: string[], context: CommandContext) => {
      const asciiLogo = `
      /\\
     /  \\       MI-1222 OS
    /\\   \\      -------------------
   /  \\   \\     OS: WebAssembly / Cloudflare Workers
  /    \\  /     Host: Apple M4 Max (Emulated)
 /  /\\  \\/      Kernel: Astro 5.x + Preact 11
/  /  \\  \\      Uptime: 2004-12-22 ~ Present
\\ /    \\ /      Shell: mi-sh v1.0.0
 \\______/       Languages: Rust, Go, TS, Lean 4
                Terminal: Interactive Web CLI [>_]
                Theme: Cyber Minimalist Slate
`;

      context.addLine({
        type: 'output',
        node: (
          <div class="py-1 font-mono text-xs leading-snug whitespace-pre text-accent-cyan">
            {asciiLogo}
          </div>
        ),
      });
    },
  },
  {
    name: 'sysinfo',
    description:
      'システム構成とランタイム情報を表示する (neofetchのエイリアス)。',
    usage: 'sysinfo',
    handler: (args: string[], context: CommandContext) => {
      const neofetch = easterEggCommands.find((c) => c.name === 'neofetch');
      neofetch?.handler(args, context);
    },
  },
  {
    name: 'sokuto',
    description:
      'sokuto 非自己回帰型判断推論エンジンのベンチマークをシミュレートする。',
    usage: 'sokuto [--bench]',
    subCommands: ['--bench', '--version', '--metrics'],
    handler: async (args: string[], context: CommandContext) => {
      context.setBusy(true);

      context.addLine({
        type: 'system',
        text: 'Initializing sokuto inference runtime (ModernBERT-ja ONNX / Direct)...',
      });

      await new Promise((resolve) => setTimeout(resolve, 200));

      context.addLine({
        type: 'output',
        text: '[1/3] Loading non-autoregressive decision model weights... OK (42.8 MB)',
      });

      await new Promise((resolve) => setTimeout(resolve, 250));

      context.addLine({
        type: 'output',
        text: '[2/3] Warming up KV-cache free parallel token evaluator... OK',
      });

      await new Promise((resolve) => setTimeout(resolve, 300));

      context.addLine({
        type: 'output',
        node: (
          <div class="my-1 space-y-1 rounded border border-border-subtle bg-surface/70 p-2 font-mono text-xs">
            <div class="font-bold text-accent-cyan">
              [3/3] Inference Benchmark Results:
            </div>
            <div class="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
              <div>
                <span class="block text-[10px] text-text-muted">
                  Deterministic Latency (p50)
                </span>
                <span class="font-bold text-accent-green">12.61 ms</span>
              </div>
              <div>
                <span class="block text-[10px] text-text-muted">
                  Expected Calibration Error (ECE)
                </span>
                <span class="font-bold text-accent-cyan">2.08 %</span>
              </div>
              <div>
                <span class="block text-[10px] text-text-muted">
                  Throughput
                </span>
                <span class="font-bold text-text-primary">79.3 req/s</span>
              </div>
              <div>
                <span class="block text-[10px] text-text-muted">Safety</span>
                <span class="text-accent-orange font-bold">Rust 2024</span>
              </div>
            </div>
            <div class="pt-1 text-[11px] text-text-secondary">
              STATUS: Non-autoregressive classification converged in single
              forward pass.
            </div>
          </div>
        ),
      });

      context.setBusy(false);
    },
  },
  {
    name: 'lean',
    description: 'Lean 4 / Mathlib 定理証明エンジンの検証サイクルを実行する。',
    usage: 'lean [--verify]',
    subCommands: ['--verify', 'prove', 'check'],
    handler: async (_args: string[], context: CommandContext) => {
      context.setBusy(true);

      context.addLine({
        type: 'system',
        text: 'Checking formal specification state machine with Lean 4 kernel...',
      });

      await new Promise((resolve) => setTimeout(resolve, 180));

      context.addLine({
        type: 'output',
        text: '⊢ ∀ (sys : PortfolioState), MemorySafe sys ∧ Deterministic sys',
      });

      await new Promise((resolve) => setTimeout(resolve, 200));

      context.addLine({
        type: 'output',
        text: '  tactic: intro sys',
      });

      await new Promise((resolve) => setTimeout(resolve, 180));

      context.addLine({
        type: 'output',
        text: '  tactic: apply And.intro <;> exact proof_by_construction',
      });

      await new Promise((resolve) => setTimeout(resolve, 220));

      context.addLine({
        type: 'output',
        node: (
          <div class="my-1 border-l-2 border-accent-purple bg-accent-purple/5 px-2 py-1 font-mono text-xs">
            <span class="font-bold text-accent-purple">
              Goals accomplished. Q.E.D. ✓
            </span>
            <div class="text-[11px] text-text-secondary">
              All formal propositions verified with 0 axioms added.
            </div>
          </div>
        ),
      });

      context.setBusy(false);
    },
  },
  {
    name: 'curl',
    description: '指定されたURLまたはリソースの内容を取得する。',
    usage: 'curl [-sL] <url|resume>',
    subCommands: ['resume', '/api/resume', 'https://mi1222.dev'],
    handler: (args: string[], context: CommandContext) => {
      const target = args.find((a) => !a.startsWith('-'))?.toLowerCase();

      if (
        target === 'resume' ||
        target === '/api/resume' ||
        target === '/resume'
      ) {
        context.addLine({
          type: 'output',
          node: (
            <div class="space-y-1 rounded border border-border-subtle bg-surface/50 p-2 py-1 font-mono text-xs">
              <div class="border-b border-border-subtle pb-1 font-bold text-accent-cyan">
                RESUME BRIEF // MI-1222
              </div>
              <div class="text-text-secondary">
                - Education: Institute of Science Tokyo (formerly Tokyo Tech)
              </div>
              <div class="text-text-secondary">
                - Core Focus: Systems Programming, Non-autoregressive Inference,
                Edge Workers
              </div>
              <div class="text-text-secondary">
                - Primary Stack: Rust, Go, TypeScript, Lean 4, Astro
              </div>
              <div class="text-text-secondary">
                - Credentials: AP (Applied Information Technology Engineer), FE
              </div>
              <div class="pt-1 text-[11px] text-text-muted">
                Full timeline and history available at: /history
              </div>
            </div>
          ),
        });
        return;
      }

      context.addLine({
        type: 'error',
        text: `curl: (6) Could not resolve host: ${target || 'unknown'} (try: 'curl resume')`,
      });
    },
  },
  {
    name: 'sudo',
    description: 'スーパーユーザー権限でコマンドを実行する。',
    usage: 'sudo <command>',
    handler: (args: string[], context: CommandContext) => {
      context.addLine({
        type: 'error',
        text: `Permission denied: guest is not in the sudoers file. This incident will be reported to Masahiro.`,
      });
    },
  },
  {
    name: 'matrix',
    description: 'マトリックス・デジタルレインをターミナル内に走らせる。',
    usage: 'matrix',
    handler: async (_args: string[], context: CommandContext) => {
      context.setBusy(true);

      const streamChars = '01アカサタナハマヤラワ0123456789ABCDEF';
      const generateRandomLine = (): string => {
        let line = '';
        for (let i = 0; i < 48; i++) {
          line += streamChars[Math.floor(Math.random() * streamChars.length)];
        }
        return line;
      };

      for (let i = 0; i < 6; i++) {
        context.addLine({
          type: 'matrix',
          text: generateRandomLine(),
        });
        await new Promise((resolve) => setTimeout(resolve, 80));
      }

      context.addLine({
        type: 'system',
        text: 'Wake up, Neo... The Matrix has you.',
      });

      context.setBusy(false);
    },
  },
  {
    name: 'rm',
    description: 'ファイルやディレクトリを削除する。',
    usage: 'rm [-rf] <path>',
    handler: (args: string[], context: CommandContext) => {
      if (args.includes('/') || args.includes('-rf') || args.includes('.')) {
        context.addLine({
          type: 'error',
          text: "rm: refusing to remove '/': protected by Cloudflare Workers and Rust memory safety.",
        });
        return;
      }
      context.addLine({
        type: 'error',
        text: 'rm: Read-only virtual filesystem.',
      });
    },
  },
];
