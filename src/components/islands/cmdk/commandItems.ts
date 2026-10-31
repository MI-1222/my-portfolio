import { navigate } from 'astro:transitions/client';
import { projects } from '../../../data/projects';
import { timelineCommits } from '../../../data/history';

/** コマンドアイテムのカテゴリ種別。 */
export type CommandCategory = 'navigation' | 'projects' | 'history' | 'actions';

/** コマンドパレットで表示・検索する単一アイテムの定義。 */
export interface CommandItem {
  /** 一意識別子。 */
  id: string;
  /** 表示タイトル。 */
  title: string;
  /** 補足説明またはサブタイトル。 */
  subtitle?: string;
  /** 所属カテゴリ。 */
  category: CommandCategory;
  /** 画面表示用のカテゴリラベル。 */
  categoryLabel: string;
  /** 関連タグ一覧。 */
  tags?: string[];
  /** 実行するアクション処理。 */
  action: () => void;
  /** 外部リンク遷移かどうか。 */
  isExternal?: boolean;
  /** 検索スコア判定用キーワード群。 */
  keywords?: string[];
  /** 右ペイン HUD インスペクターで表示する詳細情報。 */
  detail?: {
    /** 概要解説文。 */
    summary?: string;
    /** 工学的メトリクス一覧。 */
    metrics?: { label: string; value: string }[];
    /** アーキテクチャや技術的核心。 */
    architectureHighlight?: string;
    /** メタ情報キーバリュー。 */
    meta?: Record<string, string>;
    /** 遷移先 URL の表示。 */
    linkUrl?: string;
  };
}

/**
 * ページ遷移または同一ページ内スクロールを実行する。
 *
 * @param url 遷移先 URL。
 * @param closePalette パレットを閉じるコールバック関数。
 */
function handleNavigate(url: string, closePalette: () => void): void {
  closePalette();
  if (url.startsWith('/#')) {
    const hash = url.replace('/', '');
    if (window.location.pathname === '/' || window.location.pathname === '') {
      const target = document.querySelector(hash);
      target?.scrollIntoView({ behavior: 'smooth' });
      history.pushState(null, '', hash);
      return;
    }
  }
  navigate(url);
}

/**
 * ナビゲーションおよび全データソースから検索可能アイテム一覧を生成する。
 *
 * @param closePalette パレットを閉じるコールバック関数。
 * @returns 検索アイテムの配列。
 */
export function buildCommandItems(closePalette: () => void): CommandItem[] {
  const items: CommandItem[] = [];

  items.push(
    {
      id: 'nav-home',
      title: 'ホームへ移動',
      subtitle: 'Go to Home (/)',
      category: 'navigation',
      categoryLabel: 'Navigation',
      keywords: ['home', 'top', 'index', 'root', 'ホーム', 'トップ'],
      action: () => {
        handleNavigate('/', closePalette);
      },
      detail: {
        summary: 'サイトのトップページ。主要制作物やプロフィールを表示。',
        linkUrl: '/',
      },
    },
    {
      id: 'nav-works',
      title: '制作物一覧へ移動',
      subtitle: 'Explore Works (/#works)',
      category: 'navigation',
      categoryLabel: 'Navigation',
      keywords: [
        'works',
        'projects',
        'engineering',
        'oss',
        '制作物',
        '作品',
        '実績',
      ],
      action: () => {
        handleNavigate('/#works', closePalette);
      },
      detail: {
        summary: '低レイヤ、AI、クラウド、Web基盤などの制作物一覧を表示。',
        linkUrl: '/#works',
      },
    },
    {
      id: 'nav-history',
      title: '開発履歴へ移動',
      subtitle: 'Commit History (/history)',
      category: 'navigation',
      categoryLabel: 'Navigation',
      keywords: [
        'history',
        'timeline',
        'git',
        'commits',
        'pr',
        'career',
        '履歴',
        '経歴',
      ],
      action: () => {
        handleNavigate('/history', closePalette);
      },
      detail: {
        summary: 'Git コミットログ形式による開発・学習のタイムラインを表示。',
        linkUrl: '/history',
      },
    },
  );

  for (const project of projects) {
    items.push({
      id: `project-${project.id}`,
      title: project.title,
      subtitle: project.subtitle,
      category: 'projects',
      categoryLabel: `Works // ${project.categoryLabel}`,
      tags: project.tags,
      keywords: [
        project.id,
        project.category,
        ...(project.searchKeywords || []),
        ...(project.tags || []),
      ],
      isExternal: Boolean(project.githubUrl),
      action: () => {
        if (project.githubUrl) {
          closePalette();
          window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
        } else {
          handleNavigate(`/#${project.id}`, closePalette);
        }
      },
      detail: {
        summary: project.summary,
        metrics: project.metrics,
        architectureHighlight: project.architectureHighlight,
        meta: {
          Category: project.categoryLabel,
          Status: project.status,
          Featured: project.featured ? 'Yes' : 'No',
        },
        linkUrl: project.githubUrl || `/#${project.id}`,
      },
    });
  }

  /** コマンドパレットに登録する注目コミット一覧(PR マージ、起点コミット、重要コミット)。 */
  const notableCommits = timelineCommits.filter(
    (c) => c.isPrMerge || c.graphType === 'root' || c.isDefaultOpen,
  );
  for (const commit of notableCommits) {
    items.push({
      id: `commit-${commit.hash}`,
      title: `${commit.hash}: ${commit.title}`,
      subtitle: `${commit.timestamp} [${commit.branch}] ${commit.commitMessage}`,
      category: 'history',
      categoryLabel: 'Git History // Commits',
      tags: [commit.branch, commit.graphType],
      keywords: [
        commit.hash,
        commit.branch,
        commit.commitMessage,
        commit.title,
      ],
      action: () => {
        handleNavigate('/history', closePalette);
      },
      detail: {
        summary: commit.context,
        meta: {
          Hash: commit.hash,
          Date: commit.timestamp,
          Branch: commit.branch,
          Type: commit.graphType,
        },
        linkUrl: '/history',
      },
    });
  }

  items.push(
    {
      id: 'action-open-terminal',
      title: '> ターミナルを起動',
      subtitle: 'Open Interactive Terminal ([>_] / Ctrl+`)',
      category: 'actions',
      categoryLabel: 'Quick Actions',
      keywords: [
        'terminal',
        'term',
        'cli',
        'shell',
        'bash',
        'zsh',
        'sh',
        'ターミナル',
        'シェル',
        'コマンド',
      ],
      action: () => {
        closePalette();
        window.dispatchEvent(new CustomEvent('open-terminal'));
      },
      detail: {
        summary: '対話型ターミナルモーダルを起動してコマンドライン操作を行う。',
      },
    },
    {
      id: 'action-theme-toggle',
      title: '> テーマの切り替え',
      subtitle: 'Toggle Theme (Dark / Light)',
      category: 'actions',
      categoryLabel: 'Quick Actions',
      keywords: [
        'theme',
        'dark',
        'light',
        'toggle',
        'color',
        'mode',
        'テーマ',
        'ダーク',
        'ライト',
      ],
      action: () => {
        const current =
          document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';

        document.documentElement.classList.add('disable-transitions');
        document.documentElement.setAttribute('data-theme', next);
        try {
          localStorage.setItem('portfolio-theme', next);
        } catch {}
        window.requestAnimationFrame(() => {
          document.documentElement.classList.remove('disable-transitions');
        });
        closePalette();
      },
      detail: {
        summary: 'ダークテーマとライトテーマの切り替え。',
      },
    },
    {
      id: 'action-open-github',
      title: '> GitHub を開く',
      subtitle: 'Open GitHub Profile (github.com/MI-1222)',
      category: 'actions',
      categoryLabel: 'Quick Actions',
      keywords: ['github', 'profile', 'repository', 'oss', 'git', 'ギットハブ'],
      isExternal: true,
      action: () => {
        closePalette();
        window.open(
          'https://github.com/MI-1222',
          '_blank',
          'noopener,noreferrer',
        );
      },
      detail: {
        summary: 'GitHub プロフィールページを新規タブで表示。',
        linkUrl: 'https://github.com/MI-1222',
      },
    },
    {
      id: 'action-whoami',
      title: '> whoami',
      subtitle: 'Show Profile Summary (/history)',
      category: 'actions',
      categoryLabel: 'Quick Actions',
      keywords: [
        'whoami',
        'profile',
        'masahiro',
        'engineer',
        'status',
        '経歴',
        '自己紹介',
      ],
      action: () => {
        handleNavigate('/history', closePalette);
      },
      detail: {
        summary: '東京科学大学在学。低レイヤ、クラウド、Web基盤を中心に開発。',
        meta: {
          Handle: 'MI-1222',
          Affiliation: 'Institute of Science Tokyo',
          Focus: 'Systems, Cloud, Web',
        },
      },
    },
  );

  return items;
}
