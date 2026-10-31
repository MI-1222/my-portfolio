import type { CommandDefinition, CommandContext } from '../types';
import { VIRTUAL_FILES } from '../virtualFs';

/**
 * 仮想ファイルシステム関連コマンド (ls, cat, pwd) の定義。
 */
export const fsCommands: CommandDefinition[] = [
  {
    name: 'ls',
    description: 'カレントディレクトリのファイル一覧を表示する。',
    usage: 'ls [-a]',
    subCommands: ['-a', '-la'],
    handler: (args: string[], context: CommandContext) => {
      const showAll = args.includes('-a') || args.includes('-la');
      const files = Object.keys(VIRTUAL_FILES).filter((name) => {
        if (!showAll && name.startsWith('.')) {
          return false;
        }
        return true;
      });

      context.addLine({
        type: 'output',
        node: (
          <div class="space-y-1 py-1 font-mono text-xs">
            <div class="flex flex-wrap gap-4">
              {files.map((file) => {
                const isDot = file.startsWith('.');
                return (
                  <span
                    class={
                      isDot
                        ? 'text-accent-orange font-semibold'
                        : 'font-bold text-accent-cyan'
                    }
                  >
                    {file}
                  </span>
                );
              })}
            </div>
            <div class="pt-1 text-[11px] text-text-muted">
              {showAll
                ? `合計: ${files.length} 件 (隠しファイルを含む)`
                : `合計: ${files.length} 件 ('ls -a' で隠しファイルを表示)`}
            </div>
          </div>
        ),
      });
    },
  },
  {
    name: 'cat',
    description: '仮想ファイルの内容を表示する。',
    usage: 'cat <filename>',
    subCommands: Object.keys(VIRTUAL_FILES),
    handler: (args: string[], context: CommandContext) => {
      if (args.length === 0) {
        context.addLine({
          type: 'error',
          text: "使用方法: cat <filename> (例: 'cat about.md')",
        });
        return;
      }

      const filename = args[0];
      const target = VIRTUAL_FILES[filename];

      if (!target) {
        context.addLine({
          type: 'error',
          text: `cat: ${filename}: そのようなファイルやディレクトリはありません。'ls' で確認してください。`,
        });
        return;
      }

      context.addLine({
        type: 'output',
        node: (
          <div class="my-1 border-l-2 border-accent-cyan/40 py-1 pl-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-text-primary">
            {target.content}
          </div>
        ),
      });
    },
  },
  {
    name: 'pwd',
    description: '現在の作業ディレクトリパスを出力する。',
    usage: 'pwd',
    handler: (_args: string[], context: CommandContext) => {
      context.addLine({
        type: 'output',
        text: '/home/guest',
      });
    },
  },
];
