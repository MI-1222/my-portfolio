import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/** 技術領域カテゴリのバリデーションスキーマ。 */
const categoryEnum = z.enum(['systems', 'cloud', 'productivity']);

/** プロジェクト公開ステータスのバリデーションスキーマ。 */
const statusEnum = z.enum(['OSS', 'RESEARCH', 'INTERNAL', 'PLANNING']);

/** アクセントカラーのバリデーションスキーマ。 */
const accentEnum = z.enum(['cyan', 'green', 'coral', 'purple']);

/** 定量的インパクトを示す工学的メトリクスのバリデーションスキーマ。 */
const metricSchema = z.object({
  /** メトリクス名。 */
  label: z.string(),
  /** メトリクスの値。 */
  value: z.string(),
});

/** 制作物・技術解説のコンテンツコレクション定義。 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    /** 記事タイトル。 */
    title: z.string(),
    /** サブタイトルまたは概要。 */
    subtitle: z.string(),
    /** 技術領域カテゴリ。 */
    category: categoryEnum,
    /** 表示用カテゴリラベル。 */
    categoryLabel: z.string(),
    /** 開発ステータス。 */
    status: statusEnum,
    /** テーマアクセントカラー。 */
    accent: accentEnum,
    /** 初回公開日。 */
    publishedAt: z.coerce.date(),
    /** 最終更新日。 */
    updatedAt: z.coerce.date().optional(),
    /** 関連技術スタックタグ一覧。 */
    tags: z.array(z.string()).default([]),
    /** 課題と解決アプローチの要約文。 */
    summary: z.string(),
    /** GitHub リポジトリ URL。 */
    githubUrl: z.string().url().optional(),
    /** デモまたは公開サイト URL。 */
    demoUrl: z.string().url().optional(),
    /** 定量的改善指標一覧。 */
    metrics: z.array(metricSchema).optional(),
    /** アーキテクチャの核心要約。 */
    architectureHighlight: z.string().optional(),
    /** 動作検証済みランタイム・言語バージョン一覧。 */
    verifiedVersions: z.array(z.string()).optional(),
    /** ターミナルから直接呼び出せる推奨コマンド。 */
    cliCommand: z.string().optional(),
    /** 検索用キーワード一覧。 */
    searchKeywords: z.array(z.string()).optional(),
  }),
});

/** Astro Content Collections の登録定義オブジェクト。 */
export const collections = {
  projects,
};
