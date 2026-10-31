/**
 * ヒーローセクションのシステムブート & テレメトリデコード演出モジュール。
 * HUD パラメータの文字スクランブル解決や、疑似ターミナル枠線の点灯シーケンスを提供する。
 */
import { gsap } from 'gsap';

/** スクランブル表示時に使用するサイバー調グリフ集合。 */
const GLYPHS = '0123456789ABCDEF_+-*/=<>#%';

/**
 * 対象要素のテキストをランダムグリフから目標文字列へデコード解決する。
 *
 * @param element 対象の HTML 要素。
 * @param targetText 確定目標の文字列。
 * @param duration アニメーションの継続時間(秒)。
 * @param delay アニメーション開始までの遅延時間(秒)。
 */
function scrambleText(
  element: HTMLElement,
  targetText: string,
  duration = 0.6,
  delay = 0,
): void {
  const length = targetText.length;
  const progressObj = { value: 0 };

  gsap.to(progressObj, {
    value: 1,
    duration,
    delay,
    ease: 'power2.out',
    onUpdate: () => {
      const solvedCount = Math.floor(progressObj.value * length);
      let output = '';

      for (let i = 0; i < length; i++) {
        if (i < solvedCount) {
          output += targetText[i];
        } else if (targetText[i] === ' ' || targetText[i] === '\n') {
          output += targetText[i];
        } else {
          output += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }

      element.textContent = output;
    },
    onComplete: () => {
      element.textContent = targetText;
    },
  });
}

/**
 * ヒーローセクションのブートシーケンスを初期化して再生する。
 * HUD パラメータのテキストスクランブル解決や、タイトル・疑似ターミナルのスタッガー登場を実行する。
 * `prefers-reduced-motion: reduce` 有効時はアニメーションをスキップし、即時に静的テキストを確定する。
 *
 * @param container ヒーローセクションのルート要素。
 */
export function initHeroMotion(container: HTMLElement): void {
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  const hudElements = container.querySelectorAll<HTMLElement>(
    '[data-animate="hud-item"]',
  );

  if (prefersReduced) {
    hudElements.forEach((el) => {
      const target = el.getAttribute('data-original-text') || el.textContent;
      if (target) {
        el.textContent = target;
      }
    });
    return;
  }

  hudElements.forEach((el, index) => {
    const rawText =
      el.getAttribute('data-original-text') || el.textContent || '';
    if (!el.getAttribute('data-original-text')) {
      el.setAttribute('data-original-text', rawText);
    }
    scrambleText(el, rawText, 0.5, index * 0.08);
  });

  const terminal = container.querySelector<HTMLElement>(
    '[data-animate="hero-terminal"]',
  );
  const tags = container.querySelectorAll<HTMLElement>(
    '[data-animate="hero-tag"]',
  );
  const actions = container.querySelector<HTMLElement>(
    '[data-animate="hero-actions"]',
  );

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (terminal) {
    tl.from(
      terminal,
      {
        scale: 0.98,
        autoAlpha: 0.7,
        duration: 0.45,
        clearProps: 'all',
      },
      '+=0.05',
    );
  }

  if (tags.length > 0) {
    tl.from(
      tags,
      {
        y: 8,
        autoAlpha: 0,
        duration: 0.35,
        stagger: 0.03,
        clearProps: 'all',
      },
      '-=0.2',
    );
  }

  if (actions) {
    tl.from(
      actions,
      {
        y: 8,
        autoAlpha: 0,
        duration: 0.4,
        clearProps: 'all',
      },
      '-=0.2',
    );
  }
}
