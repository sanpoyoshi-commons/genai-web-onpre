import type { LawRagQueryResponse } from 'genai-web';
import { badgeLabel, enforceNote } from '../utils/asOf';

/**
 * 引用条文の版（施行日）を明示するパネル。
 *
 * レポート本文の「## 出典」にも施行日は焼き込まれるが、それは散文なので読み飛ばされうる。
 * 「どの版で答えたか」は法令調査の信頼の核心なので、参照時点・データ基準日・条文ごとの
 * 現行／施行予定を、本文と独立した一覧として必ず目に入る形で出す。
 * api が版メタを返さない場合（旧 api）は何も描かない＝従来表示のまま。
 */
export const LawRagVersions = ({ response }: { response: LawRagQueryResponse }) => {
  const { references, asOfDate, dataAsOf } = response;

  if (!references || references.length === 0) {
    return null;
  }

  return (
    <div className='mt-6 rounded-8 border border-solid-gray-420 p-4'>
      <h3 className='text-std-16B-150'>引用した条文の版</h3>

      <dl className='mt-2 flex flex-col gap-1 text-oln-14N-100 text-solid-gray-800 sm:flex-row sm:gap-6'>
        <div className='flex gap-2'>
          <dt className='text-solid-gray-536'>参照時点</dt>
          <dd>{asOfDate ? asOfDate : '現行（今日時点）'}</dd>
        </div>
        {dataAsOf && (
          <div className='flex gap-2'>
            <dt className='text-solid-gray-536'>データ基準日</dt>
            <dd>
              {dataAsOf.egovFetchDate}（{dataAsOf.releaseTag}）
            </dd>
          </div>
        )}
      </dl>

      <ul className='mt-3 flex flex-col gap-2'>
        {references.map((ref) => {
          const label = badgeLabel(ref);
          const note = enforceNote(ref);
          return (
            <li key={`${ref.n}-${ref.url}`} className='flex flex-wrap items-center gap-2'>
              <span className='text-oln-14N-100 text-solid-gray-536'>[{ref.n}]</span>
              <span
                className={`inline-block rounded-lg px-2 py-1 text-oln-14N-100 text-white ${
                  label === '施行予定' ? 'bg-blue-900' : 'bg-solid-gray-536'
                }`}
              >
                {label}
              </span>
              <span className='text-oln-14N-100 text-solid-gray-800'>{ref.title}</span>
              {note && <span className='text-oln-14N-100 text-solid-gray-536'>{note}</span>}
            </li>
          );
        })}
      </ul>

      <p className='mt-3 text-oln-14N-100 text-solid-gray-536'>
        施行日は法令データに記録された版の情報です。改正前後のどちらの版が適用されるかは附則の経過措置によって条ごとに異なるため、適用の判断は原典をご確認ください。
      </p>
    </div>
  );
};
