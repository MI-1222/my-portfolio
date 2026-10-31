/**
 * カードコンポーネントのインタラクションモジュール。
 * スクロール到達時のスタッガーイン、マウス追従 Border Glow、
 * およびデスクトップ環境での微小 3D チルトを提供する。
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { playClickSound } from './soundFX';

/** イベントリスナー解除用のクリーンアップ関数配列。 */
let cleanupCallbacks: (() => void)[] = [];

/**
 * 制作物カードおよびコンテナのインタラクションを初期化する。
 * スクロール到達時の `ScrollTrigger.batch` によるスタッガーイン、
 * ポインタ追従 Border Glow (`--mouse-x`, `--mouse-y`)、および微小 3D チルト (`gsap.quickTo`) を登録する。
 *
 * @param container 監視対象の親コンテナ要素。
 */
export function initCardInteractions(container: HTMLElement): void {
  destroyCardInteractions();

  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  const isMousePointer = window.matchMedia(
    '(hover: hover) and (pointer: fine)',
  ).matches;

  const cards = gsap.utils.toArray<HTMLElement>(
    container.querySelectorAll<HTMLElement>(
      '[data-animate="work-card"], .work-card-wrapper',
    ),
  );

  if (cards.length === 0) {
    return;
  }

  if (!prefersReduced) {
    gsap.set(cards, { y: 16, autoAlpha: 0.85, scale: 0.99 });

    const batchTriggers = ScrollTrigger.batch(cards, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 0.45,
          stagger: 0.06,
          ease: 'power2.out',
          clearProps: 'all',
        });
      },
    });

    cleanupCallbacks.push(() => {
      batchTriggers.forEach((trigger) => trigger.kill());
    });
  }

  if (isMousePointer) {
    const clampRot = gsap.utils.clamp(-2.5, 2.5);

    cards.forEach((wrapper) => {
      const targetCard =
        wrapper.querySelector<HTMLElement>('[data-glow="true"]') ||
        wrapper.querySelector<HTMLElement>('article, .rounded-lg') ||
        wrapper;

      const rotXTo = !prefersReduced
        ? gsap.quickTo(targetCard, 'rotationX', {
            duration: 0.25,
            ease: 'power1.out',
          })
        : null;

      const rotYTo = !prefersReduced
        ? gsap.quickTo(targetCard, 'rotationY', {
            duration: 0.25,
            ease: 'power1.out',
          })
        : null;

      if (!prefersReduced) {
        gsap.set(targetCard, { transformPerspective: 800 });
      }

      /** ポインタ移動時に CSS 変数と 3D チルト角度を更新するハンドラ。 */
      const handlePointerMove = (e: PointerEvent): void => {
        const rect = targetCard.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        targetCard.style.setProperty('--mouse-x', `${mouseX}px`);
        targetCard.style.setProperty('--mouse-y', `${mouseY}px`);

        if (rotXTo && rotYTo) {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const deltaX = (mouseX - centerX) / centerX;
          const deltaY = (mouseY - centerY) / centerY;

          rotXTo(clampRot(-deltaY * 2.5));
          rotYTo(clampRot(deltaX * 2.5));
        }
      };

      /** ポインタ離脱時に CSS 変数と回転角を初期値へ戻すハンドラ。 */
      const handlePointerLeave = (): void => {
        targetCard.style.setProperty('--mouse-x', '-9999px');
        targetCard.style.setProperty('--mouse-y', '-9999px');

        if (rotXTo && rotYTo) {
          rotXTo(0);
          rotYTo(0);
        }
      };

      /** クリック時に触覚フィードバック音を再生するハンドラ。 */
      const handleClick = (): void => {
        playClickSound();
      };

      targetCard.addEventListener('pointermove', handlePointerMove, {
        passive: true,
      });
      targetCard.addEventListener('pointerleave', handlePointerLeave);
      targetCard.addEventListener('click', handleClick);

      cleanupCallbacks.push(() => {
        targetCard.removeEventListener('pointermove', handlePointerMove);
        targetCard.removeEventListener('pointerleave', handlePointerLeave);
        targetCard.removeEventListener('click', handleClick);
      });
    });
  }
}

/** カードインタラクションのイベントリスナーおよびアニメーションを破棄する。 */
export function destroyCardInteractions(): void {
  cleanupCallbacks.forEach((cleanup) => cleanup());
  cleanupCallbacks = [];
}
