// npm install lucide-react recharts firebase
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Check, X, Home, BookOpen, RefreshCw, BarChart2, ChevronRight, User, AlertCircle, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// --- 定数定義 ---
const APP_ID = "QuizApp_001";

// --- Firebase 設定 ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// --- Firebase 初期化 ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- 問題データ定義 ---
const QUIZ_DATA = [
  {
    id: 1,
    title: "問題 1 工場レイアウト 1",
    meta: "スマート問題集：3-2 工場計画と開発設計",
    question: "工場内の設備レイアウトに関する記述として、最も適切なものはどれか。",
    options: [
      { id: "ア", text: "製品別レイアウトを採用するため、複数あるNC旋盤、研磨機、塗装機をそれぞれ機械毎にまとめて配置した。" },
      { id: "イ", text: "製品別レイアウトは、製品の加工の「流れ」を重視したレイアウトで、ジョブショップ型と呼ばれることもある。" },
      { id: "ウ", text: "固定式レイアウトでは、製品の移動がほとんどなく、作業員や工具が製品の周りを移動する。" },
      { id: "エ", text: "機能別レイアウトでは、機能の類似した製品をグループ化して共通のラインで生産する。" }
    ],
    answer: "ウ",
    explanation: {
      summary: "本問では工場レイアウトの種類とその内容が問われています。工場の中の設備の配置のことを工場レイアウトと呼びます。これを最適化することで、工場内の運搬を効率化したり、作業を効率化することができます。",
      typesTable: true,
      details: [
        { label: "ア ×", text: "類似した機能の設備をまとめて配置するのは、機能別レイアウトです。製品別レイアウトは、加工順序に沿って設備を配置します。よって記述は不適切です。" },
        { label: "イ ×", text: "製品別レイアウトは、製品の 加工の「流れ」を重視 したレイアウトを配置することから、「 フローショップ型 」と呼ばれます。 ジョブショップ と呼ばれるのは、 類似の設備すなわち加工（仕事）をまとめて配置 する機能別レイアウト方式です。よって記述は不適切です。" },
        { label: "ウ ○", text: "固定式レイアウトは、製品を固定するレイアウトで、作業員や工具が製品の周りを移動します。重量物などの製品を個別生産する場合に向いています。よって記述は適切です。" },
        { label: "エ ×", text: "機能別レイアウトでは、類似した製品をグループ化するのではなく、類似した設備をまとめて配置します。類似した製品をグループ化するのは、グループ別レイアウトとなります。よって記述は不適切です。" }
      ]
    }
  ],
  {
    id: 2,
    title: "問題 2 工場レイアウト 2",
    meta: "スマート問題集：3-2 工場計画と開発設計",
    question: "工場内の設備レイアウトの特徴に関する記述として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "固定式レイアウトの生産効率を高めるためには、設備レイアウトを見直すより、作業者や工具の移動のムダを減らすことが重要である。" },
      { id: "イ", text: "グループ別レイアウトでは、製品の生産工程が変わっても設備レイアウトを見直す必要がなく、加工経路を変えるだけで対応ができる。" },
      { id: "ウ", text: "機能別レイアウトでは、作業員はまとまった機能単位に仕事をするため生産に熟練しやすい。" },
      { id: "エ", text: "グループ別レイアウトの生産効率は、製品別レイアウトより下がる傾向にある。" }
    ],
    answer: "イ",
    explanation: {
      summary: "本問では工場内の設備レイアウトの特徴が問われています。各レイアウトの特徴を掴み、なぜそうなるかを理解しましょう。",
      featuresTable: true,
      details: [
        { label: "ア ○", text: "固定式レイアウトは、製品を固定するレイアウトで作業員や工具が製品の周りを移動します。このため固定された設備はほとんどありません。生産効率を高めるためには、作業員や工具の移動ロスを減らすことが重要となります。よって記述は適切です。" },
        { label: "イ ×", text: "グループ別レイアウトは、類似した製品をグループ化して生産できるように設備レイアウトされています。製品の生産工程が変わった場合は設備レイアウトを見直す必要があります。一方、機能別レイアウトは、類似した設備をまとめて配置してあるので、加工経路を見直すことで対応ができます。よって記述は不適切です。" },
        { label: "ウ ○", text: "機能別レイアウトは、類似した設備をまとめて配置します。各作業者は特定の設備を担当しますが、設備が同じでも、生産する製品が異なれば加工方法や操作方法も変わります。この結果、担当する設備の熟練度が向上していきます。よって記述は適切です。" },
        { label: "エ ○", text: "製品別レイアウトは、生産する製品に合わせて専用のラインをつくるため、生産性は極めて高くなります。一方、グループ別ラインは、類似性のある製品をグループ別にまとめることで効率的な生産を目指しますが、製品別レイアウトと比べると生産性は劣ります。よって記述は適切です。" }
      ]
    }
  ],
  {
    id: 3,
    title: "問題 3 工場レイアウト 3",
    meta: "スマート問題集：3-2 工場計画と開発設計",
    question: "品種・生産量と工場レイアウトの関係に関する組み合わせとして、最も適切なものはどれか。",
    options: [
      { id: "ア", text: "多品種少量生産 － 製品別レイアウト" },
      { id: "イ", text: "多品種少量生産 － 固定式レイアウト" },
      { id: "ウ", text: "中品種中量生産 － グループ別レイアウト" },
      { id: "エ", text: "少品種多量生産 － 機能別レイアウト" }
    ],
    answer: "ウ",
    explanation: {
      summary: "本問では品種・生産量と工場レイアウトの関係が問われています。最適なレイアウトは、製品のタイプや生産形態によっても変わってきます。品種と生産量によって、適切な工場レイアウトを特徴を踏まえて理解しておきましょう。",
      matrixTable: true,
      details: [
        { label: "ア ×", text: "多品種少量生産は品種が多く、1品あたりの生産量が少ないため、製品ごとにラインを設ける製品別レイアウトでは無駄が多く非効率です。機能ごとにまとめた機能別レイアウトが適しています。よって、不適切な組み合わせです。" },
        { label: "イ ×", text: "多品種少量生産に適しているのは機能別レイアウトです。固定式レイアウトは、製品を固定した場所で作業を行う方式です。品種・生産量ともに少ない製品に適しています。よって、不適切な組み合わせです。" },
        { label: "ウ ○", text: "中品種中量生産は、多品種少量生産と少品種多量生産の中間の位置づけにあたります。品種の数が複数あり、生産量もある程度多いため、グループ別レイアウトによって流れ生産のように効率的に生産することが重要です。よって、適切な組み合わせです。" },
        { label: "エ ×", text: "少品種多量生産は品種が少なく、1品あたりの生産量が多いため、機能ごとにまとめた機能別レイアウトよりも、製品ごとにラインを設ける製品別レイアウトによって効率的に生産することができます。よって、不適切な組み合わせです。" }
      ]
    }
  ],
  {
    id: 4,
    title: "問題 4 SLPと分析手法",
    meta: "スマート問題集：3-2 工場計画と開発設計",
    question: "工場の設備を実際にレイアウトする場合に用いられるSLPに関する分析として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "物の流れ分析" },
      { id: "イ", text: "回帰分析" },
      { id: "ウ", text: "アクティビティ相互関係分析" },
      { id: "エ", text: "P-Q分析" }
    ],
    answer: "イ",
    explanation: {
      summary: "本問ではSLPで行う分析手法について問われています。SLP（Systematic Layout Planning）とは、工場の実際の設備レイアウトの設計を、システマティックに行う手法の一つです。",
      slpTable: true,
      details: [
        { label: "正解：イ", text: "SLPでは、P-Q 分析、物の流れ分析、アクティビティ相互関係分析が用いられます。回帰分析は、統計解析手法の１つであり、需要予測に用いられるものです。よって、選択肢イが不適切であり、これが正解です。" }
      ]
    }
  ],
  {
    id: 5,
    title: "問題 5 SLP1",
    meta: "スマート問題集：3-2 工場計画と開発設計",
    question: "工場の設備を実際にレイアウトする場合、SLPという手法が用いられる。SLPの記述として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "SLPは、Systematic Layout Planningの略で、工場内のスペースを合理的に計画できる。" },
      { id: "イ", text: "SLPでは、設備や機械、材料、倉庫などの構成要素のことを、アクティビティと呼ぶ。" },
      { id: "ウ", text: "SLPでは、最初に物の流れ分析を行い、どのような流れで製品を加工、移動するかを分析する" },
      { id: "エ", text: "SLPでは、最終的なレイアウト案を、スペース相互関係ダイアグラムをもとに作成する。" }
    ],
    answer: "ウ",
    explanation: {
      summary: "本問ではSLPの内容と、その手順が問われています。SLPでは、設備や機械、材料、倉庫などの構成要素を、アクティビティと呼び、これらの流れや、アクティビティ間の関連性を分析することで、最適なレイアウトを計画していきます。",
      slpFlow: true,
      details: [
        { label: "ア ○", text: "SLPは（Systematic Layout Planning）の略です。この手法はどのような場合でも、同じ手順で工場内のスペースを合理的にレイアウトできます。よって記述は適切です。" },
        { label: "イ ○", text: "SLPでは、工場内の設備や機械、材料、倉庫などの構成要素のことを、アクティビティと呼びます。よって記述は適切です。" },
        { label: "ウ ×", text: "SLPで最初に行うのは、P-Q分析です。P-Q分析で、どのような製品（Product）をどれだけ生産するのか（Quantity）分析してから、流れ分析を行います。よって記述は不適切です。" },
        { label: "エ ○", text: "SLPでは、最後に各アクティビティに必要な面積の情報を、アクティビティ相互関係ダイアグラムに組込み、スペース相互関係ダイアグラムを作成します。これを基に、実際のレイアウト案を幾つか作成します。よって記述は適切です。" }
      ]
    }
  ],
  {
    id: 6,
    title: "問題 6 SLP2",
    meta: "スマート問題集：3-2 工場計画と開発設計",
    question: "SLPを用いて設備レイアウトを検討する際に、実施する分析や、作成する図の記述として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "P-Q分析では、グラフの縦軸に生産量Qをとり、横軸に製品品種Pをとって、生産量が多いものから少ないものに、左から順番に並べる。" },
      { id: "イ", text: "アクティビティ相互関係ダイアグラムには、加工経路の情報に加え、アクティビティの配置に必要な面積の情報も含まれる。" },
      { id: "ウ", text: "アクティビティ相互関係分析をすることで、アクティビティ間の近接性の重要度を一覧で確認することができる。" },
      { id: "エ", text: "アクティビティ相互関係ダイアグラムを作成する際は、線が重ならないようにアクティビティの位置関係を検討する。" }
    ],
    answer: "イ",
    explanation: {
      summary: "本問ではSLPで行う分析手法の具体的な内容が問われています。名称に含まれるキーワード（ダイアグラム＝図、スペース＝面積など）と中身を関連付けて整理しましょう。",
      slpDetailsTable: true,
      details: [
        { label: "ア ○", text: "P-Q分析では、選択肢の記述にあるグラフを作り、どのような製品をどれだけ生産するかを分析します。よって記述は適切です。" },
        { label: "イ ×", text: "アクティビティ相互関係ダイアグラムに含まれるのは、アクティビティ間の配置関係と、近接性の重要度を線の太さや本数で表した情報です。これに、面積の情報を含めたものは、スペース相互関係ダイアグラムになります。よって記述は不適切です。" },
        { label: "ウ ○", text: "アクティビティ相互関係分析では、アクティビティを全てリストアップし、各アクティビティ間の近接性の重要度をランク分けして、一覧で確認できるようにします。よって記述は適切です。" },
        { label: "エ ○", text: "アクティビティ相互関係ダイアグラムでは、アクティビティ間の近接性の重要度を、線の太さや線の本数で表します。この線が重なり合うと、物の動きが重なってしまうため、できるだけ線が重ならないように各アクティビティの配置を検討します。よって記述は適切です。" }
      ]
    }
  ],
  {
    id: 7,
    title: "問題 7 製品開発",
    meta: "スマート問題集：3-2 工場計画と開発設計",
    question: "製品開発に関する記述として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "製品開発とは、顧客ニーズの変化、生産者の技術向上、地球環境への対応などを動機として、新たな製品を企画し、その製品化を図る活動である。" },
      { id: "イ", text: "製品開発は製品企画から始まる。製品企画において、顧客ターゲットを決定し、その顧客ニーズを満たすような製品の機能や性能を検討する。" },
      { id: "ウ", text: "製品企画を基に製品設計を行う。製品設計では、製品を目標とする品質、生産量、納期で生産するための工程や作業方法、レイアウト、生産設備などを決定する。" },
      { id: "エ", text: "製品設計の後に工程設計を行う。工程設計では、製品の作り方を設計する。" },
      { id: "オ", text: "コンカレント･エンジニアリングは、製品開発の期間を短縮し、市場にタイムリーに新製品を投入することができる。" }
    ],
    answer: "ウ",
    explanation: {
      summary: "製品開発の活動目的は、『顧客のニーズを満たす製品を、最適なQCDのバランスで迅速に開発し、製造できるようにする』ことです。業務内容及び、製品設計における機能設計/生産設計の違いを理解しましょう。",
      devFlowTable: true,
      details: [
        { label: "ア ○", text: "製品開発は、顧客のニーズ変化、生産者の技術向上、地球環境への対応などを動機として新たな製品を企画し、その製品化を図る活動です。よって記述は適切です。" },
        { label: "イ ○", text: "製品開発は製品企画からスタートします。製品企画の段階において、まず顧客ターゲットを決定し、その顧客のニーズを満たすような製品の機能や性能を検討します。よって記述は適切です。" },
        { label: "ウ ×", text: "製品設計は製品企画を基に行われます。製品設計の段階では、製品の構造を決定し、製品を図面の上で具体化していきます。製品の作り方の設計ではなく、製品自体の設計を行う段階です。よって記述は不適切です。目標とする品質、生産量、納期で生産するための工程などを決定するのは、工程設計の説明です。" },
        { label: "エ ○", text: "工程設計は製品設計の後に行います。製品を、目標とする品質・生産量・納期で生産するための工程や作業方法、レイアウト、生産設備などを決定する段階です。工程設計は製品の作り方を設計します。よって記述は適切です。" },
        { label: "オ ○", text: "コンカレント･エンジニアリングとは、設計、生産などの製品開発作業を同時並行的に行う手法です。製品開発の期間を短縮し、市場にタイムリーに新製品を投入することが可能となります。よって記述は適切です。" }
      ]
    }
  ],
  {
    id: 8,
    title: "問題 8 製品設計",
    meta: "スマート問題集：3-2 工場計画と開発設計",
    question: "製品設計に関する記述として、最も適切なものはどれか。",
    options: [
      { id: "ア", text: "製品設計には、機能設計と工程設計がある。" },
      { id: "イ", text: "機能設計は、製品の機能の面から見た設計であり、期待する性能を発揮するために必要な機能と構造を決定する活動である。" },
      { id: "ウ", text: "工程設計では、製品の構成を表す組立図、部品の構成を表す部品図、部品の一覧である部品リストなどを作成する。" },
      { id: "エ", text: "生産設計では、部品の数を削減したり、組み立てしやすい構造を検討するが、生産コストを抑えるための検討は行われない。" }
    ],
    answer: "イ",
    explanation: {
      summary: "本問では製品設計の内容について問われています。製品設計の２つの種類（機能設計・生産設計）と、工程設計との違いを整理しておく必要があります。",
      designDiffTable: true,
      details: [
        { label: "ア ×", text: "製品設計は、機能設計と生産設計に大別できます。製品設計に工程設計は含まれません。よって記述は不適切です。" },
        { label: "イ ○", text: "機能設計は、製品の機能の面から見た設計です。期待する性能を発揮するために必要な機能と構造を決定する活動です。よって記述は適切です。" },
        { label: "ウ ×", text: "工程設計では、製品を目標とする品質、生産量、納期で生産するための工程や作業方法、レイアウト、生産設備などを決定します。記述の内容は、製品設計（図面や部品リスト作成）の説明です。よって記述は不適切です。" },
        { label: "エ ×", text: "生産設計では、製品を生産しやすい構造や部品構成にすることで、生産コストをできるだけ抑えるようにします。よって記述は不適切です。" }
      ]
    }
  ],
  {
    id: 9,
    title: "問題 9 VE 1",
    meta: "スマート問題集：3-2 工場計画と開発設計",
    question: "VEの「価値」に関する記述として、最も不適切なものはどれか。",
    options: [
      { id: "ア", text: "VEでは、製品の「機能」と「コスト」を基に、「価値（Value）」を定義する。また、その価値は、「価値 ＝ 機能 ÷ コスト」 という式で表される。" },
      { id: "イ", text: "製品の機能を維持したまま、コストを下げることで、コスト的な価値を向上する方法がある。" },
      { id: "ウ", text: "機能を下げるが、それ以上にコストを下げて、価格に対する機能の相対的な価値を向上する方法がある。" },
      { id: "エ", text: "コストを上げるが、それ以上に機能を上げて、価格に対する機能の相対的な価値を向上する方法がある。" }
    ],
    answer: "ウ",
    explanation: {
      summary: "本問ではVE（Value Engineering）における、価値の定義と、価値を高める方法を問われています。価値を高めるパターンについては、機能を下げるパターンがないことを覚えておくのがポイントです。",
      veValuePattern: true,
      details: [
        { label: "ア ○", text: "VEでは価値を、「価値 ＝ 機能 ÷ コスト」という式で表します。この価値を高めるために様々な活動を行い、顧客満足度が高い製品を低コストで開発することを狙いとしています。よって記述は適切です。" },
        { label: "イ ○", text: "VEにおける価値を高める一つのパターンとして、コストを下げ、機能を維持する方法があります。つまり、従来と同じ製品を安く作ることで価値を高めます。よって記述は適切です。" },
        { label: "ウ ×", text: "VEでは機能を下げるパターンは存在しません。機能を下げた場合には、別の製品になるという考え方をします。よって記述は不適切です。" },
        { label: "エ ○", text: "VEにおける価値を高める一つのパターンとして、コストを上げ、それ以上に機能を向上させる方法があります。コストの増加分よりも機能が向上していることを顧客に納得してもらうことが必要となります。よって記述は適切です。" }
      ]
    }
  ],
  {
    id: 10,
    title: "問題 10 VE 2",
    meta: "スマート問題集：3-2 工場計画と開発設計",
    question: "VEの「機能」に関する記述として、最も適切なものはどれか。",
    options: [
      { id: "ア", text: "使用機能とは、製品の本来の価値を果たす機能のことである。" },
      { id: "イ", text: "携帯電話のカラ―バリエーションは、二次機能に該当する。" },
      { id: "ウ", text: "使用機能はさらに、基本機能・二次機能・貴重機能に分けることができる。" },
      { id: "エ", text: "携帯電話の基本機能を上げるために、新製品は従来品より軽くした。" }
    ],
    answer: "ア",
    explanation: {
      summary: "本問ではVEの機能の分類と、内容・手順について問われています。機能とは製品が果たす働きのことで、性質・重要性・必要性によって分類されます。",
      veFunctionTable: true,
      details: [
        { label: "ア ○", text: "機能は、製品が果たす働きのことで、使用機能と、貴重機能の2つに分けることができます。このうち使用機能とは、製品の本来の価値を果たす機能のことです。よって記述は適切です。" },
        { label: "イ ×", text: "色や形などの、顧客の欲求を喚起するための機能は、貴重機能となります。よって記述は不適切です。二次機能とは、基本機能を果たすために二次的に付加される補助的な機能のことです（例: 携帯のストラップ穴など）。" },
        { label: "ウ ×", text: "使用機能は、製品の本来の価値を果たす機能のことで、基本機能と二次機能に分けられます。貴重機能は、顧客の欲求を喚起するためのもので、なくても製品本来の価値は果たすため、使用機能の中には含まれません。よって記述は不適切です。" },
        { label: "エ ×", text: "基本機能は、これを取り除くと製品の存在意義が無くなるような機能（携帯なら通話や画面表示など）です。軽量になることは携帯する上で便利になりますが、電話の基本機能ではなく補助的な機能である二次機能を上げることになります。よって記述は不適切です。" }
      ]
    }
  }
];

export default function App() {
  // --- 状態管理 ---
  const [keyword, setKeyword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [currentScreen, setCurrentScreen] = useState("start"); // start, quiz, history, summary
  const [selectedMode, setSelectedMode] = useState("all"); // all, wrong, review
  
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // ユーザーデータ履歴のキャッシュ
  const [userHistory, setUserHistory] = useState({}); // { questionId: { correct: boolean, review: boolean } }
  const [lastProgress, setLastProgress] = useState(null); // { index: number, mode: string }
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  // --- ログイン・初期読み込み処理 ---
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!keyword.trim()) return;
    
    setLoading(true);
    console.log("Starting authentication and data retrieval for keyword:", keyword);
    try {
      await signInAnonymously(auth);
      console.log("Anonymous sign-in success.");
      
      const docRef = doc(db, APP_ID, keyword.trim());
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Cloud data retrieved:", data);
        setUserHistory(data.history || {});
        
        if (typeof data.progressIndex === "number" && data.progressMode) {
          setLastProgress({
            index: data.progressIndex,
            mode: data.progressMode
          });
          setShowResumePrompt(true);
        }
      } else {
        console.log("No existing user data found. Initializing new record.");
        await setDoc(docRef, { history: {}, createdAt: new Date() });
        setUserHistory({});
      }
      setIsAuthorized(true);
    } catch (error) {
      console.error("Authentication or database error:", error);
      alert("通信エラーが発生しました。設定値やネットワークを確認してください。");
    } finally {
      setLoading(false);
    }
  };

  // --- データのクラウド保存処理 ---
  const saveUserDataToCloud = async (updatedHistory, updatedProgress = null) => {
    if (!keyword.trim()) return;
    try {
      const docRef = doc(db, APP_ID, keyword.trim());
      const payload = { history: updatedHistory };
      
      if (updatedProgress) {
        payload.progressIndex = updatedProgress.index;
        payload.progressMode = updatedProgress.mode;
      }
      
      await updateDoc(docRef, payload);
      console.log("Progress saved successfully to cloud.", payload);
    } catch (error) {
      console.error("Failed to save progress to cloud:", error);
    }
  };

  // --- クイズセッション構築 ---
  const startQuizSession = (mode, resumeIndex = 0) => {
    console.log(`Building quiz session. Mode: ${mode}, StartIndex: ${resumeIndex}`);
    let list = [];
    if (mode === "all") {
      list = [...QUIZ_DATA];
    } else if (mode === "wrong") {
      list = QUIZ_DATA.filter(q => userHistory[q.id]?.correct === false);
    } else if (mode === "review") {
      list = QUIZ_DATA.filter(q => userHistory[q.id]?.review === true);
    }
    
    if (list.length === 0) {
      alert("該当する問題がありません。別モードをお試しください。");
      return;
    }

    setFilteredQuestions(list);
    setSelectedMode(mode);
    setCurrentIndex(resumeIndex < list.length ? resumeIndex : 0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentScreen("quiz");
    setShowResumePrompt(false);
  };

  const handleInitialStart = (mode) => {
    startQuizSession(mode, 0);
  };

  const handleResume = () => {
    if (lastProgress) {
      startQuizSession(lastProgress.mode, lastProgress.index);
    }
  };

  const handleDeclineResume = async () => {
    setShowResumePrompt(false);
    setLastProgress(null);
    try {
      const docRef = doc(db, APP_ID, keyword.trim());
      await updateDoc(docRef, {
        progressIndex: 0,
        progressMode: "all"
      });
      console.log("Cloud session progress reset to 0.");
    } catch (e) {
      console.error(e);
    }
  };

  // --- 回答アクション ---
  const handleOptionClick = async (optionId) => {
    if (isAnswered) return;
    setSelectedOption(optionId);
    setIsAnswered(true);
    
    const currentQuestion = filteredQuestions[currentIndex];
    const isCorrect = optionId === currentQuestion.answer;
    
    const updatedHistory = {
      ...userHistory,
      [currentQuestion.id]: {
        ...userHistory[currentQuestion.id],
        correct: isCorrect,
        review: userHistory[currentQuestion.id]?.review || false
      }
    };
    
    setUserHistory(updatedHistory);
    
    // 次の問題があるか判定しつつインデックス保存を検討
    const nextIdx = currentIndex + 1;
    const progressPayload = nextIdx < filteredQuestions.length 
      ? { index: nextIdx, mode: selectedMode }
      : { index: 0, mode: "all" }; // 完走時はリセット
      
    await saveUserDataToCloud(updatedHistory, progressPayload);
  };

  // --- 要復習フラグ切り替え ---
  const handleToggleReview = async () => {
    const currentQuestion = filteredQuestions[currentIndex];
    const currentStatus = userHistory[currentQuestion.id]?.review || false;
    
    const updatedHistory = {
      ...userHistory,
      [currentQuestion.id]: {
        ...userHistory[currentQuestion.id],
        review: !currentStatus
      }
    };
    
    setUserHistory(updatedHistory);
    await saveUserDataToCloud(updatedHistory, { index: currentIndex, mode: selectedMode });
  };

  // --- 次へ / 戻る ナビゲーション ---
  const handleNextQuestion = () => {
    if (currentIndex + 1 < filteredQuestions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setCurrentScreen("summary");
    }
  };

  const handleReturnHome = async () => {
    console.log("Returning to dashboard. Current index saved:", currentIndex);
    if (currentScreen === "quiz") {
      await saveUserDataToCloud(userHistory, { index: currentIndex, mode: selectedMode });
    }
    setCurrentScreen("start");
  };

  // --- 統計計算 ---
  const totalQuestionsCount = QUIZ_DATA.length;
  const answeredCount = Object.keys(userHistory).length;
  const correctCount = Object.values(userHistory).filter(item => item.correct).length;
  const reviewCount = Object.values(userHistory).filter(item => item.review).length;
  const accuracyRate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const chartData = [
    { name: "全体", 問題数: totalQuestionsCount },
    { name: "解答済", 問題数: answeredCount },
    { name: "正解", 問題数: correctCount },
    { name: "要復習", 問題数: reviewCount }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full text-center">
          <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-slate-800">データを同期中...</h3>
          <p className="text-sm text-slate-500 mt-2">クラウドから最新の学習履歴を取得しています。そのまましばらくお待ちください。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
      {/* 共通ヘッダー */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleReturnHome}>
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                スマート問題集
              </h1>
              <p className="text-xs text-slate-400 font-medium">3-2 工場計画と開発設計</p>
            </div>
          </div>
          {isAuthorized && (
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-xs">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300 font-mono truncate max-w-[100px]">{keyword}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 【未認証画面】 */}
        {!isAuthorized && (
          <div className="max-w-md mx-auto mt-8 bg-slate-800/50 border border-slate-700/60 rounded-2xl shadow-2xl p-6 backdrop-blur">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-indigo-500/20">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">同期用キーワードの入力</h2>
              <p className="text-slate-400 text-xs mt-1">PCやスマホで同じ合言葉を使用すると、履歴がシームレスに同期されます。</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  合言葉・ユーザーID
                </label>
                <input
                  type="text"
                  placeholder="例: osaka-dx-consultant"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2"
              >
                <span>学習を開始する</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* 【認証済ダッシュボード画面】 */}
        {isAuthorized && currentScreen === "start" && (
          <div className="space-y-6">
            {/* 中断再開確認ダイアログ */}
            {showResumePrompt && lastProgress && (
              <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xl shadow-indigo-950/20 animate-fade-in">
                <div className="flex items-start space-x-3.5">
                  <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-xl mt-0.5 border border-indigo-500/20">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">前回の学習データが見つかりました</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      前回は【{lastProgress.mode === "all" ? "すべての問題" : lastProgress.mode === "wrong" ? "前回不正解" : "要復習"}】の 
                      <span className="font-bold text-indigo-400 mx-1">問題 {lastProgress.index + 1}</span> まで学習を進めています。
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={handleDeclineResume}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    最初から
                  </button>
                  <button
                    onClick={handleResume}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 flex items-center space-x-1"
                  >
                    <span>続きから再開</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 進捗概要スタッツ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-center">
                <p className="text-xs font-medium text-slate-400">総問題数</p>
                <p className="text-2xl font-black text-white mt-1">{totalQuestionsCount}<span className="text-xs font-normal text-slate-500 ml-0.5">問</span></p>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-center">
                <p className="text-xs font-medium text-slate-400">学習進捗率</p>
                <p className="text-2xl font-black text-indigo-400 mt-1">
                  {Math.round((answeredCount / totalQuestionsCount) * 100)}<span className="text-xs font-normal text-slate-500 ml-0.5">%</span>
                </p>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-center">
                <p className="text-xs font-medium text-slate-400">平均正解率</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">{accuracyRate}<span className="text-xs font-normal text-slate-500 ml-0.5">%</span></p>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-center">
                <p className="text-xs font-medium text-slate-400">要復習登録</p>
                <p className="text-2xl font-black text-amber-400 mt-1">{reviewCount}<span className="text-xs font-normal text-slate-500 ml-0.5">問</span></p>
              </div>
            </div>

            {/* モード選択エリア */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center space-x-2">
                <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full"></span>
                <span>学習モードを選択してスタート</span>
              </h3>
              
              <div className="grid sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleInitialStart("all")}
                  className="bg-slate-800/80 hover:bg-slate-700/60 p-4 rounded-xl border border-slate-700/80 text-left transition-all hover:scale-[1.01] flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-xs font-bold text-indigo-400 tracking-wide uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">All</span>
                    <h4 className="text-base font-bold text-white mt-2 group-hover:text-indigo-300 transition-colors">すべての問題</h4>
                    <p className="text-slate-400 text-xs mt-1">収録されている全10問を最初から順に学習します。</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 mt-4 self-end transition-colors" />
                </button>

                <button
                  onClick={() => handleInitialStart("wrong")}
                  className="bg-slate-800/80 hover:bg-slate-700/60 p-4 rounded-xl border border-slate-700/80 text-left transition-all hover:scale-[1.01] flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-xs font-bold text-rose-400 tracking-wide uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Incorrect</span>
                    <h4 className="text-base font-bold text-white mt-2 group-hover:text-rose-300 transition-colors">前回不正解のみ</h4>
                    <p className="text-slate-400 text-xs mt-1">過去の間違えた履歴データから絞り込んで再挑戦します。</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 mt-4 self-end transition-colors" />
                </button>

                <button
                  onClick={() => handleInitialStart("review")}
                  className="bg-slate-800/80 hover:bg-slate-700/60 p-4 rounded-xl border border-slate-700/80 text-left transition-all hover:scale-[1.01] flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-xs font-bold text-amber-400 tracking-wide uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Review</span>
                    <h4 className="text-base font-bold text-white mt-2 group-hover:text-amber-300 transition-colors">要復習の問題のみ</h4>
                    <p className="text-slate-400 text-xs mt-1">チェックボックスで個別指定した重要問題を重点復習します。</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 mt-4 self-end transition-colors" />
                </button>
              </div>
            </div>

            {/* 各問題の状態一覧リスト */}
            <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-slate-400" />
                  <span>現在の問題別ステータス同期一覧</span>
                </div>
                <span className="text-xs text-slate-500 font-normal">全端末間でリアルタイム同期中</span>
              </h3>
              
              <div className="divide-y divide-slate-800/80 max-h-[280px] overflow-y-auto pr-1">
                {QUIZ_DATA.map((q) => {
                  const state = userHistory[q.id];
                  return (
                    <div key={q.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3 truncate">
                        <span className="w-14 text-slate-500 font-mono">Q.{String(q.id).padStart(2, "0")}</span>
                        <span className="text-slate-300 truncate font-medium">{q.question}</span>
                      </div>
                      <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                        {state?.correct === true && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">正解</span>}
                        {state?.correct === false && <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-bold">不正解</span>}
                        {(!state || state.correct === undefined) && <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded">未着手</span>}
                        {state?.review && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold">要復習</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 【出題・解説画面】 */}
        {isAuthorized && currentScreen === "quiz" && filteredQuestions[currentIndex] && (
          <div className="space-y-5">
            {/* プログレスバー */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={handleReturnHome}
                className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 transition-colors bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-700/40"
              >
                <Home className="w-3.5 h-3.5" />
                <span>ダッシュボードへ戻る</span>
              </button>
              <span className="font-mono bg-slate-800 px-2 py-1 rounded-md text-slate-300">
                {currentIndex + 1} / {filteredQuestions.length} 問目 ({selectedMode === "all" ? "全問" : selectedMode === "wrong" ? "不正解のみ" : "要復習のみ"})
              </span>
            </div>

            {/* 問題カード */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-slate-800/80 px-5 py-3 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-400 font-medium tracking-wide">
                  {filteredQuestions[currentIndex].meta}
                </span>
                <span className="bg-indigo-600/20 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wider">
                  中小企業診断士 頻出
                </span>
              </div>
              
              <div className="p-5 sm:p-6 space-y-4">
                <h3 className="text-sm font-bold text-indigo-400 font-mono">
                  {filteredQuestions[currentIndex].title}
                </h3>
                <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {filteredQuestions[currentIndex].question}
                </p>
              </div>
            </div>

            {/* 選択肢セクション */}
            <div className="space-y-3">
              {filteredQuestions[currentIndex].options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isCorrectAns = opt.id === filteredQuestions[currentIndex].answer;
                
                let btnStyle = "bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/80 text-slate-200";
                if (isAnswered) {
                  if (isCorrectAns) {
                    btnStyle = "bg-emerald-950/30 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-950/30 border-rose-500/50 text-rose-300 ring-1 ring-rose-500/30";
                  } else {
                    btnStyle = "bg-slate-900/40 border-slate-800 text-slate-500 opacity-60";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionClick(opt.id)}
                    disabled={isAnswered}
                    className={`w-full text-left border rounded-xl p-4 transition-all duration-150 flex items-start space-x-3 font-medium text-sm leading-relaxed ${btnStyle}`}
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5
                      ${isAnswered && isCorrectAns ? "bg-emerald-500 text-slate-900" : isSelected ? "bg-rose-500 text-white" : "bg-slate-700 text-slate-300"}`}
                    >
                      {opt.id}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {isAnswered && isCorrectAns && <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                    {isAnswered && isSelected && !isCorrectAns && <X className="w-5 h-5 text-rose-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* 【解答後の詳細解説ゾーン】 */}
            {isAnswered && (
              <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 sm:p-6 space-y-6 shadow-2xl animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700/60">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-xl font-black text-sm tracking-wider uppercase shadow-inner
                      ${selectedOption === filteredQuestions[currentIndex].answer ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border border-rose-500/30"}`}
                    >
                      {selectedOption === filteredQuestions[currentIndex].answer ? "CORRECT" : "WRONG"}
                    </span>
                    <div className="text-xs">
                      <span className="text-slate-400">正解:</span>
                      <span className="text-emerald-400 font-mono font-bold text-sm ml-1">{filteredQuestions[currentIndex].answer}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleReview}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                      ${userHistory[filteredQuestions[currentIndex].id]?.review 
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md shadow-amber-500/5" 
                        : "bg-slate-900 text-slate-400 border-slate-700/60 hover:text-slate-200"}`}
                  >
                    <span>★ 要復習としてマーク</span>
                  </button>
                </div>

                {/* 解説テキスト本体 */}
                <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-normal">
                  <p className="font-semibold text-white bg-slate-900/50 p-3 rounded-xl border border-slate-700/30">
                    {filteredQuestions[currentIndex].explanation.summary}
                  </p>

                  {/* 図表再現1: 問題1 工場レイアウトの4つの基本分類 */}
                  {filteredQuestions[currentIndex].explanation.typesTable && (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
                      <div className="text-center font-bold text-xs tracking-wider text-slate-400 border-b border-slate-800 pb-2">◆ 工場レイアウトの4大分類モデル ◆</div>
                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/40">
                          <h5 className="font-bold text-white text-slate-200 border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between"><span>固定式レイアウト</span><span className="text-[10px] text-amber-400">製品は固定</span></h5>
                          <p className="text-slate-400 leading-tight">船舶や大型重量物。材料、工具や作業者が移動。</p>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/40">
                          <h5 className="font-bold text-white text-slate-200 border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between"><span>機能別レイアウト</span><span className="text-[10px] text-indigo-400">機能を重視</span></h5>
                          <p className="text-slate-400 leading-tight">類似した機能の設備をまとめて配置。ジョブショップ型。</p>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/40">
                          <h5 className="font-bold text-white text-slate-200 border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between"><span>製品別レイアウト</span><span className="text-[10px] text-emerald-400">製品の流れ重視</span></h5>
                          <p className="text-slate-400 leading-tight">加工順序に沿って直線的に設備を配置。フローショップ型。</p>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/40">
                          <h5 className="font-bold text-white text-slate-200 border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between"><span>グループ別レイアウト</span><span className="text-[10px] text-pink-400">グループ化で生産</span></h5>
                          <p className="text-slate-400 leading-tight">中間的配置。グループテクノロジーを用いて類似製品を共通ライン化。</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 図表再現2: 問題2 メリット・デメリット対比表 */}
                  {filteredQuestions[currentIndex].explanation.featuresTable && (
                    <div className="overflow-x-auto bg-slate-900/40 border border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700">
                            <th className="p-2.5">レイアウト</th>
                            <th className="p-2.5">メリット</th>
                            <th className="p-2.5">デメリット</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-400">
                          <tr>
                            <td className="p-2.5 font-bold text-slate-300 bg-slate-800/20">固定式</td>
                            <td className="p-2.5">移動なく、大きくて重い製品向き。設計・工程変更に柔軟。</td>
                            <td className="p-2.5">作業者や工具の移動が多くなる。</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-bold text-slate-300 bg-slate-800/20">機能別</td>
                            <td className="p-2.5">製品・生産計画の変更に柔軟。特定設備の生産熟練が可能。</td>
                            <td className="p-2.5">加工経路や管理が複雑。仕掛品が多く生産期間が長期化。</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-bold text-slate-300 bg-slate-800/20">製品別</td>
                            <td className="p-2.5">工程管理が簡単。自動機械化しやすく短時間大量生産。</td>
                            <td className="p-2.5">製品・加工順序変更に弱い。一部停止で全体が停止。単能工化。</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-bold text-slate-300 bg-slate-800/20">グループ</td>
                            <td className="p-2.5">機能別より仕掛品が少なく効率的。多品種少量でも効率化可。</td>
                            <td className="p-2.5">専用ラインではないため製品別よりは効率が下がる。</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 図表再現3: 問題3 品種・生産量マトリクスマップ */}
                  {filteredQuestions[currentIndex].explanation.matrixTable && (
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                      <div className="text-center font-bold text-xs text-slate-400 mb-2">◆ 品種・生産量に応じた最適配置マップ ◆</div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-300">
                        <div className="bg-slate-800/30 p-2 rounded border border-slate-800 flex flex-col justify-center items-center">
                          <span className="text-[10px] text-slate-500 block">少品種×多量</span>
                          <span className="font-bold text-emerald-400 mt-1">製品別レイアウト</span>
                        </div>
                        <div className="bg-slate-800/30 p-2 rounded border border-slate-800 flex flex-col justify-center items-center">
                          <span className="text-[10px] text-slate-500 block">中品種×中量</span>
                          <span className="font-bold text-amber-400 mt-1">グループ別レイアウト</span>
                        </div>
                        <div className="bg-slate-800/30 p-2 rounded border border-slate-800 flex flex-col justify-center items-center">
                          <span className="text-[10px] text-slate-500 block">多品種×少量</span>
                          <span className="font-bold text-indigo-400 mt-1">機能別レイアウト</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-2 text-right">※品種・生産量ともに極小の場合は「固定式レイアウト」が適合。</div>
                    </div>
                  )}

                  {/* 図表再現4: 問題5 & 問題6 SLPフロー図 */}
                  {(filteredQuestions[currentIndex].explanation.slpFlow || filteredQuestions[currentIndex].explanation.slpTable || filteredQuestions[currentIndex].explanation.slpDetailsTable) && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
                      <div className="text-center font-bold text-slate-400 border-b border-slate-800 pb-1">◆ SLP（Systematic Layout Planning）設計手順フロー ◆</div>
                      <div className="flex flex-col items-center space-y-1.5 py-1 text-slate-300 font-medium">
                        <div className="bg-slate-800 px-4 py-1.5 rounded border border-indigo-500/20 text-center w-full max-w-[280px] font-bold text-indigo-300">① P-Q分析 (Product - Quantity)</div>
                        <div className="text-slate-600 text-xs">↓ (二大分析を同時並行)</div>
                        <div className="grid grid-cols-2 gap-2 w-full max-w-[400px]">
                          <div className="bg-slate-800/80 p-2 rounded border border-slate-700/60 text-center">② 物の流れ分析</div>
                          <div className="bg-slate-800/80 p-2 rounded border border-slate-700/60 text-center">③ アクティビティ相互関係分析</div>
                        </div>
                        <div className="text-slate-600 text-xs">↓ (双方を統合し作図)</div>
                        <div className="bg-slate-800 px-4 py-1.5 rounded border border-slate-700 text-center w-full max-w-[280px]">④ アクティビティ相互関係ダイアグラム</div>
                        <div className="text-slate-600 text-xs">↓ (+ 必要面積・利用可能面積情報)</div>
                        <div className="bg-slate-800 px-4 py-1.5 rounded border border-amber-500/20 text-center w-full max-w-[280px] font-bold text-amber-300">⑤ スペース相互関係ダイアグラム</div>
                        <div className="text-slate-600 text-xs">↓ (+ 修正・制約条件)</div>
                        <div className="bg-slate-800 px-4 py-1.5 rounded border border-slate-700 text-center w-full max-w-[280px]">⑥ 複数のレイアウト案作成 → 決定</div>
                      </div>
                    </div>
                  )}

                  {/* 図表再現5: 問題7 & 問題8 製品開発・設計・工程設計定義 */}
                  {(filteredQuestions[currentIndex].explanation.devFlowTable || filteredQuestions[currentIndex].explanation.designDiffTable) && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-2.5 text-xs">
                      <div className="font-bold text-slate-400 border-b border-slate-800 pb-1 text-center">◆ 製品開発フェーズ別の業務スコープ範囲 ◆</div>
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <span className="bg-indigo-600/20 text-indigo-400 font-bold px-1.5 py-0.5 rounded flex-shrink-0 w-16 text-center">製品企画</span>
                          <p className="text-slate-400">顧客ニーズ・ターゲット選定、要求機能や性能要件の骨子定義。</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="bg-sky-600/20 text-sky-400 font-bold px-1.5 py-0.5 rounded flex-shrink-0 w-16 text-center">製品設計</span>
                          <p className="text-slate-400">製品構造決定、組立図・部品図・部品リスト(BOM)を具体化。
                            <span className="block text-[11px] text-slate-500 mt-0.5">・機能設計：期待性能を発揮するための機能/構造決定</span>
                            <span className="block text-[11px] text-slate-500">・生産設計：部品数削減、組立容易化、コスト抑制の織り込み</span>
                          </p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="bg-emerald-600/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded flex-shrink-0 w-16 text-center">工程設計</span>
                          <p className="text-slate-400">具体的な「作り方の設計」。目標品質・量・納期(QCD)を達成する工程、作業方法、ライン設備、レイアウトの設計決定。</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 図表再現6: 問題9 & 問題10 VE(価値・機能)構造定義 */}
                  {(filteredQuestions[currentIndex].explanation.veValuePattern || filteredQuestions[currentIndex].explanation.veFunctionTable) && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs space-y-3">
                      <div className="text-center font-bold text-slate-400 border-b border-slate-800 pb-1">◆ VE (Value Engineering) 基本定理 ◆</div>
                      <div className="text-center font-mono font-bold text-white bg-slate-800 p-2 rounded border border-slate-700 max-w-sm mx-auto">
                        価値 (Value) ＝ 機能 (Function) ÷ コスト (Cost)
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3 text-slate-400 mt-2">
                        <div>
                          <h5 className="font-bold text-slate-300 mb-1">【価値向上の4パターン】</h5>
                          <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                            <li>① コストを下げる（機能は維持）</li>
                            <li>② 機能を向上する（コストは維持）</li>
                            <li>③ コスト微増に対し、それ以上に機能向上</li>
                            <li>④ コストを下げ、かつ機能を向上 (最良)</li>
                            <li className="text-rose-400 list-none font-bold mt-1">※VEでは「機能を下げる」選択肢は絶対にありません。</li>
                          </ul>
                        </div>
                        <div className="border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
                          <h5 className="font-bold text-slate-300 mb-1">【機能の分類体系】</h5>
                          <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                            <li><strong className="text-slate-300">使用機能：</strong>製品本来の価値。実用的働き。
                              <span className="block text-slate-500">└ 基本機能（存在意義）/ 二次機能（補助的）</span>
                            </li>
                            <li><strong className="text-slate-300">貴重機能：</strong>デザインや色など、顧客の欲求・魅力を高める。</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">選択肢各論解説</h4>
                    {filteredQuestions[currentIndex].explanation.details.map((detail, dIdx) => (
                      <div key={dIdx} className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-800 flex items-start space-x-2">
                        <span className="font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 flex-shrink-0 mt-0.5">
                          {detail.label}
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">{detail.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center space-x-1"
                  >
                    <span>{currentIndex + 1 === filteredQuestions.length ? "結果を確認する" : "次の問題へ進む"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 【結果サマリーセッション完了画面】 */}
        {isAuthorized && currentScreen === "summary" && (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
              <Award className="w-8 h-8" />
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-white">セッション完了！</h2>
              <p className="text-slate-400 text-xs mt-1">今回の学習セッションの全設問の処理が完了しました。</p>
            </div>

            {/* チャート可視化 */}
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl max-w-lg mx-auto">
              <h4 className="text-xs font-bold text-slate-400 text-left mb-4">■ 同期履歴データの統計グラフ</h4>
              <div className="w-full h-48 text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc" }} />
                    <Bar dataKey="問題数" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-2 max-w-sm mx-auto">
              <button
                onClick={handleReturnHome}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                <Home className="w-4 h-4" />
                <span>ダッシュボードへ戻る</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}