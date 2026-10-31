import type { CommandDefinition, CommandContext } from '../types';

/**
 * システム基本コマンド群 (help, clear, theme, exit, echo) の定義。
 */
export const systemCommands: CommandDefinition[] = [
  {
    name: 'help',
    description: '利用可能なコマンドの一覧と使い方を表示する。',
    usage: 'help [command]',
    handler: (args: string[], context: CommandContext) => {
      if (args.length > 0) {
        const target = args[0].toLowerCase();
        context.addLine({
          type: 'output',
          text: `詳細ヘルプ: '${target}' コマンド`,
        });
        return;
      }

      context.addLine({
        type: 'output',
        node: (
          <div class="space-y-2 py-1">
            <div class="font-semibold text-accent-cyan">
              利用可能なコマンド一覧:
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
              <div>
                <span class="inline-block w-24 font-bold text-accent-green">
                  help
                </span>
                <span class="text-text-secondary">コマンド一覧を表示</span>
              </div>
              <div>
                <span class="inline-block w-24 font-bold text-accent-green">
                  whoami
                </span>
                <span class="text-text-secondary">
                  制作者のプロフィール要約
                </span>
              </div>
              <div>
                <span class="inline-block w-24 font-bold text-accent-green">
                  projects
                </span>
                <span class="text-text-secondary">制作物一覧・詳細の探査</span>
              </div>
              <div>
                <span class="inline-block w-24 font-bold text-accent-green">
                  history
                </span>
                <span class="text-text-secondary">
                  Git風タイムラインコミットログ
                </span>
              </div>
              <div>
                <span class="inline-block w-24 font-bold text-accent-green">
                  skills
                </span>
                <span class="text-text-secondary">言語・技術スタック一覧</span>
              </div>
              <div>
                <span class="inline-block w-24 font-bold text-accent-green">
                  ls / cat
                </span>
                <span class="text-text-secondary">
                  仮想ファイルシステムの操作
                </span>
              </div>
              <div>
                <span class="inline-block w-24 font-bold text-accent-green">
                  neofetch
                </span>
                <span class="text-text-secondary">システム情報とASCIIロゴ</span>
              </div>
              <div>
                <span class="inline-block w-24 font-bold text-accent-green">
                  sokuto
                </span>
                <span class="text-text-secondary">
                  推論ベンチマークのシミュレート
                </span>
              </div>
              <div>
                <span class="inline-block w-24 font-bold text-accent-green">
                  lean
                </span>
                <span class="text-text-secondary">
                  Lean 4 形式証明の検証ログ
                </span>
              </div>
              <div>
                <span class="inline-block w-24 font-bold text-accent-green">
                  theme
                </span>
                <span class="text-text-secondary">
                  テーマ変更 (dark | light)
                </span>
              </div>
              <div>
                <span class="inline-block w-24 font-bold text-accent-green">
                  clear
                </span>
                <span class="text-text-secondary">画面ログの消去 (Ctrl+L)</span>
              </div>
              <div>
                <span class="inline-block w-24 font-bold text-accent-green">
                  exit
                </span>
                <span class="text-text-secondary">ターミナルを終了 (Esc)</span>
              </div>
            </div>
            <div class="pt-1 text-[11px] text-text-muted">
              ヒント: Tabキーでコマンド補完、↑ / ↓キーで履歴参照が可能です。
            </div>
          </div>
        ),
      });
    },
  },
  {
    name: 'clear',
    description: 'ターミナルのログ出力をすべて消去する。',
    usage: 'clear',
    handler: (_args: string[], context: CommandContext) => {
      context.clearLines();
    },
  },
  {
    name: 'exit',
    description: 'ターミナルモーダルを閉じる。',
    usage: 'exit',
    handler: (_args: string[], context: CommandContext) => {
      context.addLine({
        type: 'system',
        text: 'Session closed. Goodbye.',
      });
      setTimeout(() => {
        context.closeTerminal();
      }, 150);
    },
  },
  {
    name: 'theme',
    description: 'サイト全体の配色テーマを切り替える。',
    usage: 'theme [dark|light|toggle]',
    subCommands: ['dark', 'light', 'toggle'],
    handler: (args: string[], context: CommandContext) => {
      const mode = args[0]?.toLowerCase();
      const current =
        document.documentElement.getAttribute('data-theme') || 'dark';

      let nextTheme: 'dark' | 'light';
      if (mode === 'dark' || mode === 'light') {
        nextTheme = mode;
      } else if (mode === 'toggle' || !mode) {
        nextTheme = current === 'dark' ? 'light' : 'dark';
      } else {
        context.addLine({
          type: 'error',
          text: `不正なテーマ引数: '${mode}'。'dark', 'light', または 'toggle' を指定してください。`,
        });
        return;
      }

      context.setTheme(nextTheme);
      context.addLine({
        type: 'output',
        text: `テーマを '${nextTheme}' に切り替えました。`,
      });
    },
  },
  {
    name: 'echo',
    description: '入力されたテキストを標準出力へそのまま表示する。',
    usage: 'echo <text>',
    handler: (args: string[], context: CommandContext) => {
      context.addLine({
        type: 'output',
        text: args.join(' '),
      });
    },
  },
];
