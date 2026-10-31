import type { CommandDefinition, CommandContext } from '../types';
import { systemCommands } from './systemCommands';
import { contentCommands } from './contentCommands';
import { fsCommands } from './fsCommands';
import { easterEggCommands } from './easterEggCommands';

/**
 * 登録されている全コマンド定義のマスターリスト。
 */
export const allCommands: CommandDefinition[] = [
  ...systemCommands,
  ...contentCommands,
  ...fsCommands,
  ...easterEggCommands,
];

/**
 * 入力文字列をコマンド名と引数配列に分割する。
 * 二重引用符または単一引用符で囲まれた空白を含む引数にも対応する。
 *
 * @param input ユーザーが入力したコマンドライン文字列。
 * @returns コマンド名と引数リストのタプル。
 */
export function tokenizeInput(input: string): {
  commandName: string;
  args: string[];
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { commandName: '', args: [] };
  }

  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  const tokens: string[] = [];
  let match: RegExpExecArray | null = null;

  while ((match = regex.exec(trimmed)) !== null) {
    if (match[1] !== undefined) {
      tokens.push(match[1]);
    } else if (match[2] !== undefined) {
      tokens.push(match[2]);
    } else {
      tokens.push(match[0]);
    }
  }

  const commandName = tokens[0]?.toLowerCase() || '';
  const args = tokens.slice(1);
  return { commandName, args };
}

/**
 * コマンドディスパッチャ。
 * 入力コマンドを探索してハンドラを実行する。
 *
 * @param input ユーザーの入力文字列。
 * @param context コマンド実行環境コンテキスト。
 */
export async function executeCommand(
  input: string,
  context: CommandContext,
): Promise<void> {
  const { commandName, args } = tokenizeInput(input);
  if (!commandName) {
    return;
  }

  const command = allCommands.find((c) => c.name.toLowerCase() === commandName);

  if (!command) {
    context.addLine({
      type: 'error',
      text: `mi-sh: コマンドが見つかりません: '${commandName}'。'help' を実行して利用可能なコマンドを確認してください。`,
    });
    return;
  }

  try {
    await command.handler(args, context);
  } catch (err) {
    context.addLine({
      type: 'error',
      text: `コマンド実行時エラー: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
}

/**
 * Tab補完候補の計算結果インターフェース。
 */
export interface CompletionResult {
  /** 補完後の入力文字列 (一意に確定した場合)。 */
  completedInput?: string;
  /** 一致した候補一覧 (複数ある場合)。 */
  candidates: string[];
}

/**
 * 現在の入力文字列に基づいてTab自動補完を行う。
 *
 * @param currentInput 現在の入力中の文字列。
 * @returns 補完結果情報。
 */
export function computeCompletion(currentInput: string): CompletionResult {
  const trimmed = currentInput.trimStart();
  const parts = trimmed.split(/\s+/);

  // 1単語目 (コマンド名) の補完。
  if (parts.length === 1) {
    const prefix = parts[0].toLowerCase();
    const commandNames = allCommands.map((c) => c.name);
    const matches = commandNames.filter((name) =>
      name.toLowerCase().startsWith(prefix),
    );

    if (matches.length === 1) {
      return {
        completedInput: matches[0] + ' ',
        candidates: matches,
      };
    }
    return {
      candidates: matches,
    };
  }

  // 2単語目以降 (サブコマンド / 引数 / ファイル名) の補完。
  const commandName = parts[0].toLowerCase();
  const command = allCommands.find((c) => c.name.toLowerCase() === commandName);
  const currentArg = parts[parts.length - 1].toLowerCase();

  if (command && command.subCommands && command.subCommands.length > 0) {
    const matches = command.subCommands.filter((sub) =>
      sub.toLowerCase().startsWith(currentArg),
    );

    if (matches.length === 1) {
      const newParts = [...parts.slice(0, -1), matches[0]];
      return {
        completedInput: newParts.join(' ') + ' ',
        candidates: matches,
      };
    }
    return {
      candidates: matches,
    };
  }

  return { candidates: [] };
}
