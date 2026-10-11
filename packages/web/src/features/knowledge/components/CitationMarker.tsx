import type { RagReference } from 'genai-web';
import { useEffect, useId, useRef, useState } from 'react';

type Props = {
  reference: RagReference;
};

/**
 * 回答の中の引用（`[1]` など）。カーソルを当てたとき・キーボードでフォーカスしたとき・
 * タップしたときに、その番号のチャンク本文を出す。
 *
 * ボタンにしているのは、キーボードとタップの両方で開けるようにするため（`title` 属性や hover だけの
 * 吹き出しはどちらでも出ない）。本文は**文字列として描画する**（取り込んだ文書は信用できない入力なので、
 * HTML としても Markdown としても解釈させない）。
 */
export const CitationMarker = (props: Props) => {
  const { reference } = props;
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const containerRef = useRef<HTMLSpanElement>(null);

  // Esc で閉じる（開いている間だけ拾う）。
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const head = reference.headerPath
    ? `${reference.title} / ${reference.headerPath}`
    : reference.title;

  return (
    <span ref={containerRef} className='relative inline-block'>
      <button
        type='button'
        className='rounded-4 bg-blue-100 px-1 text-blue-1200 underline hover:bg-blue-200 focus:ring-[calc(2/16*1rem)] focus:ring-yellow-300 focus:outline-2 focus:outline-black'
        aria-expanded={open}
        aria-describedby={open ? panelId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        [{reference.n}]
      </button>
      {open && (
        <span
          id={panelId}
          role='tooltip'
          className='absolute top-full left-0 z-10 mt-1 block w-[min(32rem,80vw)] rounded-8 border border-solid-gray-420 bg-white p-3 text-left shadow-xl'
        >
          <span className='block text-std-16B-150 wrap-anywhere'>{head}</span>
          <span className='mt-1 block text-std-16N-170 text-solid-gray-600'>
            {reference.chunkIndex} 番目のチャンク／スコア {reference.score.toFixed(4)}
            {reference.rerankScore !== undefined &&
              `（並べ替え ${reference.rerankScore.toFixed(4)}）`}
          </span>
          {/* 文字列として描画する（dangerouslySetInnerHTML も Markdown も使わない）。 */}
          <span className='mt-2 block max-h-64 overflow-y-auto whitespace-pre-wrap wrap-anywhere text-std-16N-170'>
            {reference.text}
          </span>
        </span>
      )}
    </span>
  );
};
