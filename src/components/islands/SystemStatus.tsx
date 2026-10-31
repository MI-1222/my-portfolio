import { useEffect, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import {
  isAudioEnabled,
  toggleSoundFX,
  playClickSound,
} from '../../scripts/motion/soundFX';

/**
 * システム稼働ステータスを表示する Preact アイランド。
 * クライアントハイドレーションの確認と、ヘッダーにおける HUD 風の対話表示を提供する。
 *
 * @returns 稼働ステータスバッジの JSX 要素。
 */
export default function SystemStatus(): JSX.Element {
  /** クライアント側でハイドレーションが完了したかを管理するフラグ。 */
  const [isHydrated, setIsHydrated] = useState(false);

  /** 表示モードの管理値 (0: `NOMINAL`, 1: `ACTIVE`, 2: `LATENCY`, 3: `AUDIO`)。 */
  const [mode, setMode] = useState<number>(0);

  /** 応答時間の擬似メトリクス (ミリ秒)。ハイドレーション完了後に 8〜16ms を算出する。 */
  const [latency, setLatency] = useState<number>(12);

  /** 音響フィードバックが有効かどうかの状態フラグ。 */
  const [audioActive, setAudioActive] = useState<boolean>(false);

  useEffect(() => {
    setIsHydrated(true);
    setLatency(Math.floor(Math.random() * 9) + 8);
    setAudioActive(isAudioEnabled());

    /** 音響設定のグローバル変更イベントを同期するリスナー。 */
    const handleSoundToggle = (event: Event): void => {
      const customEvent = event as CustomEvent<{ enabled: boolean }>;
      if (customEvent.detail) {
        setAudioActive(customEvent.detail.enabled);
      }
    };

    window.addEventListener('sound-fx-toggle', handleSoundToggle);
    return () => {
      window.removeEventListener('sound-fx-toggle', handleSoundToggle);
    };
  }, []);

  /**
   * クリック時に表示モードを順に切り替える。
   * 音声モード(`mode === 3`)のときは音響状態を反転して初期モードへ戻す。
   */
  const handleToggleMode = (): void => {
    playClickSound();

    if (mode === 3) {
      const newState = toggleSoundFX();
      setAudioActive(newState);
      setMode(0);
      return;
    }

    setMode((prev) => (prev + 1) % 4);
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
    if (mode === 2) {
      return `LATENCY: ${latency}ms`;
    }
    return `AUDIO: ${audioActive ? 'ON' : 'MUTE'}`;
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
