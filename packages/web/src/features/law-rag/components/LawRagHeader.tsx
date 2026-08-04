import { Disclosure, DisclosureSummary } from '@/components/ui/dads/Disclosure';

export const LawRagHeader = () => {
  return (
    <div className='mb-6 flex flex-col gap-4'>
      <h1 className='flex justify-start text-std-20B-160 lg:text-std-24B-150'>法令調査</h1>
      <div className='prose prose-sm max-w-full'>
        <h2>想定用途</h2>
        <p>
          法令に関する質問を自然言語で入力すると、関連する法令・条文を検索し、出典（参照条文）付きのレポートを生成します。
        </p>
        <h3>アプリ個別の留意点</h3>
        <p>
          生成されるレポートはローカルの小型 LLM と法令データベースに基づく参考情報です。法的助言ではありません。重要な判断の前には、必ず出典として示された条文の原典（e-Gov 法令検索等）をご確認ください。法令データの取り込み時点以降の改正は反映されない場合があります。
        </p>
        <h3>入力例</h3>
        <p>
          「個人情報を取得するときに必要な手続きは？」「労働者の有給休暇の付与日数について教えて」など、調べたい法令の論点を質問してください。
        </p>
        <h2>操作方法</h2>
        <p>
          調べたい内容を質問として入力し、実行します。法令全文を対象に検索・選別するため、レポートの生成には時間がかかる場合があります（数十秒程度）。
        </p>
        <p>
          「参照時点」に将来の日付を入れると、その日に施行されている版（未施行の改正後条文）で回答します。未入力なら現行の法令で回答します。回答の下には、引用した条文ごとに「現行」「施行予定」の別と施行日を表示します。
        </p>
        <Disclosure className='my-4'>
          <DisclosureSummary>仕組み</DisclosureSummary>
          <div className='pl-7'>
            <p>
              質問から関係する法令名を推定し、該当法令の条文を本文検索（ベクトル＋全文）で絞り込み、生成AIが出典を引用したレポートにまとめます。一般的な文書 RAG とは別系統の、法令専用の検索・回答パイプラインです。
            </p>
          </div>
        </Disclosure>
      </div>
    </div>
  );
};
