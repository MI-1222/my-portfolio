/**
 * クライアントサイドでのMermaidダイアグラム動的描画エンジンおよびDOM操作ユーティリティ。
 *
 * `pele` を動的遅延インポートし、SVGを生成してDOMへマウントする。
 * 同一コードの再描画を抑止するメモリキャッシュ、テーマ連動、構文エラー時のフォールバックUI、
 * 拡大表示モーダル、および生コードコピートグル機能を提供する。
 */

/** 同一Mermaidコードの再パースを抑止するメモリ内SVGキャッシュ。 */
const svgCache = new Map<string, string>();

/** `pele` モジュールの遅延インポート結果を保持するキャッシュPromise。 */
let peleModulePromise: Promise<typeof import('pele')> | null = null;

/**
 * `pele` モジュールを動的に遅延インポートする。
 *
 * @returns `pele` モジュールのPromise。
 */
async function loadPele(): Promise<typeof import('pele')> {
  if (!peleModulePromise) {
    peleModulePromise = import('pele');
  }
  return peleModulePromise;
}

/** Mermaidレンダリング結果の型定義。 */
export interface MermaidRenderResult {
  /** 正常に生成されたインラインSVG文字列。 */
  svg?: string;
  /** レンダリング失敗時のエラーメッセージ。 */
  error?: string;
}

/**
 * Mermaidコード文字列からSVGを生成する。
 * キャッシュが存在する場合は即座に返却し、未生成の場合は `pele` を用いて同期パースする。
 *
 * @param code - 描画対象のMermaidコード文字列。
 * @returns SVG文字列またはエラー情報を含むオブジェクト。
 */
export async function renderMermaidToSvg(
  code: string,
): Promise<MermaidRenderResult> {
  const trimmed = code.trim();
  if (!trimmed) {
    return { error: 'ダイアグラムのコードが空です。' };
  }

  const cached = svgCache.get(trimmed);
  if (cached) {
    return { svg: cached };
  }

  try {
    const { render } = await loadPele();
    const result = render(trimmed);
    if (!result || typeof result.svg !== 'string') {
      return { error: 'SVGの生成に失敗しました。' };
    }

    svgCache.set(trimmed, result.svg);
    return { svg: result.svg };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : '構文解析または描画処理に失敗しました。';
    return { error: message };
  }
}

/**
 * クリップボードにテキストをコピーし、ボタンラベルを一時的に切り替える。
 *
 * @param text - コピー対象のテキスト。
 * @param button - 操作対象のボタン要素。
 */
async function copyToClipboard(
  text: string,
  button: HTMLButtonElement,
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = button.getAttribute('data-original-label') || 'コピー';
    button.textContent = 'コピー完了';
    button.classList.add('text-accent-green');

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('text-accent-green');
    }, 1500);
  } catch {
    button.textContent = 'コピー失敗';
    setTimeout(() => {
      button.textContent =
        button.getAttribute('data-original-label') || 'コピー';
    }, 1500);
  }
}

/**
 * 全画面拡大モーダルをDOMに作成・表示する。
 *
 * @param svgMarkup - モーダル内に表示するSVGマークアップ文字列。
 * @param title - モーダルヘッダーに表示するタイトル。
 */
export function openMermaidModal(
  svgMarkup: string,
  title: string = 'Mermaid ダイアグラム',
): void {
  const existingModal = document.getElementById('mermaid-zoom-modal');
  if (existingModal) {
    existingModal.remove();
  }

  /** モーダル表示前のbodyのoverflowスタイル。 */
  const originalBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  /** モーダル外枠オーバーレイ要素。 */
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'mermaid-zoom-modal';
  modalOverlay.className =
    'fixed inset-0 z-50 flex flex-col bg-canvas/95 backdrop-blur-md p-4 sm:p-6 animate-fade-in text-text-primary overscroll-contain select-none';

  modalOverlay.innerHTML = `
    <div class="flex items-center justify-between border-b border-border-subtle pb-3 text-text-primary">
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono uppercase tracking-wider text-text-secondary">${title}</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          id="mermaid-modal-fit-btn"
          class="rounded px-2.5 py-1 text-xs text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary border border-border-subtle"
        >
          原寸表示
        </button>
        <button
          type="button"
          id="mermaid-modal-close-btn"
          class="rounded p-1.5 text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
          aria-label="閉じる"
        >
          <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    <div id="mermaid-modal-scroll-area" class="flex-1 overflow-auto p-4 flex overscroll-contain">
      <div id="mermaid-modal-svg-wrapper" class="m-auto p-2 sm:p-6 transition-all duration-150 [&>svg]:max-w-full [&>svg]:max-h-[80vh] [&>svg]:w-auto [&>svg]:h-auto [&>svg]:object-contain">
        ${svgMarkup}
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  /** モーダルおよびイベントリスナーを破棄するクリーンアップ関数。 */
  const cleanup = () => {
    document.body.style.overflow = originalBodyOverflow;
    modalOverlay.remove();
    document.removeEventListener('keydown', handleKeyDown);
  };

  /** Escapeキー押下時にモーダルを閉じるハンドラー。 */
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      cleanup();
    }
  };

  modalOverlay
    .querySelector('#mermaid-modal-close-btn')
    ?.addEventListener('click', cleanup);

  /** 原寸表示と全体フィット表示を切り替えるボタン要素。 */
  const fitBtn = modalOverlay.querySelector<HTMLButtonElement>(
    '#mermaid-modal-fit-btn',
  );
  const svgWrapper = modalOverlay.querySelector<HTMLElement>(
    '#mermaid-modal-svg-wrapper',
  );

  let isActualSize = false;
  fitBtn?.addEventListener('click', () => {
    isActualSize = !isActualSize;
    if (isActualSize) {
      fitBtn.textContent = '全体表示';
      svgWrapper?.classList.remove(
        '[&>svg]:max-w-full',
        '[&>svg]:max-h-[80vh]',
        '[&>svg]:w-auto',
        '[&>svg]:h-auto',
        '[&>svg]:object-contain',
      );
      svgWrapper?.classList.add('[&>svg]:max-w-none', '[&>svg]:h-auto');
    } else {
      fitBtn.textContent = '原寸表示';
      svgWrapper?.classList.remove('[&>svg]:max-w-none', '[&>svg]:h-auto');
      svgWrapper?.classList.add(
        '[&>svg]:max-w-full',
        '[&>svg]:max-h-[80vh]',
        '[&>svg]:w-auto',
        '[&>svg]:h-auto',
        '[&>svg]:object-contain',
      );
    }
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      cleanup();
    }
  });

  document.addEventListener('keydown', handleKeyDown);
}

/**
 * 単一の `.mermaid-block` 要素を解析し、SVGおよび操作ツールバーを展開する。
 *
 * @param container - 対象の `.mermaid-block` コンテナ要素。
 */
export async function renderMermaidElement(
  container: HTMLElement,
): Promise<void> {
  if (container.getAttribute('data-mermaid-rendered') === 'true') {
    return;
  }

  const rawCode =
    container.getAttribute('data-mermaid-code') ||
    container.querySelector('pre.mermaid')?.getAttribute('data-mermaid-code') ||
    container.querySelector('code')?.textContent ||
    '';

  const trimmed = rawCode.trim();
  if (!trimmed) {
    return;
  }

  container.setAttribute('data-mermaid-rendered', 'true');

  const { svg, error } = await renderMermaidToSvg(trimmed);

  container.innerHTML = '';

  /** 上部操作ツールバー要素。 */
  const toolbar = document.createElement('div');
  toolbar.className =
    'flex items-center justify-between border-b border-border-subtle bg-surface-subtle/60 px-4 py-2 text-xs text-text-secondary select-none';

  /** 状態またはダイアグラム種別を示すバッジ領域。 */
  const leftBadge = document.createElement('div');
  leftBadge.className = 'flex items-center gap-2';

  if (error) {
    leftBadge.innerHTML = `
      <span class="inline-flex items-center gap-1.5 rounded bg-accent-coral/20 px-2 py-0.5 text-[11px] font-medium text-accent-coral border border-accent-coral/40">
        <svg class="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8.65,22.8q-3.13,0-5.31-2.21q-2.19-2.21-2.19-5.34T3.31,9.96T8.6,7.8q0.08,0 0.16,0t0.16,0L9.6,6.63q0.3-0.55 0.9-0.71t1.15,0.16L12.4,6.5l0.13-0.2q0.58-1.08 1.8-1.4t2.3,0.3L17.5,5.7l-1,1.73l-0.88-0.5q-0.35-0.2-0.76-0.09T14.25,7.3L14.13,7.5l1,0.57q0.53,0.3 0.69,0.9T15.68,10.1L15,11.3q0.58,0.9 0.86,1.91q0.29,1.01 0.29,2.09q0,3.13-2.19,5.31Q11.78,22.8 8.65,22.8Zm0-2q2.28,0 3.89-1.61t1.61-3.89q0-0.77-0.21-1.53T13.3,12.35l-0.65-1.03l1.05-1.8l-2.6-1.5l-1.05,1.8H8.95q-2.35,0-4.09,1.5T3.13,15.25q0,2.3 1.61,3.93T8.65,20.8ZM20,8.8v-2h3v2H20ZM14.5,3.3v-3h2v3h-2Zm4.88,2.03l-1.4-1.4L20.1,1.8l1.4,1.4L19.38,5.32ZM8.65,15.3Z" />
        </svg>
        Mermaid構文エラー
      </span>
    `;
  } else {
    leftBadge.innerHTML = `
      <span class="font-mono text-[11px] font-medium tracking-wide text-text-muted">
        Mermaid
      </span>
    `;
  }

  /** 操作ボタン群を保持するコンテナ要素。 */
  const rightActions = document.createElement('div');
  rightActions.className = 'flex items-center gap-2';

  /** 原本コードをクリップボードにコピーするボタン要素。 */
  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className =
    'rounded px-2 py-1 text-[11px] text-text-secondary transition-colors hover:bg-surface hover:text-text-primary';
  copyBtn.textContent = 'コピー';
  copyBtn.setAttribute('data-original-label', 'コピー');
  copyBtn.addEventListener('click', () => copyToClipboard(trimmed, copyBtn));
  rightActions.appendChild(copyBtn);

  /** 図とコードの表示切り替えボタン要素。 */
  let toggleCodeBtn: HTMLButtonElement | null = null;
  /** 全画面拡大モーダルを起動するボタン要素。 */
  let zoomBtn: HTMLButtonElement | null = null;

  if (!error && svg) {
    toggleCodeBtn = document.createElement('button');
    toggleCodeBtn.type = 'button';
    toggleCodeBtn.className =
      'rounded px-2 py-1 text-[11px] text-text-secondary transition-colors hover:bg-surface hover:text-text-primary';
    toggleCodeBtn.textContent = '図とコードを切り替える';
    rightActions.appendChild(toggleCodeBtn);

    zoomBtn = document.createElement('button');
    zoomBtn.type = 'button';
    zoomBtn.className =
      'rounded px-2 py-1 text-[11px] text-text-secondary transition-colors hover:bg-surface hover:text-text-primary';
    zoomBtn.textContent = '拡大';
    zoomBtn.addEventListener('click', () => openMermaidModal(svg));
    rightActions.appendChild(zoomBtn);
  }

  toolbar.appendChild(leftBadge);
  toolbar.appendChild(rightActions);
  container.appendChild(toolbar);

  if (error || !svg) {
    /** エラー詳細メッセージ表示領域。 */
    const errorNotice = document.createElement('div');
    errorNotice.className =
      'border-b border-accent-coral/30 bg-accent-coral/10 px-4 py-2 font-mono text-xs text-accent-coral';
    errorNotice.textContent = error || 'ダイアグラムを描画できませんでした。';
    container.appendChild(errorNotice);

    /** フォールバック用の原本コードコンテナ。 */
    const rawContainer = document.createElement('div');
    rawContainer.className = 'p-4 overflow-x-auto bg-surface/80';
    const pre = document.createElement('pre');
    pre.className = 'font-mono text-xs text-text-secondary';
    pre.textContent = trimmed;
    rawContainer.appendChild(pre);
    container.appendChild(rawContainer);
  } else {
    /** 描画されたSVGを展開するコンテナ要素。 */
    const renderedArea = document.createElement('div');
    renderedArea.className = 'mermaid-rendered';
    renderedArea.innerHTML = svg;
    renderedArea.style.display = 'flex';
    container.appendChild(renderedArea);

    /** トグル表示用の原本コードコンテナ要素。 */
    const codeArea = document.createElement('div');
    codeArea.className = 'hidden p-4 overflow-x-auto bg-surface/80';
    codeArea.style.display = 'none';
    const pre = document.createElement('pre');
    pre.className = 'font-mono text-xs text-text-secondary';
    pre.textContent = trimmed;
    codeArea.appendChild(pre);
    container.appendChild(codeArea);

    let isShowingCode = false;
    toggleCodeBtn?.addEventListener('click', () => {
      isShowingCode = !isShowingCode;
      if (isShowingCode) {
        renderedArea.style.display = 'none';
        renderedArea.classList.add('hidden');
        codeArea.style.display = 'block';
        codeArea.classList.remove('hidden');
        if (toggleCodeBtn) {
          toggleCodeBtn.textContent = '図に切り替え';
          toggleCodeBtn.classList.add('bg-surface', 'text-text-primary');
        }
      } else {
        renderedArea.style.display = 'flex';
        renderedArea.classList.remove('hidden');
        codeArea.style.display = 'none';
        codeArea.classList.add('hidden');
        if (toggleCodeBtn) {
          toggleCodeBtn.textContent = '図とコードを切り替える';
          toggleCodeBtn.classList.remove('bg-surface', 'text-text-primary');
        }
      }
    });
  }
}

/**
 * 指定したルート要素配下のすべての `.mermaid-block` を走査して描画を実行する。
 *
 * @param root - 走査対象のルート要素。デフォルトは `document`。
 */
export async function renderAllMermaidBlocks(
  root: ParentNode = document,
): Promise<void> {
  const elements = root.querySelectorAll<HTMLElement>(
    '.mermaid-block:not([data-mermaid-rendered="true"])',
  );

  if (elements.length === 0) {
    return;
  }

  for (const el of Array.from(elements)) {
    await renderMermaidElement(el);
  }
}
