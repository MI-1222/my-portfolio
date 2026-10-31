/**
 * スクロールトランスポート管理モジュール。
 * `Lenis` による軽量慣性スクロールと `gsap.ticker` ループを単一ループに統合し、
 * マイクロ秒単位のジッターを完全に排除する。
 */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** 現在稼働中の `Lenis` インスタンス。 */
let activeLenis: Lenis | null = null;

/** `gsap.ticker` の登録解除用コールバック参照。 */
let tickerCallback: ((_time: number) => void) | null = null;

/**
 * スクロールトランスポート層を初期化する。
 * `Lenis` の更新を `gsap.ticker` に集約して単一ループ化し、スクロール位置と `ScrollTrigger` を同期する。
 * `prefers-reduced-motion: reduce` 有効時は初期化をスキップする。
 *
 * @returns 生成された `Lenis` インスタンス、または視覚効果制限時は `null`。
 */
export function initScrollTransport(): Lenis | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  if (prefersReduced) {
    return null;
  }

  destroyScrollTransport();

  try {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);

    tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);

    gsap.ticker.lagSmoothing(0);

    activeLenis = lenis;
    return lenis;
  } catch (error) {
    console.warn('Lenis の初期化に失敗しました。', error);
    return null;
  }
}

/** スクロールトランスポート層を破棄し、イベントリスナーと `gsap.ticker` を解除する。 */
export function destroyScrollTransport(): void {
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback);
    tickerCallback = null;
  }

  if (activeLenis) {
    activeLenis.destroy();
    activeLenis = null;
  }
}

/**
 * 現在アクティブな `Lenis` インスタンスを取得する。
 *
 * @returns `Lenis` インスタンス、または未稼働時は `null`。
 */
export function getActiveLenis(): Lenis | null {
  return activeLenis;
}
