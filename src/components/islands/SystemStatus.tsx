import { useEffect, useState } from 'preact/hooks';
import type { JSX } from 'preact';

/**
 * システム稼働ステータスを表示する Preact アイランド。
 * クライアントハイドレーションの確認と、ヘッダーにおける HUD 風の対話表示を提供する。
 *
 * @returns 稼働ステータスバッジの JSX 要素。
 */
export default function SystemStatus(): JSX.Element {
  /** クライアント側でハイドレーションが完了したかを管理するフラグ。 */
  const [isHydrated, setIsHydrated] = useState(false);

  /** 表示モードの管理値 (0: `NOMINAL`, 1: `ACTIVE`, 2: `LATENCY`)。 */
  const [mode, setMode] = useState<number>(0);

  /** 応答時間の擬似メトリクス (ミリ秒)。ハイドレーション完了後に 8〜16ms を算出する。 */
  const [latency, setLatency] = useState<number>(12);

  useEffect(() => {
    setIsHydrated(true);
    setLatency(Math.floor(Math.random() * 9) + 8);
  }, []);

  /** クリック時に表示モードを順に切り替える。 */
  const handleToggleMode = (): void => {
    setMode((prev) => (prev + 1) % 3);
  };

  /**
   * 現在の `mode` に応じた表示ラベルを取得する。
   *
   * @returns 表示用のテキスト。
   */
  const getStatusText = (): string => {
    if (!isHydrated || mode === 0) {
      return 'SYS: NOMINAL';
    }
    if (mode === 1) {
      return 'SYS: ACTIVE';
    }
    return `LATENCY: ${latency}ms`;
  };

  return (
    <button
      type="button"
      onClick={handleToggleMode}
      aria-label="システムステータス表示の切り替え"
      title={
        isHydrated ? 'クリックでステータス表示を切り替え' : 'システム正常稼働中'
      }
      class="group hidden cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle bg-surface/60 px-2.5 py-0.5 font-mono text-[11px] text-text-secondary transition-all hover:border-accent-green/50 hover:bg-surface sm:inline-flex"
    >
      <span class="relative flex size-2">
        <span class="absolute inline-flex size-full animate-ping rounded-full bg-accent-green opacity-75"></span>
        <span class="relative inline-flex size-2 rounded-full bg-accent-green"></span>
      </span>
      <span class="transition-colors group-hover:text-text-primary">
        {getStatusText()}
      </span>
      {isHydrated && (
        <span class="text-[9px] text-text-muted opacity-60 group-hover:opacity-100">
          ▾
        </span>
      )}
    </button>
  );
}
