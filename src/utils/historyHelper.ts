/**
 * タイムライン表示用ヘルパーユーティリティ。
 * コミット詳細テキストの解析やトークン分割、座標計算関数を提供する。
 */

/**
 * レーン番号からX座標ピクセル値を計算する。
 *
 * @param lane レーン番号 (0〜5)。
 * @returns X座標ピクセル値。
 */
export const getLaneX = (lane: number): number => 14 + lane * 18;

/**
 * context文字列のセグメント種別定義。
 */
export interface ContextSegment {
  type: 'text' | 'mermaid';
  content: string;
}

/**
 * context文字列をテキスト部とMermaid図ブロックに分割する。
 *
 * @param context 分割対象のcontext文字列。
 * @returns 分割されたセグメント配列。
 */
export const splitContext = (context: string): ContextSegment[] => {
  const segments: ContextSegment[] = [];
  const regex = /```mermaid\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(context)) !== null) {
    if (match.index > lastIndex) {
      const text = context.slice(lastIndex, match.index).trim();
      if (text) {
        segments.push({ type: 'text', content: text });
      }
    }
    segments.push({ type: 'mermaid', content: match[1].trim() });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < context.length) {
    const text = context.slice(lastIndex).trim();
    if (text) {
      segments.push({ type: 'text', content: text });
    }
  }

  return segments;
};

/**
 * テキスト行内のインライントークン種別。
 */
export interface InlineToken {
  type: 'text' | 'link' | 'code';
  content: string;
  href?: string;
}

/**
 * テキストをURL、インラインコード、平文テキストのトークンに分割する。
 *
 * @param text 解析対象の文字列。
 * @returns 分割されたトークン配列。
 */
export const tokenizeInline = (text: string): InlineToken[] => {
  const tokens: InlineToken[] = [];
  const regex = /(https?:\/\/[^\s\)]+)|`([^`]+)`/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      tokens.push({
        type: 'text',
        content: text.slice(lastIdx, match.index),
      });
    }

    if (match[1]) {
      tokens.push({
        type: 'link',
        content: match[1],
        href: match[1],
      });
    } else if (match[2]) {
      tokens.push({
        type: 'code',
        content: match[2],
      });
    }

    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    tokens.push({
      type: 'text',
      content: text.slice(lastIdx),
    });
  }

  return tokens;
};

/**
 * コメントブロックの種別定義。
 */
export interface CommentBlock {
  type: 'paragraph' | 'list' | 'quote';
  lines: string[];
}

/**
 * コメントテキストを行単位で解析し、段落・箇条書き・引用のブロック構造に変換する。
 *
 * @param text 解析対象のコメント文字列。
 * @returns ブロック配列。
 */
export const parseCommentBlocks = (text: string): CommentBlock[] => {
  const rawLines = text.split('\n');
  const blocks: CommentBlock[] = [];
  let currentBlock: CommentBlock | null = null;

  for (const rawLine of rawLines) {
    const line = rawLine.trim();

    if (!line) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }

    if (
      line.startsWith('- ') ||
      line.startsWith('* ') ||
      line.startsWith('• ')
    ) {
      const itemText = line.replace(/^[-*•]\s*/, '');
      if (currentBlock && currentBlock.type === 'list') {
        currentBlock.lines.push(itemText);
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'list', lines: [itemText] };
      }
    } else if (line.startsWith('>')) {
      const quoteText = line.replace(/^>\s*/, '');
      if (currentBlock && currentBlock.type === 'quote') {
        currentBlock.lines.push(quoteText);
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'quote', lines: [quoteText] };
      }
    } else {
      if (currentBlock && currentBlock.type === 'paragraph') {
        currentBlock.lines.push(line);
      } else {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'paragraph', lines: [line] };
      }
    }
  }

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  return blocks;
};

/**
 * 文字列からシンプルなハッシュ値を計算する。
 *
 * @param str 入力文字列。
 * @returns 32ビット符号なし整数。
 */
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

/**
 * ユーザー名に応じたGitHub風Identiconの5x5セル（左右対称）と色情報を取得する。
 *
 * @param username ユーザー名。
 * @returns 前景色、背景色、および塗りつぶすセル座標配列。
 */
export const getIdenticonData = (
  username: string,
): { fgColor: string; bgColor: string; cells: [number, number][] } => {
  const hash = simpleHash(username);

  // GitHub風の暖色パレット (オレンジ系)。
  const fgColor = '#de5833';
  const bgColor = '#faeae5';

  const cells: [number, number][] = [];
  // 5x5で左右対称のため、列0, 1, 2の15マスをハッシュ値ビットで決定。
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 5; row++) {
      const bitIndex = col * 5 + row;
      const isFilled = ((hash >> bitIndex) & 1) === 1;
      if (isFilled) {
        cells.push([col, row]);
        if (col < 2) {
          cells.push([4 - col, row]); // 左右対称ミラー。
        }
      }
    }
  }

  return { fgColor, bgColor, cells };
};
