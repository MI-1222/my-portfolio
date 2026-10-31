import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import type { TargetedKeyboardEvent } from 'preact';
import { navigate } from 'astro:transitions/client';
import type { TerminalLine, CommandContext } from './types';
import { executeCommand, computeCompletion } from './commands/registry';
import { playClickSound, playKeySound } from '../../../scripts/motion/soundFX';

/** ログバッファの最大保持行数。 */
const MAX_LOG_LINES = 200;

/**
 * ターミナル内部の入出力バッファおよびキー操作を管理するカスタムフック。
 */
export function useTerminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const tempInputRef = useRef<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef<boolean>(false);

  /** ログ行を追加する。 */
  const addLine = useCallback((line: Omit<TerminalLine, 'id'>) => {
    const id = `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setLines((prev) => [...prev.slice(-MAX_LOG_LINES), { ...line, id }]);
  }, []);

  /** 複数行を一括追加する。 */
  const addLines = useCallback((newLines: Omit<TerminalLine, 'id'>[]) => {
    const formatted = newLines.map((line) => ({
      ...line,
      id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    }));
    setLines((prev) => [...prev.slice(-MAX_LOG_LINES), ...formatted]);
  }, []);

  /** ログ行をすべて消去する。 */
  const clearLines = useCallback(() => {
    setLines([]);
  }, []);

  /** ターミナルを閉じる。 */
  const closeTerminal = useCallback(() => {
    playClickSound();
    setIsOpen(false);
  }, []);

  /** テーマを切り替える。 */
  const setTheme = useCallback((theme: 'dark' | 'light') => {
    try {
      localStorage.setItem('portfolio-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, []);

  /** ページ遷移を実行する。 */
  const navigateTo = useCallback(
    (url: string) => {
      closeTerminal();
      if (url.startsWith('/#')) {
        const hash = url.replace('/', '');
        if (
          window.location.pathname === '/' ||
          window.location.pathname === ''
        ) {
          const target = document.querySelector(hash);
          target?.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', hash);
          return;
        }
      }
      navigate(url);
    },
    [closeTerminal],
  );

  /** 初期ウェルカムメッセージを表示する。 */
  const printWelcome = useCallback(() => {
    if (isInitializedRef.current) {
      return;
    }
    isInitializedRef.current = true;

    addLines([
      {
        type: 'system',
        text: 'SYSTEM: MI-1222 OS v2.4 (x86_64-cloudflare-workers)',
      },
      {
        type: 'system',
        text: "Type 'help' for available commands, or 'exit' to close.",
      },
    ]);
  }, [addLines]);

  /** ターミナルを開く。 */
  const openTerminal = useCallback(() => {
    playClickSound();
    window.dispatchEvent(new CustomEvent('close-cmdk'));
    setIsOpen(true);
    printWelcome();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [printWelcome]);

  /** 外部イベントやショートカットキーの購読。 */
  useEffect(() => {
    const handleOpenEvent = () => {
      openTerminal();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette (⌘K) が押されたらターミナルを閉じる。
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (isOpen) {
          closeTerminal();
        }
        return;
      }

      // ターミナルの起動ショートカット判定:
      // 1. Ctrl / Cmd + ` (US配列) または Ctrl / Cmd + @ (JIS配列 / VS Code標準)
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const isBackquoteOrAt =
        e.key === '`' ||
        e.key === '~' ||
        e.key === '@' ||
        e.code === 'Backquote' ||
        e.code === 'BracketLeft';

      // 2. Option + T (Alt + T): OS予約衝突を回避するアルファベットショートカット。
      const isAltT = e.altKey && e.key.toLowerCase() === 't';

      // 3. 入力欄フォーカス時以外の ` (Backquote) 単体押下。
      const target = e.target as HTMLElement | null;
      const isInputActive =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      const isBareBackquote =
        !isInputActive &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        (e.key === '`' || e.code === 'Backquote');

      if ((isCtrlOrMeta && isBackquoteOrAt) || isAltT || isBareBackquote) {
        e.preventDefault();
        if (isOpen) {
          closeTerminal();
        } else {
          openTerminal();
        }
      }
    };

    /** ページ遷移前のクローズ処理を行う。 */
    const handleBeforeSwap = (): void => {
      closeTerminal();
      document.body.style.overflow = '';
    };

    window.addEventListener('open-terminal', handleOpenEvent);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('astro:before-swap', handleBeforeSwap);

    return () => {
      window.removeEventListener('open-terminal', handleOpenEvent);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('astro:before-swap', handleBeforeSwap);
      document.body.style.overflow = '';
    };
  }, [isOpen, openTerminal, closeTerminal]);

  /** スクロールを常に最下部に追従させる。 */
  useEffect(() => {
    if (isOpen) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lines, isOpen]);

  /** モーダル表示中の背面スクロール固定制御。 */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /** コマンド実行処理。 */
  const runCommand = useCallback(
    async (commandStr: string) => {
      const trimmed = commandStr.trim();
      if (!trimmed) {
        addLine({ type: 'input', text: '' });
        return;
      }

      // プロンプト行をログに追加する。
      addLine({ type: 'input', text: trimmed });

      // 履歴配列に追加する。
      setHistory((prev) => [...prev, trimmed]);
      setHistoryIndex(-1);
      setInput('');
      playClickSound();

      const context: CommandContext = {
        addLine,
        addLines,
        clearLines,
        closeTerminal,
        setTheme,
        navigateTo,
        setBusy: setIsBusy,
        isBusy: () => isBusy,
      };

      await executeCommand(trimmed, context);
    },
    [
      addLine,
      addLines,
      clearLines,
      closeTerminal,
      setTheme,
      navigateTo,
      isBusy,
    ],
  );

  /** キー入力イベントハンドラ。 */
  const handleKeyDown = useCallback(
    async (e: TargetedKeyboardEvent<HTMLInputElement>) => {
      // 日本語IME変換中のEnter誤爆を防止する。
      if (e.isComposing || e.keyCode === 229) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (isBusy) {
          return;
        }
        await runCommand(input);
        return;
      }

      // Tab補完。
      if (e.key === 'Tab') {
        e.preventDefault();
        playKeySound();
        if (isBusy || !input.trim()) {
          return;
        }
        const { completedInput, candidates } = computeCompletion(input);
        if (completedInput) {
          setInput(completedInput);
        } else if (candidates.length > 1) {
          addLine({
            type: 'system',
            text: `補完候補: ${candidates.join('  ')}`,
          });
        }
        return;
      }

      // ↑キー (過去の履歴へ戻る)。
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        playKeySound();
        if (history.length === 0) {
          return;
        }

        if (historyIndex === -1) {
          tempInputRef.current = input;
          const nextIdx = history.length - 1;
          setHistoryIndex(nextIdx);
          setInput(history[nextIdx]);
        } else if (historyIndex > 0) {
          const nextIdx = historyIndex - 1;
          setHistoryIndex(nextIdx);
          setInput(history[nextIdx]);
        }
        return;
      }

      // ↓キー (未来の履歴へ進む)。
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        playKeySound();
        if (historyIndex === -1) {
          return;
        }

        if (historyIndex < history.length - 1) {
          const nextIdx = historyIndex + 1;
          setHistoryIndex(nextIdx);
          setInput(history[nextIdx]);
        } else {
          setHistoryIndex(-1);
          setInput(tempInputRef.current);
        }
        return;
      }

      // Ctrl + C (現在入力を破棄して新プロンプト)。
      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        addLine({ type: 'input', text: `${input}^C` });
        setInput('');
        setHistoryIndex(-1);
        return;
      }

      // Ctrl + L (画面クリア)。
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        clearLines();
        return;
      }

      // Esc (モーダルを閉じる)。
      if (e.key === 'Escape') {
        e.preventDefault();
        closeTerminal();
        return;
      }
    },
    [
      input,
      isBusy,
      history,
      historyIndex,
      runCommand,
      computeCompletion,
      addLine,
      clearLines,
      closeTerminal,
    ],
  );

  return {
    isOpen,
    lines,
    input,
    setInput,
    isBusy,
    inputRef,
    terminalEndRef,
    openTerminal,
    closeTerminal,
    runCommand,
    handleKeyDown,
  };
}
