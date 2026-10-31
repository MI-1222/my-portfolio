/**
 * Git タイムライン(`/history`)のスクロールテリング演出モジュール。
 * マルチレーン SVG パスのスクロール伸長(`strokeDashoffset`)と、
 * コミットノード通過時のパルス点灯を提供する。
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** イベントリスナーおよびトリガー解除用のクリーンアップ関数配列。 */
let cleanupCallbacks: (() => void)[] = [];

/**
 * タイムライン要素のスクロール連動アニメーションを初期化する。
 * マルチレーン SVG のパスやラインを `strokeDashoffset` と `ScrollTrigger` のスクラブで伸長し、
 * コミットノード到達時にスケールパルスアニメーションを発火させる。
 * `prefers-reduced-motion: reduce` 有効時はアニメーションを適用しない。
 *
 * @param container タイムラインセクションのルート要素。
 */
export function initTimelineMotion(container: HTMLElement): void {
  destroyTimelineMotion();

  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  const rows = gsap.utils.toArray<HTMLElement>(
    container.querySelectorAll<HTMLElement>('[data-animate="timeline-row"]'),
  );
  if (rows.length === 0) {
    return;
  }

  if (prefersReduced) {
    return;
  }

  rows.forEach((row) => {
    const desktopSvg = row.querySelector<SVGSVGElement>('svg');
    const commitCircles = gsap.utils.toArray<SVGCircleElement>(
      row.querySelectorAll<SVGCircleElement>('svg circle'),
    );
    const mobileDot = row.querySelector<HTMLElement>(
      '.sm\\:hidden.rounded-full',
    );

    if (desktopSvg) {
      const pathsAndLines = gsap.utils.toArray<SVGGeometryElement>(
        desktopSvg.querySelectorAll<SVGGeometryElement>('path, line'),
      );

      pathsAndLines.forEach((geom) => {
        let length = 100;
        try {
          if (typeof geom.getTotalLength === 'function') {
            length = geom.getTotalLength();
          } else {
            const bounds = geom.getBBox();
            length = Math.hypot(bounds.width, bounds.height) || 100;
          }
        } catch {
          length = 100;
        }

        geom.style.strokeDasharray = `${length}`;
        geom.style.strokeDashoffset = `${length}`;

        const tween = gsap.to(geom, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: row,
            start: 'top 85%',
            end: 'top 55%',
            scrub: 0.3,
          },
        });

        cleanupCallbacks.push(() => {
          tween.scrollTrigger?.kill();
          tween.kill();
        });
      });
    }

    if (commitCircles.length > 0 || mobileDot) {
      const trigger = ScrollTrigger.create({
        trigger: row,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          if (commitCircles.length > 0) {
            gsap.fromTo(
              commitCircles,
              { scale: 1.4, transformOrigin: 'center center' },
              {
                scale: 1.0,
                duration: 0.4,
                ease: 'back.out(2)',
                clearProps: 'transform',
              },
            );
          }
          if (mobileDot) {
            gsap.fromTo(
              mobileDot,
              { scale: 1.5 },
              {
                scale: 1.0,
                duration: 0.35,
                ease: 'back.out(2)',
                clearProps: 'transform',
              },
            );
          }
        },
      });

      cleanupCallbacks.push(() => {
        trigger.kill();
      });
    }
  });
}

/** タイムラインの `ScrollTrigger` インスタンスおよびアニメーションを破棄する。 */
export function destroyTimelineMotion(): void {
  cleanupCallbacks.forEach((cleanup) => cleanup());
  cleanupCallbacks = [];
}
