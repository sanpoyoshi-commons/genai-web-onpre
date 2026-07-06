import { Disclosure, DisclosureSummary } from '@/components/ui/dads/Disclosure';

export const CodeInterpreterHeader = () => {
  return (
    <div className='mb-6 flex flex-col gap-4'>
      <h1 className='flex justify-start text-std-20B-160 lg:text-std-24B-150'>データ分析</h1>
      <div className='prose prose-sm max-w-full'>
        <h2>想定用途</h2>
        <p>
          CSV や Excel のデータをアップロードし、集計・グラフ化などの分析を自然言語の指示で行うことができます。
        </p>
        <h3>アプリ個別の留意点</h3>
        <p>
          分析結果（数値・グラフ）の正確性は利用者で確認してください。データの傾向によっては意図した分析にならない場合があります。機微な情報を含むファイルの取り扱いには十分ご注意ください。
        </p>
        <h3>入力例</h3>
        <p>
          「カテゴリ別に売上を集計して棒グラフにして」「月ごとの平均値を折れ線グラフで可視化して」など、分析してほしい内容を指示してください。
        </p>
        <h2>操作方法</h2>
        <p>
          分析したい CSV / Excel ファイルを選択し、分析の指示を入力して実行します。テキストの分析結果と、生成された PNG 画像（グラフ等）が表示されます。
        </p>
        <Disclosure className='my-4'>
          <DisclosureSummary>仕組み</DisclosureSummary>
          <div className='pl-7'>
            <p>
              生成AIがアップロードされたデータを分析するコードを生成し、隔離されたサンドボックス環境で実行します。実行結果（標準出力と生成画像）を返答しています。コードの実行はネットワークから隔離された環境で行われます。
            </p>
          </div>
        </Disclosure>
      </div>
    </div>
  );
};
