import type { RagReference } from 'genai-web';
import { type ReactNode, Children, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { ErrorText } from '@/components/ui/dads/ErrorText';
import { CitationMarker } from './CitationMarker';

type Props = {
  className?: string;
  answer: string;
  references: RagReference[];
};

/**
 * 回答を Markdown で描き、本文中の引用（`[1]` など）だけを押せる印に差し替える。
 *
 * 共有の `@/components/Markdown` は差し替えの口を持たない（components が固定）ため、このページ用に
 * 小さい描画器を別に置く。読み込む remark は共有のものと同じ（gfm・breaks）。raw HTML を描く
 * rehype は入れない＝回答に HTML が混じってもタグとしては解釈されない。
 *
 * **回答に存在しない番号（`[9]` など）はそのまま文字として残す。** 生成が参照の数より大きい番号を
 * 書くことはあるので、引き当てられないときに落ちないことを優先する。
 */

/** 文字列の中の `[n]` を、引き当てられたものだけ押せる印に差し替える。 */
const splitCitations = (text: string, byNumber: Map<number, RagReference>): ReactNode[] => {
  const parts: ReactNode[] = [];
  const pattern = /\[(\d{1,4})\]/g;
  let lastIndex = 0;
  let match = pattern.exec(text);
  let key = 0;
  while (match !== null) {
    const reference = byNumber.get(Number(match[1]));
    if (reference) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      key += 1;
      parts.push(<CitationMarker key={`${reference.n}-${key}`} reference={reference} />);
      lastIndex = match.index + match[0].length;
    }
    match = pattern.exec(text);
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
};

/** 子要素のうち文字列のものだけを走査する（要素の中の文字列は、その要素の描画器が拾う）。 */
const withCitations = (children: ReactNode, byNumber: Map<number, RagReference>): ReactNode =>
  Children.map(children, (child) =>
    // 要素（強調・リンク等）はそのまま通す。中の文字列は同じ描画器の入れ子で処理される。
    typeof child === 'string' ? splitCitations(child, byNumber) : child,
  );

export const AnswerWithCitations = (props: Props) => {
  const { className, answer, references } = props;
  const byNumber = useMemo(() => new Map(references.map((r) => [r.n, r])), [references]);

  const components = useMemo(
    () => ({
      p: ({ children }: { children?: ReactNode }) => <p>{withCitations(children, byNumber)}</p>,
      li: ({ children }: { children?: ReactNode }) => <li>{withCitations(children, byNumber)}</li>,
      td: ({ children }: { children?: ReactNode }) => <td>{withCitations(children, byNumber)}</td>,
      em: ({ children }: { children?: ReactNode }) => <em>{withCitations(children, byNumber)}</em>,
      strong: ({ children }: { children?: ReactNode }) => (
        <strong>{withCitations(children, byNumber)}</strong>
      ),
    }),
    [byNumber],
  );

  return (
    <ErrorBoundary fallback={<ErrorText>回答の表示中にエラーが発生しました。</ErrorText>}>
      <div className={`prose max-w-full ${className ?? ''}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
          {answer}
        </ReactMarkdown>
      </div>
    </ErrorBoundary>
  );
};
