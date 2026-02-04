import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Home, 
  BookOpen, 
  ArrowRight, 
  CheckSquare, 
  Square,
  Trophy,
  BarChart3
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// ==========================================
// データ定義 (添付ファイルの内容を反映)
// ==========================================

const QUIZ_DATA = [
  {
    id: 1,
    category: "工場計画と開発設計",
    title: "工場レイアウト 1",
    question: "工場内の設備レイアウトに関する記述として、最も適切なものはどれか。",
    choices: [
      "類似した機能の設備をまとめて配置するのは、製品別レイアウトである。",
      "製品別レイアウトは、製品の加工の「流れ」を重視したレイアウトで、ジョブショップ型と呼ばれることもある。",
      "固定式レイアウトでは、製品の移動がほとんどなく、作業員や工具が製品の周りを移動する。",
      "機能別レイアウトでは、機能の類似した製品をグループ化して共通のラインで生産する。"
    ],
    correctAnswerIndex: 2, // ウ
    explanationText: "固定式レイアウトは、製品を固定するレイアウトで、作業員や工具が製品の周りを移動します。重量物などの製品を個別生産する場合に向いています。",
    detailedExplanation: [
      { status: "×", text: "類似した機能の設備をまとめて配置するのは、機能別レイアウトです。製品別レイアウトは、加工順序に沿って設備を配置します。" },
      { status: "×", text: "製品別レイアウトは「フローショップ型」と呼ばれます。「ジョブショップ型」と呼ばれるのは、機能別レイアウト方式です。" },
      { status: "○", text: "固定式レイアウトは、製品を固定し、作業員や工具が移動します。大型重量物に向いています。" },
      { status: "×", text: "類似した製品をグループ化するのは、グループ別レイアウトです。機能別レイアウトは類似した「設備」をまとめます。" }
    ],
    diagramId: "layout-types"
  },
  {
    id: 2,
    category: "工場計画と開発設計",
    title: "工場レイアウト 2",
    question: "工場内の設備レイアウトの特徴に関する記述として、最も不適切なものはどれか。",
    choices: [
      "固定式レイアウトの生産効率を高めるためには、設備レイアウトを見直すより、作業者や工具の移動のムダを減らすことが重要である。",
      "グループ別レイアウトでは、製品の生産工程が変わっても設備レイアウトを見直す必要がなく、加工経路を変えるだけで対応ができる。",
      "機能別レイアウトでは、作業員はまとまった機能単位に仕事をするため生産に熟練しやすい。",
      "グループ別レイアウトの生産効率は、製品別レイアウトより下がる傾向にある。"
    ],
    correctAnswerIndex: 1, // イ
    explanationText: "グループ別レイアウトは、類似製品をグループ化して専用ライン化するため、工程が大きく変わればレイアウトの見直しが必要です。加工経路の変更だけで対応しやすいのは機能別レイアウトの特徴です。",
    detailedExplanation: [
      { status: "○", text: "固定式では設備は動かないため、人や工具の移動ロス削減が効率化の鍵です。" },
      { status: "×", text: "これが正解（不適切）。グループ別はラインを組むため、工程変更にはレイアウト変更が必要になることが多いです。経路変更で柔軟に対応できるのは機能別です。" },
      { status: "○", text: "機能別は同じ種類の機械が集まるため、その特定作業の熟練度が上がりやすいです。" },
      { status: "○", text: "専用ラインの製品別レイアウトに比べると、汎用性を持たせるグループ別は生産効率がやや劣ります。" }
    ],
    diagramId: "layout-comparison"
  },
  {
    id: 3,
    category: "工場計画と開発設計",
    title: "工場レイアウト 3",
    question: "品種・生産量と工場レイアウトの関係に関する組み合わせとして、最も適切なものはどれか。",
    choices: [
      "多品種少量生産 － 製品別レイアウト",
      "多品種少量生産 － 固定式レイアウト",
      "中品種中量生産 － グループ別レイアウト",
      "少品種多量生産 － 機能別レイアウト"
    ],
    correctAnswerIndex: 2, // ウ
    explanationText: "中品種中量生産は、製品別と機能別の中間に位置し、グループ別レイアウト（GTレイアウト）が適しています。",
    detailedExplanation: [
      { status: "×", text: "多品種少量生産には、柔軟性の高い「機能別レイアウト」が適しています。製品別は無駄が多くなります。" },
      { status: "×", text: "固定式は「品種・生産量ともに極めて少ない」大型製品（船など）に適しています。一般的な多品種少量には機能別が向きます。" },
      { status: "○", text: "これが正解。中品種中量には、類似品をまとめるグループ別レイアウトが効率的です。" },
      { status: "×", text: "少品種多量生産には、効率重視の「製品別レイアウト」が適しています。" }
    ],
    diagramId: "pq-layout-matrix"
  },
  {
    id: 4,
    category: "SLPと分析手法",
    title: "SLPと分析手法",
    question: "工場の設備を実際にレイアウトする場合に用いられるSLPに関する分析として、最も不適切なものはどれか。",
    choices: [
      "物の流れ分析",
      "回帰分析",
      "アクティビティ相互関係分析",
      "P-Q分析"
    ],
    correctAnswerIndex: 1, // イ
    explanationText: "回帰分析は統計解析手法の一つで、需要予測などに使われますが、SLP（Systematic Layout Planning）の主要手順には含まれません。",
    detailedExplanation: [
      { status: "○", text: "物の流れ分析はSLPのステップに含まれます（製品の加工移動経路の分析）。" },
      { status: "×", text: "これが正解（不適切）。回帰分析はSLPの手法ではありません。" },
      { status: "○", text: "アクティビティ相互関係分析はSLPの重要ステップです（近接性の重要度分析）。" },
      { status: "○", text: "P-Q分析はSLPの最初に行う分析です（Product-Quantity）。" }
    ],
    diagramId: "slp-flow"
  },
  {
    id: 5,
    category: "SLPと分析手法",
    title: "SLP 1",
    question: "SLPに関する記述として、最も不適切なものはどれか。",
    choices: [
      "SLPは、Systematic Layout Planningの略で、工場内のスペースを合理的に計画できる。",
      "SLPでは、設備や機械、材料、倉庫などの構成要素のことを、アクティビティと呼ぶ。",
      "SLPでは、最初に物の流れ分析を行い、どのような流れで製品を加工、移動するかを分析する。",
      "SLPでは、最終的なレイアウト案を、スペース相互関係ダイアグラムをもとに作成する。"
    ],
    correctAnswerIndex: 2, // ウ
    explanationText: "SLPで最初に行うのは「P-Q分析」です。どのような製品(P)をどれだけ(Q)作るかを把握してから、物の流れ分析を行います。",
    detailedExplanation: [
      { status: "○", text: "記述の通りです。" },
      { status: "○", text: "記述の通り、構成要素をアクティビティと呼びます。" },
      { status: "×", text: "これが正解（不適切）。最初は「P-Q分析」を行います。" },
      { status: "○", text: "記述の通り、最終段階でスペース（面積）を考慮します。" }
    ],
    diagramId: "slp-steps"
  },
  {
    id: 6,
    category: "SLPと分析手法",
    title: "SLP 2",
    question: "SLPを用いて設備レイアウトを検討する際に、実施する分析や、作成する図の記述として、最も不適切なものはどれか。",
    choices: [
      "P-Q分析では、グラフの縦軸に生産量Qをとり、横軸に製品品種Pをとって、生産量が多いものから少ないものに、左から順番に並べる。",
      "アクティビティ相互関係ダイアグラムには、加工経路の情報に加え、アクティビティの配置に必要な面積の情報も含まれる。",
      "アクティビティ相互関係分析をすることで、アクティビティ間の近接性の重要度を一覧で確認することができる。",
      "アクティビティ相互関係ダイアグラムを作成する際は、線が重ならないようにアクティビティの位置関係を検討する。"
    ],
    correctAnswerIndex: 1, // イ
    explanationText: "アクティビティ相互関係ダイアグラムは「配置と近接性（線の太さ）」を表すもので、「面積」の情報はまだ含まれません。面積を含めるのは次のステップの「スペース相互関係ダイアグラム」です。",
    detailedExplanation: [
      { status: "○", text: "P-Q分析の記述として適切です。" },
      { status: "×", text: "これが正解（不適切）。面積の情報を含むのは「スペース相互関係ダイアグラム」です。" },
      { status: "○", text: "記述の通りです。A,E,I,O,U,Xなどでランク付けします。" },
      { status: "○", text: "記述の通り、線の交差（物流の交差）を減らすよう検討します。" }
    ],
    diagramId: "slp-diagram-details"
  },
  {
    id: 7,
    category: "製品開発・設計",
    title: "製品開発",
    question: "製品開発に関する記述として、最も不適切なものはどれか。",
    choices: [
      "製品開発とは、顧客ニーズの変化、生産者の技術向上、地球環境への対応などを動機として、新たな製品を企画し、その製品化を図る活動である。",
      "製品開発は製品企画から始まる。製品企画において、顧客ターゲットを決定し、その顧客ニーズを満たすような製品の機能や性能を検討する。",
      "製品企画を基に製品設計を行う。製品設計では、製品を目標とする品質、生産量、納期で生産するための工程や作業方法、レイアウト、生産設備などを決定する。",
      "製品設計の後に工程設計を行う。工程設計では、製品の作り方を設計する。",
      "コンカレント･エンジニアリングは、製品開発の期間を短縮し、市場にタイムリーに新製品を投入することができる。"
    ],
    correctAnswerIndex: 2, // ウ
    explanationText: "選択肢ウの記述は「工程設計」の説明です。製品設計は、製品の構造や図面を決める段階であり、作り方や設備を決めるのはその後の工程設計です。",
    detailedExplanation: [
      { status: "○", text: "製品開発の定義として適切です。" },
      { status: "○", text: "製品企画の内容として適切です。" },
      { status: "×", text: "これが正解（不適切）。記述内容は「工程設計」の説明です。「製品設計」は機能や構造（図面）を決定します。" },
      { status: "○", text: "工程設計の記述として適切です。" },
      { status: "○", text: "コンカレント・エンジニアリング（同時並行開発）の記述として適切です。" }
    ],
    diagramId: "dev-flow"
  },
  {
    id: 8,
    category: "製品開発・設計",
    title: "製品設計",
    question: "製品設計に関する記述として、最も適切なものはどれか。",
    choices: [
      "製品設計には、機能設計と工程設計がある。",
      "機能設計は、製品の機能の面から見た設計であり、期待する性能を発揮するために必要な機能と構造を決定する活動である。",
      "工程設計では、製品の構成を表す組立図、部品の構成を表す部品図、部品の一覧である部品リストなどを作成する。",
      "生産設計では、部品の数を削減したり、組み立てしやすい構造を検討するが、生産コストを抑えるための検討は行われない。"
    ],
    correctAnswerIndex: 1, // イ
    explanationText: "機能設計は、製品に求められる性能・機能を実現するための設計です。対して生産設計は、作りやすさ（コストダウン）を考慮した設計です。",
    detailedExplanation: [
      { status: "×", text: "製品設計は「機能設計」と「生産設計」に大別されます。工程設計は別のプロセスです。" },
      { status: "○", text: "これが正解。機能設計の定義です。" },
      { status: "×", text: "図面や部品リストを作成するのは「製品設計」の段階です。" },
      { status: "×", text: "生産設計の主目的の一つは、作りやすくすることで「生産コストを抑える」ことです。" }
    ],
    diagramId: "design-types"
  },
  {
    id: 9,
    category: "VE (Value Engineering)",
    title: "VE 1",
    question: "VEの「価値」に関する記述として、最も不適切なものはどれか。",
    choices: [
      "VEでは、製品の「機能」と「コスト」を基に、「価値（Value）」を定義する。また、その価値は、「価値 ＝ 機能 ÷ コスト」 という式で表される。",
      "製品の機能を維持したまま、コストを下げることで、コスト的な価値を向上する方法がある。",
      "機能を下げるが、それ以上にコストを下げて、価格に対する機能の相対的な価値を向上する方法がある。",
      "コストを上げるが、それ以上に機能を上げて、価格に対する機能の相対的な価値を向上する方法がある。"
    ],
    correctAnswerIndex: 2, // ウ
    explanationText: "VE（バリューエンジニアリング）において、「機能を下げる」という選択肢はありません。必要な機能を維持・向上させつつコストとのバランスをとるのがVEです。",
    detailedExplanation: [
      { status: "○", text: "価値(V) = 機能(F) / コスト(C) の式はVEの基本です。" },
      { status: "○", text: "F維持 / Cダウン ＝ Vアップ。正当な手法です。" },
      { status: "×", text: "これが正解（不適切）。VEでは機能を低下させることは認められません（それは別製品か低級品になります）。" },
      { status: "○", text: "Cアップ ＜ Fアップ ＝ Vアップ。高付加価値化として認められます。" }
    ],
    diagramId: "ve-formula"
  },
  {
    id: 10,
    category: "VE (Value Engineering)",
    title: "VE 2",
    question: "VEの「機能」に関する記述として、最も適切なものはどれか。",
    choices: [
      "使用機能とは、製品の本来の価値を果たす機能のことである。",
      "携帯電話のカラ―バリエーションは、二次機能に該当する。",
      "使用機能はさらに、基本機能・二次機能・貴重機能に分けることができる。",
      "携帯電話の基本機能を上げるために、新製品は従来品より軽くした。"
    ],
    correctAnswerIndex: 0, // ア
    explanationText: "使用機能は製品本来の働き（書く、切る、通話するなど）を指します。デザインなどは貴重機能に分類されます。",
    detailedExplanation: [
      { status: "○", text: "これが正解。使用機能は製品の物理的な働きです。" },
      { status: "×", text: "カラーバリエーション（魅力）は「貴重機能」です。" },
      { status: "×", text: "機能は「使用機能」と「貴重機能」に大別され、使用機能の中に「基本機能」と「二次機能」があります。" },
      { status: "×", text: "軽量化は基本機能（通話など）ではなく、補助的な「二次機能」の向上、または魅力を高める貴重機能の側面が強いです。" }
    ],
    diagramId: "ve-function-tree"
  }
];

// ==========================================
// 図解コンポーネント
// ==========================================

const DiagramRenderer = ({ diagramId }) => {
  switch (diagramId) {
    case "layout-types":
      return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 my-4 text-sm">
          <h4 className="font-bold text-center mb-3 text-slate-700">◆ 工場レイアウトの基本4分類</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded shadow-sm border-l-4 border-blue-500">
              <div className="font-bold text-blue-700">固定式レイアウト</div>
              <div className="text-xs text-slate-500 mt-1">製品は固定 / 人・工具が移動</div>
              <div className="mt-2 text-slate-600">船・大型機械など</div>
            </div>
            <div className="bg-white p-3 rounded shadow-sm border-l-4 border-green-500">
              <div className="font-bold text-green-700">機能別レイアウト</div>
              <div className="text-xs text-slate-500 mt-1">類似した「設備」をまとめる</div>
              <div className="mt-2 text-slate-600">多品種少量 (ジョブショップ)</div>
            </div>
            <div className="bg-white p-3 rounded shadow-sm border-l-4 border-orange-500">
              <div className="font-bold text-orange-700">製品別レイアウト</div>
              <div className="text-xs text-slate-500 mt-1">加工順序に沿って配置</div>
              <div className="mt-2 text-slate-600">少品種多量 (フローショップ)</div>
            </div>
            <div className="bg-white p-3 rounded shadow-sm border-l-4 border-purple-500">
              <div className="font-bold text-purple-700">グループ別レイアウト</div>
              <div className="text-xs text-slate-500 mt-1">類似製品をグループ化</div>
              <div className="mt-2 text-slate-600">中品種中量 (GT)</div>
            </div>
          </div>
        </div>
      );
    case "pq-layout-matrix":
      return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 my-4">
          <h4 className="font-bold text-center mb-3 text-slate-700">◆ 品種・生産量とレイアウトの関係</h4>
          <div className="relative h-48 w-full border-l-2 border-b-2 border-slate-400">
            <div className="absolute top-0 left-2 text-xs font-bold text-slate-500">生産量(Q)</div>
            <div className="absolute bottom-2 right-0 text-xs font-bold text-slate-500">品種(P)</div>
            
            {/* Areas */}
            <div className="absolute top-2 left-4 w-24 h-16 bg-orange-100 flex items-center justify-center text-center text-xs font-bold text-orange-800 rounded shadow-sm">
              製品別<br/>レイアウト
            </div>
            <div className="absolute top-16 left-24 w-24 h-16 bg-purple-100 flex items-center justify-center text-center text-xs font-bold text-purple-800 rounded shadow-sm z-10">
              グループ別<br/>レイアウト
            </div>
            <div className="absolute bottom-4 right-4 w-24 h-16 bg-green-100 flex items-center justify-center text-center text-xs font-bold text-green-800 rounded shadow-sm">
              機能別<br/>レイアウト
            </div>
             <div className="absolute bottom-4 left-4 w-24 h-12 bg-blue-100 flex items-center justify-center text-center text-xs font-bold text-blue-800 rounded shadow-sm">
              固定式
            </div>
          </div>
          <p className="text-xs text-center text-slate-500 mt-2">品種少・量多 → 製品別 / 品種多・量少 → 機能別</p>
        </div>
      );
    case "slp-steps":
      return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 my-4">
          <h4 className="font-bold text-center mb-3 text-slate-700">◆ SLPの基本手順</h4>
          <div className="flex flex-col items-center space-y-2 text-sm">
            <div className="bg-white px-4 py-2 rounded shadow border border-slate-300 w-full text-center font-bold">P-Q分析 (Product-Quantity)</div>
            <ArrowRight className="rotate-90 text-slate-400" size={20} />
            <div className="flex w-full gap-2">
              <div className="bg-white px-2 py-2 rounded shadow border border-slate-300 flex-1 text-center text-xs">物の流れ分析</div>
              <div className="bg-white px-2 py-2 rounded shadow border border-slate-300 flex-1 text-center text-xs">アクティビティ相互関係分析</div>
            </div>
            <ArrowRight className="rotate-90 text-slate-400" size={20} />
            <div className="bg-blue-50 px-4 py-2 rounded shadow border border-blue-200 w-full text-center text-blue-800">相互関係ダイアグラム</div>
            <ArrowRight className="rotate-90 text-slate-400" size={20} />
            <div className="bg-green-50 px-4 py-2 rounded shadow border border-green-200 w-full text-center text-green-800">面積の検討 (スペースダイアグラム)</div>
            <ArrowRight className="rotate-90 text-slate-400" size={20} />
            <div className="bg-slate-800 px-4 py-2 rounded shadow text-white w-full text-center font-bold">レイアウト決定</div>
          </div>
        </div>
      );
    case "ve-formula":
      return (
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 my-4 text-center">
          <h4 className="font-bold text-slate-700 mb-4">◆ VEの価値の式</h4>
          <div className="inline-block bg-white p-4 rounded-xl shadow-md border border-slate-200">
            <div className="text-2xl font-bold text-slate-800 flex items-center gap-4">
              <span>価値 (V)</span>
              <span>=</span>
              <div className="flex flex-col items-center">
                <span className="border-b-2 border-slate-800 px-2">機能 (F)</span>
                <span>コスト (C)</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-600 text-left space-y-2 max-w-xs mx-auto">
            <div className="flex items-center gap-2"><span className="text-red-500 font-bold">×</span> 機能を下げる (認められない)</div>
            <div className="flex items-center gap-2"><span className="text-green-500 font-bold">◎</span> コスト下げて機能維持</div>
            <div className="flex items-center gap-2"><span className="text-green-500 font-bold">◎</span> コスト維持して機能向上</div>
            <div className="flex items-center gap-2"><span className="text-green-500 font-bold">★</span> コスト下げて機能向上 (最良)</div>
          </div>
        </div>
      );
    case "ve-function-tree":
      return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 my-4">
          <h4 className="font-bold text-center mb-3 text-slate-700">◆ 機能の分類</h4>
          <div className="tree-diagram flex items-center justify-center text-sm">
            <div className="bg-white p-2 border rounded shadow mr-4 font-bold">機能</div>
            <div className="h-16 border-l-2 border-slate-300 mx-2"></div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center">
                <div className="w-4 border-t-2 border-slate-300"></div>
                <div className="bg-blue-50 p-2 border border-blue-200 rounded shadow">
                  <div className="font-bold text-blue-800">使用機能</div>
                  <div className="text-xs text-slate-500">本来の働き</div>
                </div>
                <div className="w-4 border-t-2 border-slate-300"></div>
                <div className="flex flex-col gap-2 ml-2">
                   <span className="bg-white text-xs p-1 border rounded">基本機能</span>
                   <span className="bg-white text-xs p-1 border rounded">二次機能</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-4 border-t-2 border-slate-300"></div>
                <div className="bg-pink-50 p-2 border border-pink-200 rounded shadow">
                  <div className="font-bold text-pink-800">貴重機能</div>
                  <div className="text-xs text-slate-500">魅力 (色・形)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

// ==========================================
// メインコンポーネント
// ==========================================

export default function App() {
  const [appState, setAppState] = useState('home'); // 'home', 'quiz', 'result'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // 永続化データ (履歴)
  const [history, setHistory] = useState({});

  // フィルタリングされた問題リスト
  const [activeQuestions, setActiveQuestions] = useState([]);

  // 初期ロード
  useEffect(() => {
    const savedHistory = localStorage.getItem('quizApp_history_v1');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // 履歴保存
  useEffect(() => {
    localStorage.setItem('quizApp_history_v1', JSON.stringify(history));
  }, [history]);

  // --- Helpers ---

  const getFilteredQuestions = (mode) => {
    if (mode === 'all') return QUIZ_DATA;
    if (mode === 'incorrect') {
      return QUIZ_DATA.filter(q => history[q.id] && history[q.id].isCorrect === false);
    }
    if (mode === 'review') {
      return QUIZ_DATA.filter(q => history[q.id] && history[q.id].needsReview === true);
    }
    return QUIZ_DATA;
  };

  const startQuiz = (mode) => {
    const filtered = getFilteredQuestions(mode);
    if (filtered.length === 0) {
      alert("対象の問題がありません。");
      return;
    }
    setActiveQuestions(filtered);
    setCurrentQuestionIndex(0);
    setAppState('quiz');
    resetQuestionState();
  };

  const resetQuestionState = () => {
    setSelectedChoice(null);
    setIsAnswered(false);
    setIsCorrect(false);
  };

  const handleAnswer = (choiceIndex) => {
    if (isAnswered) return;
    
    const currentQ = activeQuestions[currentQuestionIndex];
    if (!currentQ) return;

    const correct = choiceIndex === currentQ.correctAnswerIndex;
    setSelectedChoice(choiceIndex);
    setIsCorrect(correct);
    setIsAnswered(true);

    // Update History
    setHistory(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        isCorrect: correct,
        lastAnsweredAt: new Date().toISOString(),
        userChoiceIndex: choiceIndex,
      }
    }));
  };

  const toggleReview = () => {
    const currentQ = activeQuestions[currentQuestionIndex];
    if (!currentQ) return;

    setHistory(prev => {
      const currentStatus = prev[currentQ.id]?.needsReview || false;
      return {
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          needsReview: !currentStatus
        }
      };
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetQuestionState();
    } else {
      setAppState('result');
    }
  };

  // --- Views ---

  const HomeView = () => {
    const totalAnswered = Object.keys(history).length;
    const totalCorrect = Object.values(history).filter(h => h.isCorrect).length;
    const totalReview = Object.values(history).filter(h => h.needsReview).length;
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    
    const incorrectCount = QUIZ_DATA.filter(q => history[q.id] && !history[q.id].isCorrect).length;

    const data = [
        { name: '正解', value: totalCorrect, color: '#22c55e' },
        { name: '不正解', value: totalAnswered - totalCorrect, color: '#ef4444' },
    ];
    // prevent empty chart error
    const chartData = totalAnswered === 0 ? [{name: '未回答', value: 1, color: '#e2e8f0'}] : data;

    return (
      <div className="max-w-md mx-auto p-4 space-y-6 animate-in fade-in duration-500">
        <header className="text-center pt-8 pb-4">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">スマート問題集</h1>
          <p className="text-slate-500">工場計画・製品開発・VE</p>
        </header>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-700 flex items-center gap-2">
              <BarChart3 size={20} /> 学習状況
            </h2>
            <span className="text-sm text-slate-400">全{QUIZ_DATA.length}問</span>
          </div>
          
          <div className="flex items-center justify-center h-40">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center mt-4">
            <div className="p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{accuracy}%</div>
                <div className="text-xs text-green-800">正答率</div>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">{incorrectCount}</div>
                <div className="text-xs text-red-800">苦手</div>
            </div>
             <div className="p-2 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{totalReview}</div>
                <div className="text-xs text-orange-800">要復習</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => startQuiz('all')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="text-blue-200" />
              <div className="text-left">
                <div className="text-sm opacity-90">すべての問題</div>
                <div>スタート</div>
              </div>
            </div>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => startQuiz('incorrect')}
              disabled={incorrectCount === 0}
              className={`p-4 rounded-xl font-bold text-left shadow-sm transition-all border flex flex-col justify-between h-28 ${
                incorrectCount > 0 
                ? 'bg-white border-red-100 hover:border-red-300 text-slate-700' 
                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <XCircle className={incorrectCount > 0 ? "text-red-500" : "text-slate-300"} />
              <div>
                <div className="text-xs opacity-70">前回不正解のみ</div>
                <div>リトライ</div>
              </div>
            </button>

            <button 
              onClick={() => startQuiz('review')}
              disabled={totalReview === 0}
              className={`p-4 rounded-xl font-bold text-left shadow-sm transition-all border flex flex-col justify-between h-28 ${
                totalReview > 0 
                ? 'bg-white border-orange-100 hover:border-orange-300 text-slate-700' 
                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckSquare className={totalReview > 0 ? "text-orange-500" : "text-slate-300"} />
              <div>
                <div className="text-xs opacity-70">チェックした問題</div>
                <div>復習モード</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const QuizView = () => {
    const currentQ = activeQuestions[currentQuestionIndex];
    if (!currentQ) return <div>Loading...</div>;

    const needsReview = history[currentQ.id]?.needsReview || false;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button onClick={() => setAppState('home')} className="text-slate-400 hover:text-slate-600">
              <Home size={20} />
            </button>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-sm font-bold text-slate-500">
              {currentQuestionIndex + 1} / {activeQuestions.length}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-24">
          <div className="max-w-2xl mx-auto space-y-6">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-2">
                  {currentQ.category}
                </span>
                <h2 className="text-lg font-bold text-slate-800 leading-relaxed">
                  {currentQ.question}
                </h2>
              </div>

              <div className="space-y-3">
                {currentQ.choices.map((choice, idx) => {
                  let buttonStyle = "border-slate-200 hover:bg-slate-50 hover:border-blue-300 text-slate-700";
                  
                  if (isAnswered) {
                    if (idx === currentQ.correctAnswerIndex) {
                      buttonStyle = "bg-green-50 border-green-500 text-green-700 font-bold ring-1 ring-green-500";
                    } else if (idx === selectedChoice) {
                      buttonStyle = "bg-red-50 border-red-500 text-red-700 opacity-60";
                    } else {
                      buttonStyle = "border-slate-100 text-slate-400 opacity-50";
                    }
                  } else if (selectedChoice === idx) {
                    buttonStyle = "bg-blue-50 border-blue-500 text-blue-700";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={isAnswered}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all text-sm leading-relaxed relative ${buttonStyle}`}
                    >
                      <div className="flex gap-3">
                         <div className="flex-shrink-0 font-bold w-6">{['ア','イ','ウ','エ'][idx]}</div>
                         <div>{choice}</div>
                      </div>
                      {isAnswered && idx === currentQ.correctAnswerIndex && (
                        <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600" size={20} />
                      )}
                      {isAnswered && idx === selectedChoice && idx !== currentQ.correctAnswerIndex && (
                        <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {isAnswered && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                  <div className={`flex items-center gap-2 text-lg font-bold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                    {isCorrect ? <CheckCircle /> : <XCircle />}
                    <span>{isCorrect ? '正解！' : '不正解...'}</span>
                  </div>
                  <button 
                    onClick={toggleReview}
                    className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full transition-colors ${
                      needsReview 
                      ? 'bg-orange-100 text-orange-700 font-bold' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {needsReview ? <CheckSquare size={16}/> : <Square size={16}/>}
                    要復習
                  </button>
                </div>

                <div className="prose prose-sm max-w-none text-slate-700">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">【解説】</h3>
                  <p className="mb-4">{currentQ.explanationText}</p>
                  
                  {currentQ.diagramId && <DiagramRenderer diagramId={currentQ.diagramId} />}

                  <h4 className="text-xs font-bold text-slate-500 mt-6 mb-3 uppercase tracking-wider">選択肢の詳細</h4>
                  <ul className="space-y-3">
                    {currentQ.detailedExplanation.map((exp, idx) => (
                      <li key={idx} className="flex gap-3 text-sm bg-slate-50 p-3 rounded-lg">
                        <span className={`font-bold flex-shrink-0 ${exp.status === '○' ? 'text-green-600' : 'text-red-500'}`}>
                          {exp.status}
                        </span>
                        <span>{exp.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {isAnswered && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="max-w-2xl mx-auto">
              <button
                onClick={nextQuestion}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>{currentQuestionIndex < activeQuestions.length - 1 ? '次の問題へ' : '結果を見る'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ResultView = () => {
    const correctCount = activeQuestions.filter(q => history[q.id]?.isCorrect).length;
    const score = Math.round((correctCount / activeQuestions.length) * 100);

    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-md mx-auto space-y-6 pt-8">
          <div className="text-center space-y-2">
            <div className="inline-block p-4 bg-yellow-100 text-yellow-600 rounded-full mb-2">
              <Trophy size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">お疲れ様でした！</h2>
            <div className="text-5xl font-black text-slate-900 my-4">
              {score}<span className="text-2xl font-medium text-slate-400">点</span>
            </div>
            <p className="text-slate-500">
              {activeQuestions.length}問中 {correctCount}問 正解
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-600">
              回答一覧
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {activeQuestions.map((q, idx) => {
                const isCorrect = history[q.id]?.isCorrect;
                return (
                  <div key={q.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400">Q{idx+1}</span>
                        {isCorrect ? 
                          <CheckCircle size={18} className="text-green-500" /> : 
                          <XCircle size={18} className="text-red-500" />
                        }
                        <span className="text-sm font-medium text-slate-700 truncate w-48">{q.title}</span>
                     </div>
                     {history[q.id]?.needsReview && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">復習</span>
                     )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setAppState('home')}
            className="w-full bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} />
            ホームに戻る
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-screen">
      {appState === 'home' && <HomeView />}
      {appState === 'quiz' && <QuizView />}
      {appState === 'result' && <ResultView />}
    </div>
  );
}