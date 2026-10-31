import type { JSX } from 'preact';

/** ターミナルに出力される行の種別。 */
export type TerminalLineType =
  'input' | 'output' | 'error' | 'system' | 'matrix';

/** ターミナルのログ行データ構造。 */
export interface TerminalLine {
  /** 一意識別子。 */
  id: string;
  /** 出力行の種別。 */
  type: TerminalLineType;
  /** プレーンテキスト内容 (オプション)。 */
  text?: string;
  /** 装飾付き JSX ノード (オプション)。 */
  node?: JSX.Element;
}

/** 仮想ファイルシステムのファイル定義。 */
export interface VirtualFile {
  /** ファイル名。 */
  name: string;
  /** ファイルの説明。 */
  description: string;
  /** ファイル本文。 */
  content: string;
}

/** コマンド実行時に渡される実行コンテキスト。 */
export interface CommandContext {
  /** ログ行を追加する。 */
  addLine: (_line: Omit<TerminalLine, 'id'>) => void;
  /** 複数行を一括追加する。 */
  addLines: (_lines: Omit<TerminalLine, 'id'>[]) => void;
  /** 画面バッファを消去する。 */
  clearLines: () => void;
  /** ターミナルモーダルを閉じる。 */
  closeTerminal: () => void;
  /** サイト全体の配色テーマを切り替える。 */
  setTheme: (_theme: 'dark' | 'light') => void;
  /** ページ遷移を実行する。 */
  navigateTo: (_url: string) => void;
  /** コマンド実行中のビジー状態を設定する。 */
  setBusy: (_busy: boolean) => void;
  /** コマンド実行中のビジー状態を取得する。 */
  isBusy: () => boolean;
}

/** コマンドハンドラ関数の型。 */
export type CommandHandler = (
  _args: string[],
  _context: CommandContext,
) => Promise<void> | void;

/** コマンド定義情報。 */
export interface CommandDefinition {
  /** コマンド名。 */
  name: string;
  /** コマンドの簡単な説明。 */
  description: string;
  /** 使用方法の構文例。 */
  usage?: string;
  /** 引数やサブコマンドの補完候補一覧 (オプション)。 */
  subCommands?: string[];
  /** コマンドの実行関数。 */
  handler: CommandHandler;
}
