import { useCallback } from 'preact/hooks';
import type { JSX, TargetedMouseEvent } from 'preact';
import { useTerminal } from './useTerminal';

/** クイック実行用チップの定義。 */
interface QuickChip {
  label: string;
  command: string;
}

const QUICK_CHIPS: QuickChip[] = [
  { label: 'help', command: 'help' },
  { label: 'whoami', command: 'whoami' },
  { label: 'projects', command: 'projects' },
  { label: 'history', command: 'history' },
  { label: 'skills', command: 'skills' },
  { label: 'neofetch', command: 'neofetch' },
  { label: 'sokuto', command: 'sokuto --bench' },
  { label: 'clear', command: 'clear' },
];

/**
 * Interactive Terminal Modal ([>_]) コンポーネント。
 * 開発者の技術スタックと低レイヤ思想を直接探査できる対話型CLI環境を提供する。
 */
export default function TerminalModal(): JSX.Element | null {
  const {
    isOpen,
    lines,
    input,
    setInput,
    isBusy,
    inputRef,
    terminalEndRef,
    closeTerminal,
    runCommand,
    handleKeyDown,
  } = useTerminal();

  /** ログエリアクリック時に入力プロンプトへフォーカスを復帰させる。 */
  const handleContainerClick = useCallback(() => {
    // ユーザーがテキストを選択している場合はフォーカスを強制移動しない。
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }
    inputRef.current?.focus();
  }, [inputRef]);

  /** モーダル背景クリックで閉じる。 */
  const handleBackdropClick = useCallback(
    (e: TargetedMouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        closeTerminal();
      }
    },
    [closeTerminal],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Interactive Terminal"
      class="fixed inset-0 z-50 flex animate-modal-backdrop items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6"
      onClick={handleBackdropClick}
    >
      <div
        class="relative flex h-[85dvh] w-full max-w-4xl animate-modal-content flex-col overflow-hidden rounded-lg border border-border-subtle bg-canvas/95 font-mono text-xs text-text-primary shadow-2xl backdrop-blur-md selection:bg-accent-green/20 selection:text-accent-green sm:text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ウィンドウヘッダー (macOS風コントロールとセッション情報)。 */}
        <div class="flex items-center justify-between border-b border-border-subtle bg-surface/80 px-3 py-2.5 select-none sm:px-4">
          <div class="flex items-center gap-2">
            <button
              type="button"
              onClick={closeTerminal}
              class="size-3 rounded-full bg-red-500/80 transition-colors hover:bg-red-500 focus:outline-none"
              aria-label="ターミナルを閉じる"
              title="Close (Esc)"
            />
            <button
              type="button"
              onClick={() => runCommand('clear')}
              class="size-3 rounded-full bg-yellow-500/80 transition-colors hover:bg-yellow-500 focus:outline-none"
              aria-label="画面を消去する"
              title="Clear"
            />
            <div
              class="size-3 rounded-full bg-green-500/80"
              aria-hidden="true"
            />
          </div>

          <div class="flex items-center gap-2 text-xs text-text-muted">
            <span class="text-accent-green">&gt;_</span>
            <span class="font-semibold text-text-secondary">
              guest@mi1222: ~ (tty1)
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span class="hidden rounded border border-border-subtle px-1.5 py-0.5 text-[11px] text-text-muted sm:inline-block">
              Esc to exit
            </span>
            <button
              type="button"
              onClick={closeTerminal}
              class="p-1 text-text-muted hover:text-text-primary focus:outline-none"
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ターミナル出力ログ領域。 */}
        <div
          role="log"
          aria-live="polite"
          class="flex-1 space-y-1.5 overflow-y-auto scroll-smooth p-3 sm:p-4"
          onClick={handleContainerClick}
        >
          {lines.map((line) => {
            if (line.type === 'input') {
              return (
                <div key={line.id} class="flex items-start gap-2 pt-1">
                  <span class="font-bold text-accent-green select-none">
                    guest@mi1222:~$
                  </span>
                  <span class="font-medium text-text-primary">{line.text}</span>
                </div>
              );
            }

            if (line.type === 'error') {
              return (
                <div key={line.id} class="leading-relaxed text-red-400">
                  {line.text}
                </div>
              );
            }

            if (line.type === 'system') {
              return (
                <div key={line.id} class="leading-relaxed text-text-muted">
                  {line.text}
                </div>
              );
            }

            if (line.type === 'matrix') {
              return (
                <div
                  key={line.id}
                  class="overflow-hidden font-bold tracking-widest whitespace-nowrap text-accent-green opacity-90"
                >
                  {line.text}
                </div>
              );
            }

            // 通常 output の描画。
            return (
              <div key={line.id} class="leading-relaxed">
                {line.node ? (
                  line.node
                ) : (
                  <div class="whitespace-pre-wrap text-text-secondary">
                    {line.text}
                  </div>
                )}
              </div>
            );
          })}

          {/* 現在のプロンプト入力行。 */}
          <div class="flex items-center gap-2 pt-1">
            <label
              htmlFor="terminal-input"
              class="shrink-0 font-bold text-accent-green select-none"
            >
              guest@mi1222:~$
            </label>
            <div class="relative flex flex-1 items-center">
              <input
                id="terminal-input"
                ref={inputRef}
                type="text"
                value={input}
                onInput={(e) => setInput(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                disabled={isBusy}
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck={false}
                class="w-full border-0 bg-transparent p-0 font-mono text-xs text-text-primary focus:ring-0 focus:outline-none sm:text-sm"
              />
              {isBusy && (
                <span class="ml-1 inline-block h-4 w-2 animate-pulse bg-accent-cyan" />
              )}
            </div>
          </div>

          <div ref={terminalEndRef} />
        </div>

        {/* 下部クイックチップバー (モバイルおよび初見ユーザー向け)。 */}
        <div class="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-t border-border-subtle bg-surface/50 px-3 py-2 select-none">
          <span class="mr-1 shrink-0 text-[11px] text-text-muted">Quick:</span>
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              disabled={isBusy}
              onClick={() => runCommand(chip.command)}
              class="hover:bg-surface-hover shrink-0 cursor-pointer rounded border border-border-subtle bg-surface px-2 py-0.5 font-mono text-[11px] transition-colors hover:border-accent-green/40 hover:text-accent-green disabled:opacity-50"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
