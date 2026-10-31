import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';
import type { JSX, TargetedKeyboardEvent, TargetedMouseEvent } from 'preact';
import { buildCommandItems, type CommandItem } from './commandItems';

/**
 * アイテムと検索語の一致判定を行う。
 *
 * @param item 検査対象のコマンドアイテム。
 * @param query 小文字化済みの検索クエリ。
 * @returns 一致する場合は `true`。
 */
function matchItem(item: CommandItem, query: string): boolean {
  if (item.title.toLowerCase().includes(query)) {
    return true;
  }
  if (item.subtitle?.toLowerCase().includes(query)) {
    return true;
  }
  if (item.tags?.some((t) => t.toLowerCase().includes(query))) {
    return true;
  }
  if (item.keywords?.some((k) => k.toLowerCase().includes(query))) {
    return true;
  }
  return false;
}

/**
 * 検索クエリに基づきアイテムを絞り込み・スコアリングしてソートする。
 *
 * @param items 全アイテム一覧。
 * @param query 入力された検索クエリ。
 * @returns 絞り込まれたアイテム一覧。
 */
function filterItems(items: CommandItem[], query: string): CommandItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return items;
  }

  if (trimmed.startsWith('>')) {
    const subQuery = trimmed.slice(1).trim();
    const actionItems = items.filter((i) => i.category === 'actions');
    if (!subQuery) {
      return actionItems;
    }
    return actionItems.filter((i) => matchItem(i, subQuery));
  }

  if (trimmed.startsWith('#')) {
    const subQuery = trimmed.slice(1).trim();
    if (!subQuery) {
      return items.filter((i) => Boolean(i.tags && i.tags.length > 0));
    }
    return items.filter((i) =>
      i.tags?.some((t) => t.toLowerCase().includes(subQuery)),
    );
  }

  if (trimmed.startsWith('/')) {
    const subQuery = trimmed.slice(1).trim();
    const navItems = items.filter((i) => i.category === 'navigation');
    if (!subQuery) {
      return navItems;
    }
    return navItems.filter((i) => matchItem(i, subQuery));
  }

  return items
    .map((item) => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      if (titleLower === trimmed) {
        score += 100;
      } else if (titleLower.startsWith(trimmed)) {
        score += 60;
      } else if (titleLower.includes(trimmed)) {
        score += 30;
      }

      if (item.tags?.some((t) => t.toLowerCase().includes(trimmed))) {
        score += 25;
      }
      if (item.keywords?.some((k) => k.toLowerCase().includes(trimmed))) {
        score += 20;
      }
      if (item.subtitle?.toLowerCase().includes(trimmed)) {
        score += 10;
      }

      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

/**
 * サイト内統合 HUD コマンドパレット (`⌘K` / `Ctrl+K`) コンポーネント。
 * ファジー検索、2 ペイン HUD インスペクター、キーボード完全操作を提供する。
 *
 * @returns コマンドパレットモーダルの JSX 要素。
 */
export default function CommandPalette(): JSX.Element | null {
  /** パレットが開いているかどうか。 */
  const [isOpen, setIsOpen] = useState(false);
  /** 検索入力クエリ。 */
  const [query, setQuery] = useState('');
  /** 選択中アイテムのインデックス番号。 */
  const [selectedIndex, setSelectedIndex] = useState(0);

  /** 検索入力フィールドへの参照。 */
  const inputRef = useRef<HTMLInputElement>(null);
  /** 選択中リスト要素への参照。 */
  const selectedItemRef = useRef<HTMLDivElement>(null);
  /** マウス移動検知用ポインタ座標キャッシュ。 */
  const lastPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  /** パレットを閉じる。 */
  const closePalette = useCallback((): void => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
    document.body.style.overflow = '';
  }, []);

  /** パレットを開く。 */
  const openPalette = useCallback((): void => {
    setIsOpen(true);
    setSelectedIndex(0);
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, []);

  const allItems = useMemo(
    () => buildCommandItems(closePalette),
    [closePalette],
  );
  const filteredItems = useMemo(
    () => filterItems(allItems, query),
    [allItems, query],
  );
  const selectedItem = filteredItems[selectedIndex] || filteredItems[0];

  useEffect(() => {
    /** ショートカットキー (`⌘K` / `Ctrl+K`) の押下を検知する。 */
    const handleGlobalKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen((prev) => {
          if (prev) {
            document.body.style.overflow = '';
            return false;
          }
          document.body.style.overflow = 'hidden';
          setTimeout(() => inputRef.current?.focus(), 50);
          return true;
        });
      }
    };

    /** カスタムイベントによるオープン処理を行う。 */
    const handleCustomOpen = (): void => {
      openPalette();
    };

    /** ページ遷移前のクローズ処理を行う。 */
    const handleBeforeSwap = (): void => {
      closePalette();
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('open-cmdk', handleCustomOpen);
    document.addEventListener('astro:before-swap', handleBeforeSwap);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('open-cmdk', handleCustomOpen);
      document.removeEventListener('astro:before-swap', handleBeforeSwap);
      document.body.style.overflow = '';
    };
  }, [closePalette, openPalette]);

  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  /**
   * ポインタ移動時にのみ選択インデックスを更新する。
   *
   * @param index 対象アイテムのインデックス番号。
   * @param event マウスイベント。
   */
  const handleMouseMove = (
    index: number,
    event: TargetedMouseEvent<HTMLDivElement>,
  ): void => {
    if (
      lastPointerPos.current.x === event.clientX &&
      lastPointerPos.current.y === event.clientY
    ) {
      return;
    }
    lastPointerPos.current = { x: event.clientX, y: event.clientY };
    setSelectedIndex(index);
  };

  /**
   * モーダル内でのキーボード操作イベントを処理する。
   *
   * @param event キーボードイベント。
   */
  const handleInputKeyDown = (
    event: TargetedKeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key === 'Tab') {
      event.preventDefault();
      return;
    }

    if (!isOpen || filteredItems.length === 0) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePalette();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + filteredItems.length) % filteredItems.length,
      );
    } else if (event.key === 'Enter') {
      if (event.isComposing || event.keyCode === 229) {
        return;
      }
      event.preventDefault();
      if (selectedItem) {
        selectedItem.action();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closePalette();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="コマンドパレット"
      class="fixed inset-0 z-50 flex items-start justify-center p-3 pt-12 sm:p-6 sm:pt-20"
    >
      <div
        class="fixed inset-0 bg-canvas/80 backdrop-blur-md transition-opacity"
        onClick={closePalette}
        aria-hidden="true"
      />

      <div class="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border-strong bg-surface shadow-2xl transition-all">
        <div class="flex items-center gap-2.5 border-b border-border-subtle px-4 py-3 sm:px-5">
          <span class="font-mono text-sm font-bold text-accent-cyan">
            &gt;_
          </span>
          <input
            ref={inputRef}
            type="search"
            name="cmdk-search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellcheck={false}
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            data-bwignore="true"
            role="searchbox"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={selectedItem ? selectedItem.id : undefined}
            value={query}
            onInput={(e) => setQuery(e.currentTarget.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="コマンド・制作物・経歴を検索... (例: #rust, >theme, /works)"
            class="flex-1 bg-transparent font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              class="rounded px-1.5 py-0.5 font-mono text-xs text-text-muted hover:bg-surface-subtle hover:text-text-primary"
            >
              Clear
            </button>
          )}
          <kbd class="rounded border border-border-subtle bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
            ESC
          </kbd>
        </div>

        <div class="flex max-h-[60vh] min-h-80 flex-col overflow-hidden md:flex-row">
          <div
            id="cmdk-list"
            role="listbox"
            class="flex-1 divide-y divide-border-subtle/40 overflow-y-auto border-b border-border-subtle md:border-r md:border-b-0"
          >
            {filteredItems.length === 0 ? (
              <div class="flex h-48 flex-col items-center justify-center gap-2 text-center text-text-muted">
                <span class="font-mono text-xs">NO_MATCH_FOUND</span>
                <span class="text-xs">
                  一致する項目が見つかりませんでした。
                </span>
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id}
                    id={item.id}
                    ref={isSelected ? selectedItemRef : null}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => item.action()}
                    onMouseMove={(e) => handleMouseMove(index, e)}
                    class={`group flex cursor-pointer items-start justify-between gap-3 px-4 py-2.5 transition-colors ${
                      isSelected
                        ? 'border-l-2 border-accent-cyan bg-surface-subtle text-accent-cyan'
                        : 'text-text-secondary hover:bg-surface-subtle/60 hover:text-text-primary'
                    }`}
                  >
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <span
                          class={`truncate font-mono text-xs font-semibold ${
                            isSelected
                              ? 'text-accent-cyan'
                              : 'text-text-primary'
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.isExternal && (
                          <span class="text-[10px] text-text-muted">↗</span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p class="truncate font-mono text-[10.5px] text-text-muted/75">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                    <span class="shrink-0 rounded border border-border-subtle/80 bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
                      {item.category}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div class="hidden w-2/5 flex-col overflow-y-auto bg-surface/40 p-4 font-mono md:flex">
            <div class="mb-3 flex items-center justify-between border-b border-border-subtle pb-2 text-[10px] text-text-muted">
              <span>INSPECTOR // PREVIEW</span>
              {selectedItem && (
                <span class="text-accent-green">STATUS: READY</span>
              )}
            </div>

            {selectedItem ? (
              <div class="flex flex-col gap-3">
                <div>
                  <span class="text-[10px] text-accent-cyan">
                    {selectedItem.categoryLabel}
                  </span>
                  <h3 class="mt-0.5 text-sm font-bold text-text-primary">
                    {selectedItem.title}
                  </h3>
                  {selectedItem.subtitle && (
                    <p class="mt-1 font-mono text-[11px] text-text-muted/80">
                      {selectedItem.subtitle}
                    </p>
                  )}
                </div>

                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div class="flex flex-wrap gap-1">
                    {selectedItem.tags.map((tag) => (
                      <span
                        key={tag}
                        class="rounded bg-surface px-1.5 py-0.5 text-[10px] text-text-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {selectedItem.detail?.summary && (
                  <div class="rounded border border-border-subtle bg-surface/60 p-2.5 text-xs text-text-secondary">
                    <p class="leading-relaxed">{selectedItem.detail.summary}</p>
                  </div>
                )}

                {selectedItem.detail?.metrics &&
                  selectedItem.detail.metrics.length > 0 && (
                    <div class="flex flex-col gap-1.5">
                      <span class="text-[10px] text-text-muted">METRICS</span>
                      <div class="grid grid-cols-2 gap-1.5">
                        {selectedItem.detail.metrics.map((metric) => (
                          <div
                            key={metric.label}
                            class="rounded border border-border-subtle/80 bg-surface px-2 py-1"
                          >
                            <div class="truncate text-[9px] text-text-muted">
                              {metric.label}
                            </div>
                            <div class="text-xs font-semibold text-accent-cyan">
                              {metric.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedItem.detail?.architectureHighlight && (
                  <div class="rounded border border-border-subtle/60 bg-surface/40 p-2 text-[11px] text-accent-purple">
                    <span class="text-[9px] text-text-muted">
                      ARCHITECTURE:
                    </span>
                    <p class="mt-0.5 leading-snug">
                      {selectedItem.detail.architectureHighlight}
                    </p>
                  </div>
                )}

                <div class="mt-auto pt-2">
                  <div class="flex items-center justify-between text-[11px] text-text-muted">
                    <span>Press ↵ to execute</span>
                    {selectedItem.detail?.linkUrl && (
                      <span class="text-accent-cyan">
                        {selectedItem.detail.linkUrl}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div class="flex h-full items-center justify-center text-xs text-text-muted">
                SELECT_ITEM_TO_INSPECT
              </div>
            )}
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-border-subtle bg-surface/80 px-4 py-2 font-mono text-[11px] text-text-muted">
          <div class="flex items-center gap-3">
            <span>
              <kbd class="text-text-secondary">↑↓</kbd> 移動
            </span>
            <span>
              <kbd class="text-text-secondary">↵</kbd> 決定
            </span>
            <span>
              <kbd class="text-text-secondary">ESC</kbd> 閉じる
            </span>
          </div>
          <div>
            COUNT: <span class="text-text-primary">{filteredItems.length}</span>{' '}
            items
          </div>
        </div>
      </div>
    </div>
  );
}
