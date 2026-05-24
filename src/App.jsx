// npm install lucide-react recharts firebase
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { Check, X, Home, ChevronRight, RefreshCw, BarChart2, BookOpen, AlertCircle, Bookmark, Star, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================
const APP_ID = "QuizApp_FactoryLayout_001";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ==========================================
// QUIZ DATA DATASET
// ==========================================
const QUIZ_DATA = [
  {
    id: "Q1",
    title: "問題 1 工場レイアウト 1",
    meta: "中小企業診断士 開発設計",
    question: "工場内の設備レイアウトに関する記述として、最も適切なものはどれか。",
    options: [
      { key: "ア", text: "製品別レイアウトを採用するため、複数あるNC旋盤、研磨機、塗装機をそれぞれ機械毎にまとめて配置した。" },
      { key: "イ", text: "製品別レイアウトは、製品の加工の「流れ」を重視したレイアウトで、ジョブショップ型と呼ばれることもある。" },
      { key: "ウ", text: "固定式レイアウトでは、製品の移動がほとんどなく、作業員や工具が製品の周りを移動する。" },
      { key: "エ", text: "機能別レイアウトでは、機能の類似した製品をグループ化して共通のラインで生産する。" }
    ],
    answer: "ウ",
    explanation: {
      summary: "本問では工場レイアウトの種類とその内容が問われています。工場レイアウトには次の4つの基本的な分類があります。",
      table: [
        { type: "固定式レイアウト", desc: "製品を固定して作業を行う方式のレイアウトです。船舶や大型の重量物の個別生産に向いており、製品は動かずに作業員や工具などが製品の周りを移動します。" },
        { type: "機能別レイアウト", desc: "設備の「機能」を重視して、類似した機能の設備をまとめて配置するレイアウトです。ジョブショップ型と呼ばれることもあります。" },
        { type: "製品別レイアウト", desc: "製品の加工の「流れ」を重視したレイアウトです。製品の加工順序に沿って直線的に設備を配置しており、フローショップ型と呼ばれることもあります。" },
        { type: "グループ別レイアウト", desc: "製品別レイアウトと機能別レイアウトの中間に位置付けられるようなレイアウトです。グループテクノロジーを用いて類似した製品をグループ化して、共通のラインで生産できるようにするレイアウトです。" }
      ],
      details: [
        "ア：× 類似した機能の設備をまとめて配置するのは機能別レイアウトです。製品別レイアウトは、加工順序に沿って設備を配置します。",
        "イ：× 製品別レイアウトは、製品の加工の「流れ」を重視したレイアウトを配置することから「フローショップ型」と呼ばれます。ジョブショップと呼ばれるのは機能別レイアウト方式です。",
        "ウ：○ 固定式レイアウトは、製品を固定するレイアウトで、作業員や工具が製品の周りを移動します。重量物などの製品を個別生産する場合に向いています。",
        "エ：× 機能別レイアウトでは、類似した製品ではなく、類似した設備をまとめて配置します。類似した製品をグループ化するのはグループ別レイアウトとなります。"
      ]
    }
  ],
  {
    id: "Q2",
    title: "問題 2 工場レイアウト 2",
    meta: "中小企業診断士 運営管理",
    question: "工場内の設備レイアウトの特徴に関する記述として、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "固定式レイアウトの生産効率を高めるためには、設備レイアウトを見直すより、作業者や工具の移動のムダを減らすことが重要である。" },
      { key: "イ", text: "グループ別レイアウトでは、製品の生産工程が変わっても設備レイアウトを見直す必要がなく、加工経路を変えるだけで対応ができる。" },
      { key: "ウ", text: "機能別レイアウトでは、作業員はまとまった機能単位に仕事をするため生産に熟練しやすい。" },
      { key: "エ", text: "グループ別レイアウトの生産効率は、製品別レイアウトより下がる傾向にある。" }
    ],
    answer: "イ",
    explanation: {
      summary: "各レイアウトのメリット・デメリットの特徴を正確に理解する必要があります。",
      table: [
        { type: "固定式レイアウト", desc: "【メリット】製品の移動がほとんどないため、大きく重い製品に向いている。設計・工程変更に柔軟。【デメリット】作業者や工具の移動が多くなる。" },
        { type: "機能別レイアウト", desc: "【メリット】製品や生産計画の変更に柔軟に対応しやすい。生産に熟練することができる。【デメリット】加工経路が複雑になり管理が困難。仕掛品が多くなり生産期間が長くなる傾向。" },
        { type: "製品別レイアウト", desc: "【メリット】工程管理が簡単で機械化しやすい。短時間で大量生産可能。【デメリット】製品や加工順序の変更に対応しにくい。一部の機械停止が全体停止に繋がる。単能工になりがち。" },
        { type: "グループ別レイアウト", desc: "【メリット】機能別レイアウトに比べて仕掛品が少なく効率的。多品種少量生産を効率よく生産可能。【デメリット】専用ラインではないので製品別レイアウトよりは効率が下がる。" }
      ],
      details: [
        "ア：○ 固定式レイアウトは、製品を固定するレイアウトで作業員や工具が移動します。このため固定された設備はほとんどなく、移動ロスを減らすことが重要です。",
        "イ：× グループ別レイアウトは類似した製品をグループ化して生産できるように設備レイアウトされています。製品の生産工程が変わった場合は設備レイアウトを見直す必要があります。一方、機能別レイアウトは加工経路を見直すことで対応可能です。",
        "ウ：○ 機能別レイアウトは類似した設備をまとめて配置するため、特定の設備を担当する作業者の熟練度が向上していきます。",
        "エ：○ 製品別レイアウトは専用ラインをつくるため生産性は極めて高くなります。グループ別ラインはそれに比べると生産性は劣ります。"
      ]
    }
  ],
  {
    id: "Q3",
    title: "問題 3 工場レイアウト 3",
    meta: "中小企業診断士 生産管理",
    question: "品種・生産量と工場レイアウトの関係に関する組み合わせとして、最も適切なものはどれか。",
    options: [
      { key: "ア", text: "多品種少量生産 － 製品別レイアウト" },
      { key: "イ", text: "多品種少量生産 － 固定式レイアウト" },
      { key: "ウ", text: "中品種中量生産 － グループ別レイアウト" },
      { key: "エ", text: "少品種多量生産 － 機能別レイアウト" }
    ],
    answer: "ウ",
    explanation: {
      summary: "最適なレイアウトは、製品のタイプや生産形態によっても変わってきます。品種と生産量によって適切な工場レイアウトが分類されます。",
      matrix: [
        { volume: "多 (High)", variety: "少 (Low)", layout: "製品別レイアウト" },
        { volume: "中 (Medium)", variety: "中 (Medium)", layout: "グループ別レイアウト" },
        { volume: "少 (Low)", variety: "多 (High)", layout: "機能別レイアウト" },
        { volume: "少 (Low)", variety: "少 (Low) ※大型個別", layout: "固定式レイアウト" }
      ],
      details: [
        "ア：× 多品種少量生産は品種が多く、1品あたりの生産量が少ないため、製品ごとにラインを設ける製品別レイアウトでは無駄が多く非効率です。機能別レイアウトが適しています。",
        "イ：× 多品種少量生産に適しているのは機能別レイアウトです。固定式レイアウトは、品種・生産量ともに少ない、かつ移動困難な重量大型製品に適しています。",
        "ウ：○ 中品種中量生産は、多品種少量生産と少品種多量生産の中間の位置づけにあたります。グループ別レイアウトによって流れ生産のように効率的に生産することが重要です。",
        "エ：× 少品種多量生産は品種が少なく1品あたりの生産量が多いため、機能別レイアウトよりも、製品ごとにラインを設ける製品別レイアウトによって効率的に生産することができます。"
      ]
    }
  ],
  {
    id: "Q4",
    title: "問題 4 SLPと分析手法",
    meta: "中小企業診断士 SLP基礎",
    question: "工場の設備を実際にレイアウトする場合に用いられるSLPに関する分析として、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "物の流れ分析" },
      { key: "イ", text: "回帰分析" },
      { key: "ウ", text: "アクティビティ相互関係分析" },
      { key: "エ", text: "P-Q分析" }
    ],
    answer: "イ",
    explanation: {
      summary: "SLP（Systematic Layout Planning）とは、工場の実際の設備レイアウトの設計を、システマティックに行う手法の一つです。SLPの手順に含まれる主な分析は以下の通りです。",
      steps: [
        "1. P-Q分析：どのような製品(Product)をどれだけ(Quantity)生産するかを分析する。",
        "2. 物の流れ分析：どのような流れで製品を加工・移動するかを分析する。",
        "3. アクティビティ相互関係分析：各アクティビティ間の近接性の重要度を分析する。",
        "4. アクティビティ相互関係ダイアグラムの作成：流れと相互関係の双方を基に配置を検討する。",
        "5. スペース相互関係ダイアグラムの作成：必要な面積情報を組み込む。"
      ],
      details: [
        "ア、ウ、エはすべてSLPの主要な分析プロセスまたは手順に該当します。",
        "イ：× 回帰分析は統計解析手法の1つであり、主に需要予測などに用いられるものです。SLPの設備レイアウト計画の手順には直接含まれません。"
      ]
    }
  ],
  {
    id: "Q5",
    title: "問題 5 SLP1",
    meta: "中小企業診断士 SLP手順",
    question: "工場の設備を実際にレイアウトする場合、SLPという手法が用いられる。SLPの記述として、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "SLPは、Systematic Layout Planningの略で、工場内のスペースを合理的に計画できる。" },
      { key: "イ", text: "SLPでは、設備や機械、材料、倉庫などの構成要素のことを、アクティビティと呼ぶ。" },
      { key: "ウ", text: "SLPでは、最初に物の流れ分析を行い、どのような流れで製品を加工、移動するかを分析する" },
      { key: "エ", text: "SLPでは、最終的なレイアウト案を、スペース相互関係ダイアグラムをもとに作成する。" }
    ],
    answer: "ウ",
    explanation: {
      summary: "SLP（Systematic Layout Planning）の手順の順序関係を正確に把握できているかを問う問題です。",
      details: [
        "ア：○ SLPはSystematic Layout Planningの略であり、手順化された手法により合理的なスペース計画が可能です。",
        "イ：○ SLPでは、設備、機械、材料、倉庫、休憩室などの構成要素をすべて「アクティビティ」と呼びます。",
        "ウ：× SLPで最初に行うのは「P-Q分析」です。P-Q分析でどのような製品をどれだけ生産するのかを分析・把握したのちに、物の流れ分析やアクティビティ相互関係分析へ進みます。",
        "エ：○ 各アクティビティの面積情報を組み込んだ「スペース相互関係ダイアグラム」を基にして、最終的な複数の具体的なレイアウト案を作成・検討します。"
      ]
    }
  ],
  {
    id: "Q6",
    title: "問題 6 SLP2",
    meta: "中小企業診断士 SLP詳細",
    question: "SLPを用いて設備レイアウトを検討する際に、実施する分析や、作成する図の記述として、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "P-Q分析では、グラフの縦軸に生産量Qをとり、横軸に製品品種Pをとって、生産量が多いものから少ないものに、左から順番に並べる。" },
      { key: "イ", text: "アクティビティ相互関係ダイアグラムには、加工経路の情報に加え、アクティビティの配置に必要な面積の情報も含まれる。" },
      { key: "ウ", text: "アクティビティ相互関係分析をすることで、アクティビティ間の近接性の重要度を一覧で確認することができる。" },
      { key: "エ", text: "アクティビティ相互関係ダイアグラムを作成する際は、線が重ならないようにアクティビティの位置関係を検討する。" }
    ],
    answer: "イ",
    explanation: {
      summary: "SLPの各ステップの成果物（ダイアグラム）の名称と、含まれる情報（特に面積の有無）を関連付けて整理することが大切です。",
      details: [
        "ア：○ P-Q分析では、縦軸に生産量Q、横軸に品種Pをとり、生産量の多い順に左から並べたパレート図のようなグラフを作成します。",
        "イ：× アクティビティ相互関係ダイアグラムに含まれるのは配置関係と近接性の重要度（線の太さや本数）です。これに「面積の情報」を含めたものは「スペース相互関係ダイアグラム」になります。",
        "ウ：○ アクティビティ相互関係分析では、近接性の重要度を（A, E, I, O, U, Xなどの記号で）ランク分けしてマトリクス一覧表で確認できるようにします。",
        "エ：○ ダイアグラム上で線が重なり合うことは、実際の工場内で物理的な物の動きや動線が交差して非効率になることを意味するため、できるだけ線が重ならないように配置を検討します。"
      ]
    }
  ],
  {
    id: "Q7",
    title: "問題 7 製品開発",
    meta: "中小企業診断士 開発設計",
    question: "製品開発に関する記述として、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "製品開発とは、顧客ニーズの変化、生産者の技術向上、地球環境への対応などを動機として、新たな製品を企画し、その製品化を図る活動である。" },
      { key: "イ", text: "製品開発は製品企画から始まる。製品企画において、顧客ターゲットを決定し、その顧客ニーズを満たすような製品の機能や性能を検討する。" },
      { key: "ウ", text: "製品企画を基に製品設計を行う。製品設計では、製品を目標とする品質、生産量、納期で生産するための工程や作業方法、レイアウト、生産設備などを決定する。" },
      { key: "エ", text: "製品設計の後に工程設計を行う。工程設計では、製品の作り方を設計する。" },
      { key: "オ", text: "コンカレント･エンジニアリングは、製品開発の期間を短縮し、市場にタイムリーに新製品を投入することができる。" }
    ],
    answer: "ウ",
    explanation: {
      summary: "製品開発のプロセス（製品企画 → 製品設計 → 工程設計 → 試作 → 生産準備）と各段階の定義についての問題です。",
      steps: [
        "1. 製品企画：顧客のニーズに合った製品を企画し、ターゲットや機能を検討する。",
        "2. 製品設計：構造の決定、図面や部品リスト(BOM)の作成。（機能設計・生産設計）",
        "3. 工程設計：製品を目標とする品質・生産量・納期(QCD)で生産するための工程や方法、レイアウトの設計。製品の「作り方」を設計する。",
        "4. 試作品作成・評価：デザインレビューなどを実施し、作り込みを行う。",
        "5. 生産準備：量産・市場投入に向けた準備。"
      ],
      details: [
        "ア、イ、エ、オ：記述の通り適切です。コンカレント・エンジニアリングはこれらを同時並行で行う手法です。",
        "ウ：× 製品設計の段階では、製品自体の構造の決定や図面化を行います。「目標とする品質、生産量、納期で生産するための工程や作業方法、レイアウト、生産設備などを決定する」のは【工程設計】の説明です。"
      ]
    }
  ],
  {
    id: "Q8",
    title: "問題 8 製品設計",
    meta: "中小企業診断士 設計分類",
    question: "製品設計に関する記述として、最も適切なものはどれか。",
    options: [
      { key: "ア", text: "製品設計には、機能設計と工程設計がある。" },
      { key: "イ", text: "機能設計は、製品の機能の面から見た設計であり、期待する性能を発揮するために必要な機能と構造を決定する活動である。" },
      { key: "ウ", text: "工程設計では、製品の構成を表す組立図、部品の構成を表す部品図、部品の一覧である部品リストなどを作成する。" },
      { key: "エ", text: "生産設計では、部品の数を削減したり、組み立てしやすい構造を検討するが、生産コストを抑えるための検討は行われない。" }
    ],
    answer: "イ",
    explanation: {
      summary: "製品設計（機能設計・生産設計）と工程設計という類似用語の概念整理を問う問題です。",
      details: [
        "ア：× 製品設計は主に「機能設計」と「生産設計」に大別されます。工程設計は製品設計の後に続く独立した設計プロセスであり、製品設計には含まれません。",
        "イ：○ 機能設計の定義として正しい記述です。仕様や期待されるパフォーマンスを満たすための基本構造を決定します。",
        "ウ：× 組立図、部品図、部品リスト(BOM)などを作成するのは【製品設計】（または生産設計）の段階です。工程設計では工程図や作業標準書などが作られます。",
        "エ：× 生産設計では、部品点数の削減や組立容易性(DFM/A)を追求することで、結果として【生産コストを徹底的に抑える】ための検討を極めて重視します。"
      ]
    }
  ],
  {
    id: "Q9",
    title: "問題 9 VE 1",
    meta: "中小企業診断士 価値工学",
    question: "VEの「価値」に関する記述として、最も不適切なものはどれか。",
    options: [
      { key: "ア", text: "VEでは、製品の「機能」と「コスト」を基に、「価値（Value）」を定義する。また、その価値は、「価値 ＝ 機能 ÷ コスト」 という式で表される。" },
      { key: "イ", text: "製品の機能を維持したまま、コストを下げることで、コスト的な価値を向上する方法がある。" },
      { key: "ウ", text: "機能を下げるが、それ以上にコストを下げて、価格に対する機能の相対的な価値を向上する方法がある。" },
      { key: "エ", text: "コストを上げるが、それ以上に機能を上げて、価格に対する機能の相対的な価値を向上する方法がある。" }
    ],
    answer: "ウ",
    explanation: {
      summary: "VE（Value Engineering：価値工学）における価値の定義式 $V = F / C$（Value = Function / Cost）に関する原則問題です。",
      patterns: [
        "① コストダウンによる向上：C↓, F→ (機能を維持しコストを下げる)",
        "② 機能向上による向上：C→, F↑ (コストを維持し機能を上げる)",
        "③ コストを上回る機能向上：C↑, F↑↑ (コストは上がるがそれ以上に機能を上げる)",
        "④ 双方による向上：C↓, F↑ (コストを下げつつ機能も上げる、理想型)"
      ],
      details: [
        "ア、イ、エ：いずれもVEの定義、および価値向上パターンの記述として完全に適切です。",
        "ウ：× VEの原則として、【機能を下げる】という価値向上のアプローチは絶対に存在しません。機能を下げた場合は、そもそも別の製品としてみなすという考え方を採ります。"
      ]
    }
  ],
  {
    id: "Q10",
    title: "問題 10 VE 2",
    meta: "中小企業診断士 機能分類",
    question: "VEの「機能」に関する記述として、最も適切なものはどれか。",
    options: [
      { key: "ア", text: "使用機能とは、製品の本来の価値を果たす機能のことである。" },
      { key: "イ", text: "携帯電話のカラ―バリエーションは、二次機能に該当する。" },
      { key: "ウ", text: "使用機能はさらに、基本機能・二次機能・貴重機能に分けることができる。" },
      { key: "エ", text: "携帯電話の基本機能を上げるために、新製品は従来品より軽くした。" }
    ],
    answer: "ア",
    explanation: {
      summary: "VEにおける「機能の分類」体系（性質による分類：使用機能／貴重機能、重要性による分類：基本機能／二次機能）を理解しているかを問う問題です。",
      details: [
        "ア：○ 使用機能は、製品が本来持つべき実用目的の働きや価値を果たす機能（例: 時計の『時間を刻む』）を指し、記述は適切です。",
        "イ：× カラーバリエーションやデザインなど、顧客の所有欲や魅力を高めるものは【貴重機能（魅力機能）】に分類されます。",
        "ウ：× 機能は性質面で「使用機能」と「貴重機能」に大別されます。そして使用機能が重要性に応じて「基本機能」と「二次機能」に細分化されます。貴重機能は使用機能に内包されません。",
        "エ：× 携帯電話の基本機能は『音声を送受信する』『文字を表示する』などであり、取り除くと存在価値がなくなるものです。製品を『軽くする（携帯性を高める）』ことは、基本機能を補助するための【二次機能】の向上に該当します。"
      ]
    }
  ]
];

// ==========================================
// FIREBASE APP INITIALIZATION
// ==========================================
let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("Firebase App & Firestore successfully initialized");
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function App() {
  // Authentication & Sync State
  const [userId, setUserId] = useState(() => localStorage.getItem("quiz_user_id") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // App Navigation State
  const [viewMode, setViewMode] = useState("start"); // "start", "quiz", "history"
  
  // Learning Data Tracking State (Synced with Firestore)
  const [history, setHistory] = useState({}); // { [quizId]: { correct: boolean, timestamp: string } }
  const [reviews, setReviews] = useState({}); // { [quizId]: boolean }
  
  // Active Quiz Progress State
  const [currentMode, setCurrentMode] = useState("all"); // "all", "wrong", "review"
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Resume Progress Intermediary State
  const [pendingProgress, setPendingProgress] = useState(null);

  // Initialize Anonymous Session upon entering Valid User ID
  const handleConnect = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;

    setLoading(true);
    console.log(`Starting authentication and data fetch for user: ${userId}`);
    try {
      // Execute Anonymous Login required by system constraints
      const auth = getAuth();
      await signInAnonymously(auth);
      console.log("Firebase Anonymous Authentication Succeeded");

      localStorage.setItem("quiz_user_id", userId);
      await fetchUserData(userId);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Authentication or Synchronisation failed:", error);
      alert("接続に失敗しました。環境変数またはネットワーク状況を確認してください。");
    } finally {
      setLoading(false);
    }
  };

  // Pull History, Review states, and Progress Index markers from cloud
  const fetchUserData = async (uid) => {
    if (!db) return;
    try {
      const docRef = doc(db, APP_ID, uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Cloud data retrieved accurately:", data);
        setHistory(data.history || {});
        setReviews(data.reviews || {});
        
        if (typeof data.progressIndex === "number" && data.progressMode) {
          console.log(`Interrupted session detected: Mode=${data.progressMode}, Index=${data.progressIndex}`);
          setPendingProgress({
            index: data.progressIndex,
            mode: data.progressMode
          });
        } else {
          setPendingProgress(null);
        }
      } else {
        console.log("No existing user cloud record found. Registering clean initialization state.");
        setHistory({});
        setReviews({});
        setPendingProgress(null);
      }
    } catch (err) {
      console.error("Error reading data sequence from Firestore:", err);
    }
  };

  // Push state chunks to cloud securely with Try-Catch wrappers
  const saveUserData = async (updatedHistory, updatedReviews, indexOverride = null, modeOverride = null) => {
    if (!db || !userId) return;
    
    // Fallback alignment schema safely resolving current state trees
    const nextIndex = indexOverride !== null ? indexOverride : currentIndex;
    const nextMode = modeOverride !== null ? modeOverride : currentMode;

    try {
      const docRef = doc(db, APP_ID, userId);
      const payload = {
        history: updatedHistory || history,
        reviews: updatedReviews || reviews,
        progressIndex: nextIndex,
        progressMode: nextMode,
        lastUpdated: new Date().toISOString()
      };
      
      await setDoc(docRef, payload, { merge: true });
      console.log("State segment securely synced to Firestore:", payload);
    } catch (err) {
      console.error("Failed writing state log chunk to Cloud database:", err);
    }
  };

  // Setup problem collections aligning back into operational workflows
  const buildQuizSession = (mode, resumeIndex = 0) => {
    console.log(`Constructing session array container under constraints: Mode=${mode}`);
    let list = [...QUIZ_DATA];

    if (mode === "wrong") {
      list = QUIZ_DATA.filter(q => history[q.id]?.correct === false);
    } else if (mode === "review") {
      list = QUIZ_DATA.filter(q => reviews[q.id] === true);
    }

    if (list.length === 0) {
      alert("該当する問題がありません。すべての問題モードを開始します。");
      list = [...QUIZ_DATA];
      mode = "all";
    }

    setFilteredQuizzes(list);
    setCurrentMode(mode);
    setCurrentIndex(resumeIndex < list.length ? resumeIndex : 0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setViewMode("quiz");
    setPendingProgress(null);
  };

  // Handle choice submission
  const handleAnswerSelection = (optionKey) => {
    if (isAnswered) return;
    
    setSelectedAnswer(optionKey);
    setIsAnswered(true);

    const currentQuiz = filteredQuizzes[currentIndex];
    const isCorrect = optionKey === currentQuiz.answer;

    const nextHistory = {
      ...history,
      [currentQuiz.id]: {
        correct: isCorrect,
        timestamp: new Date().toISOString()
      }
    };
    setHistory(nextHistory);

    // Calculate next transactional index markers dynamically
    const nextIndex = currentIndex + 1;
    const isCompleted = nextIndex >= filteredQuizzes.length;
    const targetSaveIndex = isCompleted ? 0 : nextIndex;

    saveUserData(nextHistory, reviews, targetSaveIndex, currentMode);
  };

  // Toggle Review Status Checkbox
  const handleToggleReview = (quizId) => {
    const nextReviews = {
      ...reviews,
      [quizId]: !reviews[quizId]
    };
    setReviews(nextReviews);
    saveUserData(history, nextReviews);
  };

  // Advance Index safely
  const handleNextQuiz = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < filteredQuizzes.length) {
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setIsAnswered(false);
      // Continuous syncing iteration point maintaining seamless multi-client parity
      saveUserData(history, reviews, nextIndex, currentMode);
    } else {
      // Completed full track loop cleanly
      console.log("Entire track criteria loop exhausted. Returning to base overview hub.");
      alert("すべての問題の回答が完了しました！");
      saveUserData(history, reviews, 0, currentMode);
      setViewMode("start");
    }
  };

  // Terminate sequence gracefully, capturing index coordinates precisely
  const handleAbortToHome = () => {
    console.log(`User initiated safe abort routing sequence. Index checkpoint locked at: ${currentIndex}`);
    saveUserData(history, reviews, currentIndex, currentMode);
    setViewMode("start");
  };

  // Calculate high-fidelity metrics tracking variables for charting engines
  const computeMetricsData = () => {
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;

    QUIZ_DATA.forEach(q => {
      const record = history[q.id];
      if (!record) unattemptedCount++;
      else if (record.correct) correctCount++;
      else wrongCount++;
    });

    return [
      { name: "正解", 数: correctCount, fill: "#10B981" },
      { name: "不正解", 数: wrongCount, fill: "#EF4444" },
      { name: "未解答", 数: unattemptedCount, fill: "#9CA3AF" }
    ];
  };

  // Disconnect active target instance identities safely 
  const handleLogout = () => {
    if (confirm("ログアウトしますか？（合言葉はブラウザに保持されます）")) {
      setIsAuthenticated(false);
      setPendingProgress(null);
      console.log("User disconnected safely.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-4">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">データを同期中</h2>
          <p className="text-sm text-slate-500">クラウド環境から安全に学習データを読み込んでいます。少々お待ちください。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* HEADER BAR */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => isAuthenticated && handleAbortToHome()}>
            <BookOpen className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-lg tracking-tight">スマート問題集：3-2 工場計画と開発設計</span>
          </div>
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-slate-400">同期中の合言葉</p>
                <p className="text-sm font-semibold text-blue-300">🔑 {userId}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition"
              >
                切断
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* GATEWAY GATE OVERLAY: USER ID SYNC INTERFACE */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 transition-all">
            <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center">
              <div className="inline-flex p-3 bg-blue-500/10 rounded-full mb-3 text-blue-400">
                <RefreshCw className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold">マルチデバイス同期システム</h2>
              <p className="text-sm text-slate-300 mt-2">
                任意の「合言葉（ユーザーID）」を入力してください。PCやスマホ間でリアルタイムに学習履歴が同期されます。
              </p>
            </div>
            <form onSubmit={handleConnect} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">共通の合言葉を入力</label>
                <input
                  type="text"
                  required
                  placeholder="例: osaka-dx-consultant-2026"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-base"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center space-x-2"
              >
                <span>同期して学習を開始</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* VIEW MODE 1: BASE START HUB */}
            {viewMode === "start" && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* PREVIOUS RUN ATTEMPT RESUME INVITATION BANNER */}
                {pendingProgress && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-blue-900">前回の学習中断データを発見しました</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          モード: <span className="font-semibold">{pendingProgress.mode === "all" ? "すべての問題" : pendingProgress.mode === "wrong" ? "前回不正解の問題のみ" : "要復習の問題のみ"}</span> 
                          (問題インデックス: {pendingProgress.index + 1}問目)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 w-full md:w-auto shrink-0">
                      <button
                        onClick={() => {
                          console.log("Resuming structured operational trace.");
                          buildQuizSession(pendingProgress.mode, pendingProgress.index);
                        }}
                        className="flex-1 md:flex-initial bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition shadow-md shadow-blue-600/10"
                      >
                        続きから再開する
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm("前回の進捗ポインタをクリアして、最初から開始しますか？")) {
                            setPendingProgress(null);
                            if (db && userId) {
                              await setDoc(doc(db, APP_ID, userId), { progressIndex: 0, progressMode: "all" }, { merge: true });
                              console.log("Progress session counter reset to absolute base.");
                            }
                          }
                        }}
                        className="flex-1 md:flex-initial bg-white hover:bg-slate-100 text-slate-600 font-medium text-sm px-4 py-2.5 border border-slate-300 rounded-xl transition"
                      >
                        最初から始める
                      </button>
                    </div>
                  </div>
                )}

                {/* MODAL CONFIG SELECTORS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* MODE ALL */}
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition">
                    <div>
                      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">すべての問題</h3>
                      <p className="text-sm text-slate-500 mt-2">
                        本モジュールに含まれる全10問のコアセット問題集を網羅的に学習します。
                      </p>
                    </div>
                    <button
                      onClick={() => buildQuizSession("all", 0)}
                      className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl transition text-sm"
                    >
                      開始する ({QUIZ_DATA.length}問)
                    </button>
                  </div>

                  {/* MODE WRONG ONLY */}
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition">
                    <div>
                      <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 mb-4">
                        <X className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">前回不正解の問題のみ</h3>
                      <p className="text-sm text-slate-500 mt-2">
                        過去に誤った選択肢を選んでしまったウィークポイント問題だけを効率よく再試行します。
                      </p>
                    </div>
                    <button
                      onClick={() => buildQuizSession("wrong", 0)}
                      className="w-full mt-6 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl transition text-sm"
                    >
                      開始する ({QUIZ_DATA.filter(q => history[q.id]?.correct === false).length}問)
                    </button>
                  </div>

                  {/* MODE REVIEW FLAGGED ONLY */}
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition">
                    <div>
                      <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4">
                        <Star className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">要復習の問題のみ</h3>
                      <p className="text-sm text-slate-500 mt-2">
                        解説画面でご自身が「要復習項目」としてチェックマークを入れた特定の問題群を復習します。
                      </p>
                    </div>
                    <button
                      onClick={() => buildQuizSession("review", 0)}
                      className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl transition text-sm"
                    >
                      開始する ({QUIZ_DATA.filter(q => reviews[q.id] === true).length}問)
                    </button>
                  </div>
                </div>

                {/* BOTTOM METRICS AND HISTORY COMPONENT ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {/* STATISTICAL REPORT CHART CARD */}
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <BarChart2 className="w-5 h-5 text-slate-600" />
                        <h3 className="font-bold text-slate-800 text-base">総合学習進捗分析</h3>
                      </div>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={computeMetricsData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="数" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
                      複数端末間での同期データに基づき最新グラフを出力
                    </div>
                  </div>

                  {/* QUICK HISTORICAL DRILLDOWN MANIFEST */}
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <Bookmark className="w-5 h-5 text-slate-600" />
                        <h3 className="font-bold text-slate-800 text-base">収録問題一覧・現在のステータス</h3>
                      </div>
                      <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                        {QUIZ_DATA.map((q, idx) => {
                          const status = history[q.id];
                          const isStarred = reviews[q.id];
                          return (
                            <div key={q.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-sm border border-slate-50 transition">
                              <div className="flex items-center space-x-2 truncate">
                                <span className="font-mono text-xs text-slate-400">[{idx+1}]</span>
                                <span className="font-medium text-slate-700 truncate">{q.title}</span>
                              </div>
                              <div className="flex items-center space-x-2 shrink-0">
                                {isStarred && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                                {status ? (
                                  status.correct ? (
                                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded flex items-center space-x-0.5"><Check className="w-3 h-3" /><span>正解</span></span>
                                  ) : (
                                    <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2 py-0.5 rounded flex items-center space-x-0.5"><X className="w-3 h-3" /><span>不正解</span></span>
                                  )
                                ) : (
                                  <span className="bg-slate-100 text-slate-500 text-xs font-medium px-2 py-0.5 rounded">未着手</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
                      全問完全収録・解説付き
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* VIEW MODE 2: ACTIVE RUN QUESTION MODULE */}
            {viewMode === "quiz" && filteredQuizzes.length > 0 && (
              <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
                {/* STATUS STEP HEADER MODULE */}
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-center space-x-2 text-sm text-slate-500 font-medium">
                    <span>モード:</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-xs">
                      {currentMode === "all" ? "すべての問題" : currentMode === "wrong" ? "前回不正解のみ" : "要復習のみ"}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>進捗:</span>
                    <span className="text-slate-800 font-bold">{currentIndex + 1} / {filteredQuizzes.length} 問</span>
                  </div>
                  <button
                    onClick={handleAbortToHome}
                    className="flex items-center space-x-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
                  >
                    <Home className="w-4 h-4" />
                    <span>中断して戻る</span>
                  </button>
                </div>

                {/* CENTRAL CORE PROBLEM CONTAINER */}
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                  {/* INTERNAL META WRAPPER */}
                  <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      {filteredQuizzes[currentIndex].meta}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ID: {filteredQuizzes[currentIndex].id}
                    </span>
                  </div>

                  {/* ACTIVE TEXT ZONE */}
                  <div className="p-6 md:p-8 space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 leading-relaxed">
                      <span className="text-blue-600 font-mono mr-2">{filteredQuizzes[currentIndex].title}</span>
                      <br className="block md:hidden" />
                      {filteredQuizzes[currentIndex].question}
                    </h2>

                    {/* CHOICE MAP MATRIX */}
                    <div className="space-y-3 pt-2">
                      {filteredQuizzes[currentIndex].options?.map((opt) => {
                        const isSelected = selectedAnswer === opt.key;
                        const isCorrectAnswer = opt.key === filteredQuizzes[currentIndex].answer;
                        
                        let optStyle = "border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700";
                        if (isAnswered) {
                          if (isCorrectAnswer) {
                            optStyle = "bg-emerald-50 border-emerald-400 text-emerald-900 font-medium";
                          } else if (isSelected) {
                            optStyle = "bg-rose-50 border-rose-400 text-rose-900";
                          } else {
                            optStyle = "border-slate-100 text-slate-400 opacity-60";
                          }
                        } else if (isSelected) {
                          optStyle = "bg-blue-50 border-blue-400 text-blue-900";
                        }

                        return (
                          <button
                            key={opt.key}
                            disabled={isAnswered}
                            onClick={() => handleAnswerSelection(opt.key)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition flex items-start space-x-3 text-base ${optStyle}`}
                          >
                            <span className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold font-mono mt-0.5 transition ${
                              isAnswered && isCorrectAnswer ? "bg-emerald-500 text-white" :
                              isAnswered && isSelected ? "bg-rose-500 text-white" :
                              isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                            }`}>
                              {opt.key}
                            </span>
                            <span className="leading-relaxed flex-1">{opt.text}</span>
                            {isAnswered && isCorrectAnswer && <Check className="w-5 h-5 text-emerald-600 shrink-0 self-center" />}
                            {isAnswered && isSelected && !isCorrectAnswer && <X className="w-5 h-5 text-rose-600 shrink-0 self-center" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* POST RESPONSE SECTION (FEEDBACK EXPLANATION SHEET) */}
                {isAnswered && (
                  <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden animate-slideUp p-6 md:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${selectedAnswer === filteredQuizzes[currentIndex].answer ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                          {selectedAnswer === filteredQuizzes[currentIndex].answer ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">
                            {selectedAnswer === filteredQuizzes[currentIndex].answer ? "正解です！" : "不正解です"}
                          </h3>
                          <p className="text-sm text-slate-500">正しい解答選択肢: <span className="font-mono font-bold text-emerald-600 text-base">{filteredQuizzes[currentIndex].answer}</span></p>
                        </div>
                      </div>

                      {/* VOLATILE CHECKBOX ACTION SET */}
                      <label className="inline-flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl cursor-pointer transition select-none self-start sm:self-auto">
                        <input
                          type="checkbox"
                          checked={!!reviews[filteredQuizzes[currentIndex].id]}
                          onChange={() => handleToggleReview(filteredQuizzes[currentIndex].id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <span className="text-sm font-bold text-slate-700 flex items-center space-x-1">
                          <Star className={`w-4 h-4 ${reviews[filteredQuizzes[currentIndex].id] ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
                          <span>この問題を要復習に設定</span>
                        </span>
                      </label>
                    </div>

                    {/* TEXT COMPILATION INLINE EXPLANATION MODULES */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 text-base flex items-center space-x-1">
                        <span className="w-1 h-4 bg-blue-600 rounded-full inline-block mr-1"></span>
                        <span>解説講義・着眼点</span>
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {filteredQuizzes[currentIndex].explanation.summary}
                      </p>

                      {/* INLINE MATRIX HTML DRAWINGS SCHEMAS SIMULATING MISSING ATTACHED IMAGE SPECIFICATIONS */}
                      {filteredQuizzes[currentIndex].explanation.table && (
                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                          <table className="w-full text-left border-collapse text-sm">
                            <thead>
                              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                                <th className="p-3 w-1/4 whitespace-nowrap">分類</th>
                                <th className="p-3">特徴とコア定義</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600">
                              {filteredQuizzes[currentIndex].explanation.table.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-50/50">
                                  <td className="p-3 font-bold text-slate-800 whitespace-nowrap bg-slate-50/30">{row.type}</td>
                                  <td className="p-3 leading-relaxed">{row.desc}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* SPECIAL DIAGRAM FOR QUESTION 3 LAYOUT SELECTION RULES */}
                      {filteredQuizzes[currentIndex].explanation.matrix && (
                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                          <table className="w-full text-left border-collapse text-sm">
                            <thead>
                              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                                <th className="p-3">生産量</th>
                                <th className="p-3">品種量</th>
                                <th className="p-3 bg-blue-50/50 text-blue-900">最適工場レイアウト</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600">
                              {filteredQuizzes[currentIndex].explanation.matrix.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-50/50">
                                  <td className="p-3 font-medium">{row.volume}</td>
                                  <td className="p-3 font-medium">{row.variety}</td>
                                  <td className="p-3 font-bold text-blue-700 bg-blue-50/20">{row.layout}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* SPECIAL GRAPHICAL STEPS DISPLAY FOR QUESTION 4/5 SLP MATRIX SEQUENCE */}
                      {filteredQuizzes[currentIndex].explanation.steps && (
                        <div className="bg-slate-900 text-slate-100 p-5 rounded-xl space-y-2 font-mono text-xs shadow-inner">
                          <div className="text-blue-400 font-bold border-b border-slate-800 pb-1.5 mb-2">▼ SLP (Systematic Layout Planning) 標準分析順序フロー</div>
                          {filteredQuizzes[currentIndex].explanation.steps.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-center space-x-2">
                              <span className="text-amber-400 font-bold">➔</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* OPTIONS EXPLANATORY BULLET GRID */}
                      <div className="space-y-2 pt-2">
                        <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">各肢の検討理由</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {filteredQuizzes[currentIndex].explanation.details.map((detail, dIdx) => (
                            <div key={dIdx} className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                              {detail}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* FORWARD CONTROLLER ACTION SECTION */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={handleNextQuiz}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md shadow-blue-600/20 flex items-center space-x-2 text-base"
                      >
                        <span>
                          {currentIndex + 1 < filteredQuizzes.length ? "次の問題へ" : "全解答セッションを完了"}
                        </span>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
      <footer className="max-w-5xl mx-auto text-center py-12 text-xs text-slate-400 border-t border-slate-200 mt-12 px-4">
        &copy; 2026 Small & Medium Enterprise Management Consultant Study Assistant — Powered by React, Firestore Architecture.
      </footer>
    </div>
  );
}