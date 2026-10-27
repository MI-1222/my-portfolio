/**
 * 開発・経歴タイムラインページ(/history)で使用するデータ定義モジュール。
 * Gitコミットログ、ブランチ、PRマージ、関連Issueのデータモデルを一元管理する。
 */

/**
 * プロフィール基本情報のインターフェース。
 */
export interface HistoryProfile {
  /** ハンドルネームまたは識別子。 */
  handle: string;
  /** 所属情報(公開可能な範囲に限定)。 */
  affiliation: string;
  /** 保有資格。 */
  credentials: string[];
  /** システム稼働ステータス。 */
  systemStatus: string;
}

/**
 * 解決されたクローズドIssue情報。
 */
export interface ClosedIssueInfo {
  /** Issue番号(例: 1)。 */
  number: number;
  /** 課題のタイトル。 */
  title: string;
}

/**
 * Gitコミットログ風タイムラインアイテムのインターフェース。
 * 1つのブランチから複数回PRをマージできる柔軟な構成に対応。
 */
export interface TimelineCommitItem {
  /** コミットハッシュ風ラベル(例: 'a12b04f')。 */
  hash: string;
  /** 年月日などのタイムスタンプ(例: '2023-03-09')。 */
  timestamp: string;
  /** コミットメッセージ風タイトル(例: 'feat: explore-cs')。 */
  commitMessage: string;
  /** 日本語標題。 */
  title: string;
  /** 直面した課題または動機。 */
  context: string;
  /** 踏み込んだ技術的アプローチと成果。 */
  achievement: string;
  /** 関連技術タグ。 */
  tags: string[];
  /** 所属ブランチ名。 */
  branch: string;
  /** ブランチの表示アクセント色。 */
  branchAccent: 'cyan' | 'green' | 'coral' | 'purple';
  /** PRマージコミットかどうか。 */
  isPrMerge?: boolean;
  /** PR番号(マージコミット時)。 */
  prNumber?: number;
  /** PRタイトル(マージコミット時)。 */
  prTitle?: string;
  /** マージ元ブランチ名。 */
  sourceBranch?: string;
  /** マージ先ブランチ名(通常は 'main')。 */
  targetBranch?: string;
  /** 解決・クローズされた関連Issue。 */
  closedIssue?: ClosedIssueInfo;
  /** 初期状態でアコーディオンを開いておくかどうか。 */
  isDefaultOpen?: boolean;
}

/**
 * プロフィール基本スペックデータ。
 */
export const historyProfile: HistoryProfile = {
  handle: 'MI-1222',
  affiliation: '東京科学大学(旧 東京工業大学) 在学',
  credentials: ['応用情報技術者試験(AP) 合格', '基本情報技術者試験(FE) 合格'],
  systemStatus: 'NOMINAL // REPOSITORY_ONLINE',
};

/**
 * Gitコミットログタイムラインデータ。
 * 1つのブランチから段階的に複数回PRを発行・マージする実践的GitHubフロー。
 */
export const timelineCommits: TimelineCommitItem[] = [
  // --------------------------------------------------------------------------
  // Origin
  // --------------------------------------------------------------------------
  {
    hash: '0000000',
    timestamp: '2004-12-22',
    commitMessage: 'feat: init',
    title: 'Initial System Boot (出生)',
    context: '原点となる最初のインスタンス初期化。',
    achievement: 'システム稼働開始。知的好奇心の初期パラメータをセット。',
    tags: ['Init', 'Origin'],
    branch: 'main',
    branchAccent: 'green',
    isDefaultOpen: false,
  },

  // --------------------------------------------------------------------------
  // Branch: feat/high-school (高校編)
  // --------------------------------------------------------------------------
  {
    hash: 'a12b04f',
    timestamp: '2021-11-25',
    commitMessage: 'feat(mindset): prefer a situation with more freedom',
    title: '自由な環境を志向するマインドセットの獲得',
    context:
      '高校の自由な校風の影響を受け、自律的・能動的な活動環境を重視するように。',
    achievement:
      '与えられた枠組みをなぞるのではなく、主体的に課題を見つけて動く基本姿勢が形成。',
    tags: ['Mindset', 'Autonomy'],
    branch: 'feat/high-school',
    branchAccent: 'cyan',
    isDefaultOpen: false,
  },
  {
    hash: 'b45c19e',
    timestamp: '2023-02-04',
    commitMessage:
      'fix(mindset): add mindset of taking responsibility within a situation of freedom',
    title: '自由の中での自己責任原則の実装',
    context:
      '単なる放任ではなく、自由だからこそ結果に自ら責任を負う覚悟の必要性を痛感。',
    achievement:
      '自走力・セルフマネジメント力を強化し、困難な課題に対しても自己完結型で挑むマインドへ更新。',
    tags: ['Mindset', 'Responsibility'],
    branch: 'feat/high-school',
    branchAccent: 'cyan',
    isDefaultOpen: false,
  },
  {
    hash: 'c78d302',
    timestamp: '2023-02-26',
    commitMessage: 'feat(math): intensive math & physics problem solving',
    title: '受験勉強を通じた数学・物理の武器化',
    context:
      '文系科目への苦手意識と向き合い、強みである数学・物理を圧倒的得点源へと昇華させる戦略を採用。大学数学の基礎概念にも一部先行して触れる。',
    achievement:
      '論理的思考力と数理的直観を極限まで鍛え上げ、難問に対する構造的アプローチを確立。',
    tags: ['Mathematics', 'Physics', 'Problem-Solving'],
    branch: 'feat/high-school',
    branchAccent: 'cyan',
    closedIssue: {
      number: 1,
      title:
        '文系科目の苦手意識と、数学・物理への集中リソース配分による突破戦略',
    },
    isDefaultOpen: true,
  },
  {
    hash: 'd90e415',
    timestamp: '2023-03-09',
    commitMessage: 'test: second-stage entrance examination of Tokyo Tech',
    title: '東京工業大学(現 東京科学大学) 二次試験合格',
    context: '東工大の個別学力検査を受験。',
    achievement:
      '鍛え上げた数学・物理の記述力を遺憾なく発揮し、東工大二次試験を突破・合格を達成。',
    tags: ['Tokyo-Tech', 'Entrance-Exam', 'Success'],
    branch: 'feat/high-school',
    branchAccent: 'cyan',
    isDefaultOpen: true,
  },
  {
    hash: 'e11f526',
    timestamp: '2023-03-09',
    commitMessage: 'Merge pull request #1 from feat/high-school into main',
    title: '高校編の完了と大学進学 (PR #1 Merged)',
    context: '高校時代の自律・数理探求ブランチをmainへ統合。',
    achievement:
      '東京科学大学(旧 東京工業大学)へ進学。自走型エンジニアへの次なる展開へ移行。',
    tags: ['PR-Merge', 'High-School', 'Milestone'],
    branch: 'main',
    branchAccent: 'green',
    isPrMerge: true,
    prNumber: 1,
    prTitle: 'Foundation: Autonomous Mindset & Strong Math Foundations',
    sourceBranch: 'feat/high-school',
    targetBranch: 'main',
    isDefaultOpen: true,
  },

  // --------------------------------------------------------------------------
  // Branch: feat/engineering-journey (大学・エンジニアリング展開)
  // ※ このブランチから段階的な成果ごとに PR #2, #3, #4 を順次発行・マージ
  // --------------------------------------------------------------------------
  {
    hash: 'f23a637',
    timestamp: '2024-03-30',
    commitMessage: 'feat(math): add knowledge of university-level mathematics',
    title: '大学数学の体系的探求と知見の吸収',
    context:
      '線形代数、微積分、集合と位相など、純粋数学の豊かな世界へ本格的に越境。',
    achievement:
      '抽象度の高い概念を形式化・定式化する数学的リテラシーを体得。後のLean 4や計算機科学探求の強固な土台に。',
    tags: ['Pure-Math', 'Abstract-Algebra', 'Topology'],
    branch: 'feat/engineering-journey',
    branchAccent: 'purple',
    isDefaultOpen: false,
  },
  {
    hash: 'a34b748',
    timestamp: '2024-04-14',
    commitMessage:
      'test(engineer): pass Fundamental Information Technology Engineer Examination (FE)',
    title: '基本情報技術者試験 (FE) 合格',
    context: '独学で開始したIT・計算機科学の基礎知識を客観的に検証。',
    achievement:
      'アルゴリズム、データ構造、コンピュータ構成要素、ネットワーク、セキュリティの基盤を網羅的に固めて合格。',
    tags: ['FE-Certification', 'Computer-Science', 'Exam'],
    branch: 'feat/engineering-journey',
    branchAccent: 'purple',
    isDefaultOpen: true,
  },
  {
    hash: 'b45c859',
    timestamp: '2024-09-30',
    commitMessage:
      'feat(engineer): gained interest and skills about web development via first production experience',
    title: '実運用Webサイトの開発とWeb領域への越境',
    context:
      'サークル活動の一環として、外部へ公開される実運用Webサイトの引き継ぎ・制作を担当。',
    achievement:
      'WordPress環境をベースにHTML/CSS/JSで徹底したカスタマイズを実施。Web開発の実践的楽しさと奥深さを実感。',
    tags: ['Web-Dev', 'WordPress', 'First-Production'],
    branch: 'feat/engineering-journey',
    branchAccent: 'coral',
    isDefaultOpen: false,
  },
  {
    hash: 'c56d96a',
    timestamp: '2024-10-24',
    commitMessage:
      'feat(math): add LaTeX skills and experience with Lua & TikZ',
    title: 'LuaLaTeX & TikZ による定期ドキュメントの自動組版化',
    context:
      'サークルで定期発行する重厚な文書を手動で作成・組版していた非効率を解消したい。',
    achievement:
      'LuaスクリプトとTikZを組み合わせ、変数をセットするだけでレイアウトが自動構築される組版パイプラインを構築。',
    tags: ['LaTeX', 'Lua', 'TikZ', 'Automation'],
    branch: 'feat/engineering-journey',
    branchAccent: 'coral',
    closedIssue: {
      number: 8,
      title: '手動組版による定例文書作成の非効率と人的ミスの完全自動化',
    },
    isDefaultOpen: true,
  },
  {
    hash: 'd67ea7b',
    timestamp: '2024-10-25',
    commitMessage:
      'Merge pull request #2 from feat/engineering-journey into main',
    title: '大学数学基礎・FE取得・自動組版基盤の統合 (PR #2 Merged)',
    context: '学問基盤と初期自動化成果をmainブランチへ初回マージ。',
    achievement:
      '計算機科学の基礎固めと実運用での自動化成功体験をmainブランチへ反映。',
    tags: ['PR-Merge', 'Milestone', 'Automation'],
    branch: 'main',
    branchAccent: 'green',
    isPrMerge: true,
    prNumber: 2,
    prTitle:
      'Core: Math Foundations, FE Certification & TeX Automation Pipeline',
    sourceBranch: 'feat/engineering-journey',
    targetBranch: 'main',
    isDefaultOpen: false,
  },
  {
    hash: 'e78fb8c',
    timestamp: '2024-12-26',
    commitMessage:
      'test(engineer): pass Applied Information Technology Engineer Examination (AP)',
    title: '応用情報技術者試験 (AP) 合格',
    context:
      '基本情報(FE)の合格に続き、高度なITアーキテクチャ・管理・戦略知識を証明。',
    achievement:
      'システムアーキテクチャ、データベース、情報セキュリティ、プロジェクトマネジメントを包括し合格を達成。',
    tags: ['AP-Certification', 'Architecture', 'Security'],
    branch: 'feat/engineering-journey',
    branchAccent: 'purple',
    isDefaultOpen: true,
  },
  {
    hash: 'f89ac9d',
    timestamp: '2024-12-27',
    commitMessage:
      'Merge pull request #3 from feat/engineering-journey into main',
    title: '応用情報技術者(AP)合格のmain統合 (PR #3 Merged)',
    context: '高度IT資格の合格実績をmainへ反映。',
    achievement:
      'システム基盤からセキュリティまでの高度な知識体系を確立したマイルストーンを記録。',
    tags: ['PR-Merge', 'AP-Exam', 'Milestone'],
    branch: 'main',
    branchAccent: 'green',
    isPrMerge: true,
    prNumber: 3,
    prTitle: 'Credential: Pass Applied Information Technology Engineer (AP)',
    sourceBranch: 'feat/engineering-journey',
    targetBranch: 'main',
    isDefaultOpen: false,
  },
  {
    hash: 'a90bd0e',
    timestamp: '2025-01-04',
    commitMessage: 'chore(env): get MacBook Pro M4',
    title: '主開発マシンを MacBook Pro (Apple Silicon M4) へ刷新',
    context:
      '重厚なビルド、ローカル推論、並行コンテナ処理に耐えうる作業基盤の要求。',
    achievement:
      'Apple Silicon M4を導入し、開発サイクルの爆速化・快適なZero-latency環境を整備。',
    tags: ['Hardware', 'MacBook-Pro-M4', 'Environment'],
    branch: 'feat/engineering-journey',
    branchAccent: 'coral',
    isDefaultOpen: false,
  },
  {
    hash: 'b01ce1f',
    timestamp: '2025-03-31',
    commitMessage:
      'feat(engineer): add Notion skills and eliminate knowledge siloing',
    title: 'Notionによるナレッジベース構築と運用の脱・属人化',
    context:
      'チーム内の情報が個人チャットや口頭に分散し、引き継ぎや参照の摩擦が発生。',
    achievement:
      'Notionの構造化データベースを設計し、誰でも直感的に参照・更新できるナレッジ基盤を確立。属人化を徹底排除。',
    tags: ['Notion', 'DX', 'Knowledge-Base', 'Anti-Silo'],
    branch: 'feat/engineering-journey',
    branchAccent: 'coral',
    closedIssue: {
      number: 14,
      title: 'チーム内ナレッジの分散・属人化と引き継ぎ摩擦の解消',
    },
    isDefaultOpen: true,
  },
  {
    hash: 'c12df20',
    timestamp: '2025-09-30',
    commitMessage:
      'feat(engineer): build web services using Cloudflare & Next.js with authentication',
    title: 'Cloudflare ＋ Next.js 認証付きWebアプリの構築と大幅経費削減',
    context:
      '従来のWordPressホスティング(ConoHa等)の月額費用負担と、認証要件への柔軟な対応。',
    achievement:
      'Cloudflare Pages/WorkersとNext.jsを活用し、認証機能を備えたモダンWebを構築。サーバー維持費を劇的に削減。',
    tags: ['Cloudflare', 'Next.js', 'Auth', 'Cost-Reduction'],
    branch: 'feat/engineering-journey',
    branchAccent: 'coral',
    closedIssue: {
      number: 19,
      title: '従来ホスティングの経費高騰と、認証付きモダンWeb基盤への刷新',
    },
    isDefaultOpen: true,
  },
  {
    hash: 'd23ef31',
    timestamp: '2025-10-01',
    commitMessage:
      'Merge pull request #4 from feat/engineering-journey into main',
    title: 'チームDX・モダンクラウド移行のmain統合 (PR #4 Merged)',
    context:
      '脱・属人化基盤とCloudflare/Next.jsによるコスト削減Webをmainへ統合。',
    achievement:
      '運用効率化と最新モダンクラウド技術の実装実績をmainブランチに反映。',
    tags: ['PR-Merge', 'Cloudflare', 'Next.js', 'DX'],
    branch: 'main',
    branchAccent: 'green',
    isPrMerge: true,
    prNumber: 4,
    prTitle:
      'Modernize: Workstation M4, Notion KB & Cloudflare/Next.js Migration',
    sourceBranch: 'feat/engineering-journey',
    targetBranch: 'main',
    isDefaultOpen: false,
  },

  // --------------------------------------------------------------------------
  // Branch: feat/systems-and-theory (先進低レイヤ・計算基盤・形式検証)
  // --------------------------------------------------------------------------
  {
    hash: 'e34fa42',
    timestamp: '2026-03-15',
    commitMessage:
      'feat(systems): build millisecond SVG rendering backend with Go & Cloud Run',
    title:
      'Go ＋ Cloud Run ミリ秒SVGレンダリング基盤 (tex-tikz-server) のOSS公開',
    context:
      'モバイル端末やWeb環境で重厚なTeXエンジンを直接動かせない制約の解決。',
    achievement:
      'TeXLiveを4GBから300MBへ最小コンテナ化。GoのHTTP/2ストリーミングとエッジキャッシュを融合したミリ秒APIを公開。',
    tags: ['Go', 'GCP-Cloud-Run', 'Docker', 'OSS'],
    branch: 'feat/systems-and-theory',
    branchAccent: 'purple',
    closedIssue: {
      number: 25,
      title: 'Web環境で動かない重厚TeXのコンテナ軽量化とコールドスタート解決',
    },
    isDefaultOpen: true,
  },
  {
    hash: 'f45ab53',
    timestamp: '2026-09-20',
    commitMessage:
      'feat(systems): develop CST lossless sync & local inference engines in Rust',
    title: 'Rustによる具象構文木(CST)双方向同期 & ミリ秒ローカル推論基盤の探求',
    context:
      'AST変換によるコメント・手動フォーマット消失の不満と、ローカル推論の低遅延化。',
    achievement:
      'CSTロスレス同期プレゼンエディタ(beamer-canvas)と、ModernBERT日本語特化ミリ秒推論エンジン(sokuto)を開発。',
    tags: ['Rust', 'CST-Sync', 'ModernBERT', 'Low-Latency'],
    branch: 'feat/systems-and-theory',
    branchAccent: 'purple',
    isDefaultOpen: true,
  },
  {
    hash: 'a56bc64',
    timestamp: '2026-10-20',
    commitMessage:
      'feat(theory): formalize mathematical bounds in Lean 4 & create agent skills',
    title:
      'Lean 4による対話的定理証明 & AIエージェント向け形式検証スキルの体系化',
    context:
      'AIエージェントによる数学的定理証明の自律化と、数理的厳密性の探求。',
    achievement:
      'Mathlib探索・ゴール追跡・エラー処方箋を統合したAIエージェント向けスキル群(lean4-skills)を開発・運用。',
    tags: ['Lean-4', 'Mathlib', 'Formal-Verification', 'AI-Agents'],
    branch: 'feat/systems-and-theory',
    branchAccent: 'purple',
    isDefaultOpen: true,
  },
  {
    hash: 'b67cd75',
    timestamp: '2026-10-27',
    commitMessage:
      'Merge pull request #5 from feat/systems-and-theory into main',
    title: '低レイヤ・計算基盤・形式検証の統合 (HEAD -> main)',
    context: '最新のシステム開発と形式検証の探求成果を統合。',
    achievement:
      '低レイヤからWeb、そして形式数学に至る自走型エンジニアリングの軌跡がmainブランチとして結実。',
    tags: ['PR-Merge', 'HEAD', 'Systems', 'Formal-Methods'],
    branch: 'main',
    branchAccent: 'green',
    isPrMerge: true,
    prNumber: 5,
    prTitle:
      'Systems: Go Cloud Run, Rust CST Sync & Lean 4 Formal Verification',
    sourceBranch: 'feat/systems-and-theory',
    targetBranch: 'main',
    isDefaultOpen: true,
  },
];
