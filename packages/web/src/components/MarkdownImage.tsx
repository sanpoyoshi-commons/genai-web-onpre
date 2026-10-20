import { ComponentProps } from 'react';
import { Link } from '@/components/ui/dads/Link';
import { externalImageHref, isSelfServedImageSrc } from '@/utils/imageSrc';

/**
 * Markdown の画像。同じ配信元のものと手元にあるもの（data:・blob:）だけを描き、
 * 外部を指すものは読み込まずに alt と宛先を文字で出す（UPSTREAM.md §6-5）。
 * 宛先を開くかどうかは利用者が決める。
 */
export const MarkdownImage = (props: ComponentProps<'img'>) => {
  if (isSelfServedImageSrc(props.src)) {
    return <img id={props.id} src={props.src} alt={props.alt} {...props} />;
  }

  const href = externalImageHref(props.src);

  return (
    <span id={props.id} className='inline-flex flex-wrap items-baseline gap-1 text-solid-gray-600'>
      <span>{href ? '［外部の画像は読み込みません］' : '［画像を表示できません］'}</span>
      {props.alt ? <span>{props.alt}</span> : null}
      {href ? (
        <Link href={href} target='_blank' rel='noreferrer noopener'>
          {href}
        </Link>
      ) : null}
    </span>
  );
};
