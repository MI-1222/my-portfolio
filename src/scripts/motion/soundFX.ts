/**
 * Web Audio API を用いたゼロアセット音響フィードバックモジュール。
 * 外部音声ファイルを読み込まず、オシレーターから微小なパルス合成音を動的に生成する。
 */

/** 音声設定を保持するローカルストレージのキー。 */
const AUDIO_STORAGE_KEY = 'portfolio-sound-enabled';

/** `AudioContext` のシングルトンインスタンス。 */
let audioContext: AudioContext | null = null;

/** 音声フィードバックが有効かどうかのフラグ。 */
let isSoundEnabled = false;

/**
 * `AudioContext` を安全に取得または生成する。
 * サスペンド状態の場合は自動で `resume()` を試行する。
 *
 * @returns 初期化された `AudioContext`、または非対応環境では `null`。
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }

  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
}

/** 音声フィードバックの初期設定を読み込み、初回操作時のサスペンド解除リスナーを登録する。 */
export function initSoundFX(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const saved = localStorage.getItem(AUDIO_STORAGE_KEY);
    isSoundEnabled = saved === 'true';
  } catch {
    isSoundEnabled = false;
  }

  /** 初回ユーザー操作時に `AudioContext` のサスペンドを解除するリスナー。 */
  const unlockAudio = (): void => {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };

  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}

/**
 * 音声フィードバックの有効・無効を切り替え、設定変更イベント `sound-fx-toggle` を発行する。
 *
 * @returns 切り替え後の有効状態。
 */
export function toggleSoundFX(): boolean {
  isSoundEnabled = !isSoundEnabled;
  try {
    localStorage.setItem(AUDIO_STORAGE_KEY, String(isSoundEnabled));
  } catch {
    // ローカルストレージへの書き込み不可時は継続する。
  }

  if (isSoundEnabled) {
    getAudioContext();
    playToneSound(880, 0.03, 0.02);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sound-fx-toggle', {
        detail: { enabled: isSoundEnabled },
      }),
    );
  }

  return isSoundEnabled;
}

/**
 * 現在の音声フィードバックが有効かどうかを判定する。
 *
 * @returns 有効な場合は `true`、無効な場合は `false`。
 */
export function isAudioEnabled(): boolean {
  return isSoundEnabled;
}

/**
 * 指定した周波数と長さで短パルス音を合成・再生する。
 *
 * @param frequency 発振周波数(Hz)。
 * @param duration 再生時間(秒)。
 * @param volume 音量(0.0〜1.0)。
 */
export function playToneSound(
  frequency = 1200,
  duration = 0.015,
  volume = 0.012,
): void {
  if (!isSoundEnabled) {
    return;
  }

  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') {
    return;
  }

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      frequency * 0.6,
      ctx.currentTime + duration,
    );

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // 音声再生に失敗した場合は処理を継続する。
  }
}

/** スイッチやボタンクリック時の極小パルス音を再生する。 */
export function playClickSound(): void {
  playToneSound(1400, 0.012, 0.015);
}

/** ターミナル入力やキータッチ時の微細なタップ音を再生する。 */
export function playKeySound(): void {
  playToneSound(1800, 0.008, 0.008);
}
