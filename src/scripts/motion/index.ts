/**
 * サイト全体のモーション & マイクロインタラクション統括エントリポイント。
 * Astro 5 の View Transitions (`astro:page-load` / `astro:before-swap`) に対応し、
 * メモリリークゼロと `ScrollTrigger` の確実な再同期を担保する。
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initSoundFX } from './soundFX';
import { initHeroMotion } from './heroMotion';
import {
  initCardInteractions,
  destroyCardInteractions,
} from './cardInteractions';
import { initTimelineMotion, destroyTimelineMotion } from './timelineMotion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/** 現在アクティブな `gsap.Context`。 */
let currentContext: gsap.Context | null = null;

/** 動的なレイアウト変更(フィルタ切り替え等)を受け取ってトリガー位置を再計算するハンドラ。 */
function handleLayoutChange(): void {
  ScrollTrigger.refresh();
}

/**
 * 現在の DOM 状態に合わせてページ内の全アニメーション・インタラクションを初期化する。
 * 既存コンテキストの破棄後、音声フィードバック、
 * ヒーロー・カード・タイムラインの各演出を `gsap.context()` 内にスコープ化して登録する。
 */
export function initMotion(): void {
  if (typeof window === 'undefined') {
    return;
  }

  destroyMotion();
  initSoundFX();

  window.addEventListener('layout-change', handleLayoutChange);

  currentContext = gsap.context(() => {
    const heroContainer = document.querySelector<HTMLElement>(
      '[data-animate="hero-container"]',
    );
    if (heroContainer) {
      initHeroMotion(heroContainer);
    }

    const worksContainer = document.querySelector<HTMLElement>(
      '#works, #works-grid-container',
    );
    if (worksContainer) {
      initCardInteractions(worksContainer);
    }

    const timelineContainer = document.querySelector<HTMLElement>(
      '[data-animate="timeline-container"]',
    );
    if (timelineContainer) {
      initTimelineMotion(timelineContainer);
    }
  });

  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
}

/**
 * ページ離脱時(`astro:before-swap`)に全アニメーションとリスナーを同期破棄する。
 * イベント購読解除、`gsap.context()` のロールバック、全 `ScrollTrigger` インスタンスの強制破棄を行う。
 */
export function destroyMotion(): void {
  if (typeof window !== 'undefined') {
    window.removeEventListener('layout-change', handleLayoutChange);
  }

  destroyCardInteractions();
  destroyTimelineMotion();

  if (currentContext) {
    currentContext.revert();
    currentContext = null;
  }

  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}

if (typeof window !== 'undefined') {
  document.addEventListener('astro:page-load', () => {
    initMotion();
  });

  document.addEventListener('astro:before-swap', () => {
    destroyMotion();
  });
}
