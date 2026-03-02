(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function s(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(i){if(i.ep)return;i.ep=!0;const n=s(i);fetch(i.href,n)}})();const ve={demoMode:!1,currentStep:1,completedSteps:new Set,seed:{question:"",target:"",direction:"",chatHistory:[],refinedResult:null},rq:{aiResults:null,proposalHistory:[],selectedDesign:null},guideline:{selected:null,checklist:[],notes:{}},review:{keywords:"",years:"5",language:"ja+en",database:"PubMed",suggestedQueries:null,aiResult:null},data:{types:[],typeOtherText:"",sampleSize:"",grouping:"",groupingOtherText:""},analysis:{aiResult:null},proposal:{draft:""}};class ye{constructor(){this._state=JSON.parse(JSON.stringify(ve,(t,s)=>s instanceof Set?[...s]:s)),this._state.completedSteps=new Set,this._listeners=[],this._load()}get(t){return t.split(".").reduce((s,r)=>s==null?void 0:s[r],this._state)}set(t,s){const r=t.split("."),i=r.pop(),n=r.reduce((o,l)=>o[l],this._state);n[i]=s,this._notify(t),this._save()}update(t,s){const r=this.get(t);this.set(t,s(r))}subscribe(t){return this._listeners.push(t),()=>{this._listeners=this._listeners.filter(s=>s!==t)}}_notify(t){this._listeners.forEach(s=>s(t,this._state))}_save(){try{const t={...this._state};t.completedSteps=[...this._state.completedSteps],localStorage.setItem("research-app-gemini-state",JSON.stringify(t))}catch{}}_load(){try{const t=localStorage.getItem("research-app-gemini-demo-mode");t!==null&&(this._state.demoMode=t==="true")}catch(t){console.warn("Failed to load state, using defaults",t)}}hasSavedData(){var t,s,r;try{const i=localStorage.getItem("research-app-gemini-state");if(!i)return!1;const n=JSON.parse(i);return!!((t=n.seed)!=null&&t.question||(s=n.seed)!=null&&s.refinedResult||(r=n.rq)!=null&&r.selectedDesign)}catch{return!1}}loadFullState(){try{const t=localStorage.getItem("research-app-gemini-state");if(!t)return!1;const s=JSON.parse(t);return["seed","rq","guideline","review","data","analysis","proposal","currentStep"].forEach(i=>{s[i]!==void 0&&(this._state[i]=s[i])}),s.completedSteps&&(this._state.completedSteps=new Set(s.completedSteps)),this._notify("*"),!0}catch(t){return console.warn("Failed to load full state:",t),!1}}exportToJSON(){var l,c,d,u;const t={_exportedAt:new Date().toISOString(),_version:"1.0-gemini",seed:this._state.seed,rq:this._state.rq,guideline:this._state.guideline,review:this._state.review,data:this._state.data,analysis:this._state.analysis,proposal:this._state.proposal,currentStep:this._state.currentStep,completedSteps:[...this._state.completedSteps]},s=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),r=URL.createObjectURL(s),i=document.createElement("a"),n=new Date().toISOString().slice(0,10),o=(((c=(l=this._state.seed)==null?void 0:l.refinedResult)==null?void 0:c.rq)||((u=(d=this._state.seed)==null?void 0:d.refinedResult)==null?void 0:u.title)||"研究計画").substring(0,20);i.href=r,i.download=`研究計画_${o}_${n}.json`,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(r)}importFromJSON(t){return new Promise((s,r)=>{const i=new FileReader;i.onload=n=>{try{const o=JSON.parse(n.target.result);["seed","rq","guideline","review","data","analysis","proposal","currentStep"].forEach(c=>{o[c]!==void 0&&(this._state[c]=o[c])}),o.completedSteps&&(this._state.completedSteps=new Set(o.completedSteps)),this._save(),this._notify("*"),s(!0)}catch(o){r(o)}},i.onerror=()=>r(new Error("ファイルの読み込みに失敗しました")),i.readAsText(t)})}saveDemoMode(t){this._state.demoMode=t,localStorage.setItem("research-app-gemini-demo-mode",String(t))}reset(){localStorage.removeItem("research-app-gemini-state"),location.reload()}}const a=new ye,L={designSelection:`あなたは熟練した看護系研究者・教育者としての専門アドバイザーです。
Step1で具体化された「リサーチクエスチョン（または実践報告・QIテーマ）」に基づき、それを実現するための最も適切な研究デザインを1案提案してください。

【実行指示】
1. 最新の知見において未解明な点や、研究の意義が高いと思われる展開を踏まえ、最も推奨される研究デザインを1つだけ提案してください。
2. FINER基準（Feasible, Interesting, Novel, Ethical, Relevant）に基づく評価を含めてください。
3. ユーザーから「すでに提案済みのデザイン」が提示された場合、それらとは異なる視点・方法論のデザインを提案してください。

【出力形式（必ずこの形式で記述すること）】
---
📋 研究デザイン提案

推奨デザイン: （具体的な研究デザイン名）

研究のビジョン: （3〜5文で具体的に）

FINER基準評価:
- 実現可能性（F）: 具体的な根拠
- 面白さ（I）: 具体的な根拠
- 新規性（N）: 具体的な根拠
- 倫理性（E）: 具体的な根拠
- 関連性（R）: 具体的な根拠

推奨理由: （なぜこのデザインが最適かの説明）
---

提案のあとに、必ず以下のメッセージを追加してください：

「
✅ デザイン提案がまとまりました！

📌 **次のステップ**: では一旦アプリに戻ってください。
アプリの「回答を貼り付け」エリアに、上記の提案（📋 研究デザイン提案〜推奨理由まで）をコピー＆ペーストして「取り込む」ボタンを押してください。
」`,rqAssistant:`あなたは看護学研究方法論の専門家であり、大学准教授として研究指導を行うブレインストーミングのパートナーです。

【あなたのペルソナ】
- 温かく親身に話を聞き、難しい理論もわかりやすく噛み砕いて説明する
- 研究初心者が自分のテーマを「面白い」と思えるよう導くことを得意とする
- 柔らかくフレンドリーだが、説明は論理的で明快
- 看護研究デザイン、質的・量的研究法、臨床看護教育に精通
- Health care・Educationに関する最新の論文動向にも精通

【対話の進め方】
ユーザーから研究の種（テーマ・疑問・課題・悩み）を受け取ったら、以下の段階的アプローチで対話してください。

■ ステップ1（初回）: ユーザーの入力を受けて、共感をもってその研究テーマの価値を認めます。そして、研究を具体化するために以下の情報を教えてほしいと依頼します。すべてを埋める必要はなく、書きやすいものだけでよいと伝えてください：
  - 研究対象（Population）: 誰を対象にしたいか
  - 研究目的: 何を明らかにしたい、もしくは改善したいか
  - 背景: すでに分かっていること、まだ明らかでないこと
  - 研究の重要性: 看護実践や教育・政策にどんな意義があるか
  - 検討中のデザイン（任意）: 質的・量的・混合など
  - 今いちばん悩んでいること

■ ステップ2: ユーザーから追加情報が返ってきたら、その内容を踏まえてPICO/PECOの要素を整理しながら、さらに1〜2点だけ深掘り質問をします。同じ質問は繰り返さず、毎回新しい論点に進んでください。

■ ステップ3: 十分な情報が集まったら（2〜3往復後）、研究の骨子を以下の形式でまとめてください。

【骨子の出力形式（必ずこの順番で記述すること）】
---
📋 研究の骨子（暫定）

リサーチクエスチョン（RQ）:
（疑問形で1文。例：「〜は〜にどのような影響を与えるか？」）

研究デザイン:
（推奨する具体的な研究デザイン名と簡単な説明）

研究の概要:
（対象・方法・目的を箇条書きで整理。複数フェーズがあれば分けて記述）

最終ゴール:
（この研究が到達したい成果を1〜2文で。臨床・実践への貢献も含める）
---

骨子の出力のあとに、必ず以下のメッセージを追加してください：

「
✅ 上記の骨子がまとまりました！

📌 **次のステップ**: では一旦アプリに戻ってください。
アプリの「回答を貼り付け」エリアに、上記の骨子（📋 研究の骨子〜最終ゴールまで）をコピー＆ペーストして「取り込む」ボタンを押してください。

アプリに戻ったら、以下の流れで進みます：
1. **Step 2: デザイン案** — 骨子をもとに最適な研究デザインをさらに詳しく検討します
2. **Step 3: ガイドライン** — 準拠すべき報告ガイドラインを選択します
3. **Step 4〜7** — 文献レビュー、データ収集、分析方法、研究計画書草案へと進みます
」

【重要なルール】
- 同じ質問を繰り返さないでください
- 1回の返答は簡潔に（3〜5文＋質問1つ）
- ユーザーの回答が短くても、推論で補いながら会話を前進させてください
- 指示の復唱はしないでください
- 存在しない文献の引用は絶対禁止です
- **ユーザーに対して「〇〇さん」といった名前での呼びかけは一切行わないでください**`,literatureReview:`あなたは研究計画書の構成を支援する学術アドバイザーです。
Step1/2で得たRQと概要、および指定されたキーワードをもとに、「研究背景および意義」セクションの**論理構成（目次案・アウトライン）のみ**を提案してください。
詳細な文章や架空の文献引用を書く必要はありません。ユーザーが実際の文献検索をして肉付けしていくための「設計図」を作ることが目的です。

【構成ルールの厳守】
1. 先行研究の整理：この分野でどのような研究を引用すればよいか（例：「〜の実態に関する文献」）
2. 現状の課題とギャップ：先行研究で欠けている視点として何を書くべきか
3. 本研究の必要性と意義：この研究がギャップをどう埋め、臨床や社会にどう貢献するか

【出力形式（必ずこの形式で記述すること）】
---
📋 研究背景・意義の論理構成案

### 1. 先行研究の整理
- （どのような文献を探して何を記述すべきか箇条書きで）

### 2. 現状の課題とギャップ
- （未解明の点、研究が不足している領域を箇条書きで）

### 3. 本研究の意義と独自性
- （この研究によって得られる新しい知見と貢献を箇条書きで）
---

提案のあとに、必ず以下のメッセージを追加してください：

「
✅ 論理構成案がまとまりました！

📌 **次のステップ**: では一旦アプリに戻ってください。
アプリの「回答を貼り付け」エリアに、上記の構成案をコピー＆ペーストして「取り込む」ボタンを押してください。
」`,statisticsProposal:`あなたは国際的な査読に耐えうる「研究方法」および「データ分析計画」の専門アドバイザーです。
提供された研究デザイン、データタイプ、サンプルサイズ、群分けに基づいて、最適な統計解析手法を提案してください。

【重要なルール】
- 冗長な背景説明は避け、要点のみを簡潔に記述すること。

【出力形式（必ずこの形式で記述すること）】
---
📋 分析方法提案

主解析: （分析手法名）
主解析の理由: （簡潔に）

副解析: （分析手法名）
副解析の理由: （簡潔に）

効果量: （Cohen's d等の算出方法）

多変量解析: （必要 or 不要。必要な場合は手法名）

サンプルサイズ概算: （目安と根拠）
---

提案のあとに、必ず以下のメッセージを追加してください：

「
✅ 分析方法の提案がまとまりました！

📌 **次のステップ**: では一旦アプリに戻ってください。
アプリの「回答を貼り付け」エリアに、上記の提案をコピー＆ペーストして「取り込む」ボタンを押してください。
」`,proposalDraft:`あなたは熟練した看護系研究者であり、学術的文章構成の専門家です。
これまでの全情報を統合し、倫理審査委員会（IRB）提出を想定した研究計画書の草案を作成してください。

【構成（必ず以下の全セクションをmarkdown見出しで含めること）】

# 研究計画書

## Ⅰ. 研究背景と文献的考察
- 当該テーマの社会的背景と臨床的重要性を述べる（200字以上）
- 関連する先行研究の動向を整理する（具体的な知見や統計を含める）
- 現状の課題・研究ギャップを明確に述べる
- 本研究の必要性・意義を論じる

## Ⅱ. 研究目的
- 主目的を明確に1〜2文で記述
- 副次的目的がある場合はそれも記述

## Ⅲ. 用語の定義
- 研究で使用する主要な用語を操作的に定義する

## Ⅳ. 研究方法
### 1. 研究デザイン
### 2. 対象者（選定基準・除外基準）
### 3. データ収集方法と測定尺度
### 4. データ分析方法
### 5. サンプルサイズの根拠

## Ⅴ. 倫理的配慮
- インフォームド・コンセント
- 個人情報保護
- 想定されるリスクと対処
- 利益相反

## Ⅵ. 研究スケジュール（概要）

## Ⅶ. 期待される成果と限界

【記述ルール】
- 専門用語には英語表記を括弧内に補う（例：せん妄（delirium））
- 各セクションは具体的かつ十分な量で記述すること（全体で2000字以上を目標）
- 存在確認できない文献は引用せず「出典確認中」と注記する
- markdown形式で出力すること（#, ##, ###, -, ** を使用）`,searchQuerySuggestion:`あなたは医学・看護学領域の専門図書館員および文献検索のエキスパートです。
ユーザーから提供された研究テーマ、リサーチクエスチョン、目的、研究デザインに基づいて、文献レビュー（先行研究の検索）に最適なキーワードと検索式を提案してください。

【実行指示】
1. 日本語および英語の検索キーワードを、それぞれ重要度が高い順に3〜5個抽出してください。
2. 医中誌Webなどの国内データベースで使える日本語の検索式を作成してください。
3. PubMedなどの国際データベースで使える英語の検索式を作成してください。

【出力形式（必ずこの形式で記述すること）】
---
📋 検索キーワード・検索式の提案

🇯🇵 日本語キーワード: （カンマ区切りで列挙）
日本語検索式: （医中誌Web用。AND/ORを使った式）

🌍 英語キーワード: （カンマ区切りで列挙）
英語検索式: （PubMed用。MeSHタームやTitle/Abstract検索を含む）
---

提案のあとに、必ず以下のメッセージを追加してください：

「
✅ 検索キーワードの提案がまとまりました！

📌 **次のステップ**: では一旦アプリに戻ってください。
アプリの「回答を貼り付け」エリアに、上記の提案をコピー＆ペーストして「取り込む」ボタンを押してください。
」`},E={designSelection:JSON.stringify({design:"急性期高齢患者に対する多職種連携退院支援の効果検証：前後比較研究",vision:"現在の属人的な退院支援を標準化し、多職種が共通の評価指標で介入することで、再入院率の低下を目指します。介入前後の比較により、プロトコル導入の効果を明確に測定できます。",finer:{f:"単施設で実現可能。既存の退院支援体制を活用し、追加コストが少ない。",i:"再入院率という明確なアウトカムを設定でき、臨床的インパクトが大きい。",n:"多職種連携の標準化プロトコルに焦点を当てた研究は国内では限定的。",e:"通常診療の範囲内の介入であり、倫理的リスクは低い。",r:"医療費削減と患者QOL向上の両面で社会的ニーズが高い。"},reason:"既存の課題に対し、介入内容が明確で実現可能性が高く、臨床的意義も極めて大きい。国際ジャーナルへの投稿にも十分耐えうるデザインである。"}),rqOverview:JSON.stringify({type:"research",theme:"標準化された多職種退院支援の再入院予防効果",rq:"標準化された多職種連携プロトコルは、急性期病院の高齢患者における30日以内の不適切な再入院を低減させるか？",target:"A病院の急性期病棟に入院中の65歳以上の将来的な退院予定患者",goal:"標準化された多職種連携プロトコルが、30日以内の不適切な再入院を低減できるかを検証すること。",approaches:[{name:"定量的評価",description:"介入導入前後の再入院率の推移を比較分析する。"},{name:"質的評価",description:"退院支援に関わった多職種の連携プロセスにおける促進・阻害要因を抽出する。"},{name:"多角的分析",description:"尺度を用いた患者・家族の満足度調査を併用し、ケアの質を統合的に評価する。"}]}),searchQuerySuggestion:JSON.stringify({keywordsJa:["退院支援","高齢者","再入院","他職種連携","看護師"],keywordsEn:["Patient Discharge","Aged","Patient Readmission","Interprofessional Relations","Nurses"],queryJa:"(退院支援 OR 退院計画 OR 移行ケア) AND (高齢者 OR 後期高齢者) AND (再入院 OR 不予定再入院)",queryEn:'("Patient Discharge"[MeSH Terms] OR "discharge planning"[Title/Abstract] OR "transitional care"[Title/Abstract]) AND ("Aged"[MeSH Terms] OR "elderly"[Title/Abstract]) AND ("Patient Readmission"[MeSH Terms] OR "readmission"[Title/Abstract])'}),literatureReview:JSON.stringify({structure:`### 1. 先行研究の整理
- **多職種連携と再入院率に関する文献**: 過去の介入研究やシステマティックレビューを引き、一般的な効果に触れる。
- **急性期病棟での退院支援の実態に関する文献**: 現場でどのような課題があるのかを整理する。

### 2. 現状の課題とギャップ
- これまでの研究では〇〇という限界があった、など未解明の点を指摘する。
- 特に標準化プロトコルに関する研究の不足を指摘する。

### 3. 本研究の意義と独自性
- この研究によって得られる新しい知見は何か。
- 臨床現場の看護師の負担軽減やアウトカム向上にどう貢献するかを述べる。`}),statisticsProposal:JSON.stringify({primaryAnalysis:{method:"対応のないt検定 / χ²検定",reason:`- 主要アウトカム（再入院の有無）の群間比較にはχ²検定を適用
- 連続変数のベースライン比較にはt検定（正規分布）またはMann-Whitney U検定（非正規分布）を適用`},secondaryAnalyses:[{method:"カプラン・マイヤー法およびログランク検定",reason:"- 再入院までの日数（Time-to-eventデータ）を評価するため"}],effectSize:"主要アウトカムに関して、オッズ比（OR）および95%信頼区間を算出する。",multivariateNeeded:!0,multivariateMethod:"多変量ロジスティック回帰分析",sampleSizeNote:`- 先行研究に基づき、検出力80%、有意水準5%としてサンプルサイズを算出
- 脱落率10%を見込み、各群100例を目標とする`}),proposalDraft:`【研究計画書：最終草案】

Ⅰ. 研究背景
日本の急速な高齢化に伴い、急性期病院からの早期退院と再入院予防（Hospital Readmission Prevention）は、看護実践における最重要課題の一つである...

Ⅱ. 研究目的
標準化された多職種連携退院支援プログラムの導入が、高齢患者の30日以内再入院率に及ぼす影響を検討する。

Ⅲ. 研究方法
...（中略）... STROBEガイドラインに準拠した観察研究として実施する...

Ⅳ. 倫理的配慮
本研究は、施設の倫理審査委員会の承認を得た上で開始される。対象者には研究への参加拒否および中途辞退の権利が完全に保障される。

Ⅴ. 期待される成果
看護師の業務負担を最適化しつつ、患者の安全な在宅移行を実現するためのエビデンスを提示する。`},he="https://gemini.google.com/app";async function fe(e){try{return await navigator.clipboard.writeText(e),!0}catch{const s=document.createElement("textarea");s.value=e,s.style.position="fixed",s.style.opacity="0",document.body.appendChild(s),s.select();try{return document.execCommand("copy"),document.body.removeChild(s),!0}catch{return document.body.removeChild(s),!1}}}function be(){window.open(he,"_blank","noopener,noreferrer")}function T(e){const{prompt:t,containerId:s,label:r="AI回答",expectJson:i=!1,placeholder:n="Geminiからの回答をここに貼り付けてください..."}=e;return`
    <div class="gemini-ui card" id="${s}" style="margin-top: var(--space-5);">
      <div class="gemini-ui-header" style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
        <span style="font-size: 1.5rem;">✨</span>
        <h3 style="margin: 0; font-size: 1.1rem;">${r} — Gemini連携</h3>
      </div>

      <div class="gemini-steps" style="margin-bottom: var(--space-4);">
        <div class="gemini-step" style="display: flex; gap: var(--space-3); align-items: flex-start; margin-bottom: var(--space-4); padding: var(--space-4); background: var(--color-bg-secondary, #f8f9fa); border-radius: var(--radius-md);">
          <div style="min-width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary, #4f46e5); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem;">1</div>
          <div style="flex: 1;">
            <p style="font-weight: 600; margin-bottom: var(--space-2);">プロンプトをコピー</p>
            <div class="gemini-prompt-preview" style="background: var(--color-bg, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius-sm); padding: var(--space-3); margin-bottom: var(--space-3); max-height: 150px; overflow-y: auto; font-size: var(--font-size-sm); white-space: pre-wrap; color: var(--color-text-secondary, #64748b);">${Se(t.substring(0,500))}${t.length>500?`
...(続き)`:""}</div>
            <button class="btn btn-primary btn-sm gemini-copy-btn" data-prompt-target="${s}" style="gap: var(--space-2);">
              📋 プロンプトをコピー
            </button>
            <span class="gemini-copy-feedback" style="margin-left: var(--space-2); color: var(--color-success, #22c55e); font-size: var(--font-size-sm); opacity: 0; transition: opacity 0.3s;"></span>
          </div>
        </div>

        <div class="gemini-step" style="display: flex; gap: var(--space-3); align-items: flex-start; margin-bottom: var(--space-4); padding: var(--space-4); background: var(--color-bg-secondary, #f8f9fa); border-radius: var(--radius-md);">
          <div style="min-width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary, #4f46e5); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem;">2</div>
          <div style="flex: 1;">
            <p style="font-weight: 600; margin-bottom: var(--space-2);">Geminiで相談する</p>
            <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary, #64748b); margin-bottom: var(--space-3);">コピーしたプロンプトをGeminiに貼り付けて回答を取得してください。</p>
            <button class="btn btn-outline btn-sm gemini-open-btn" style="gap: var(--space-2);">
              🚀 Geminiを開く（別タブ）
            </button>
          </div>
        </div>

        <div class="gemini-step" style="display: flex; gap: var(--space-3); align-items: flex-start; padding: var(--space-4); background: var(--color-bg-secondary, #f8f9fa); border-radius: var(--radius-md);">
          <div style="min-width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary, #4f46e5); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem;">3</div>
          <div style="flex: 1;">
            <p style="font-weight: 600; margin-bottom: var(--space-2);">回答を貼り付け</p>
            <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary, #64748b); margin-bottom: var(--space-3);">Geminiの回答をコピーして、下のテキストエリアに貼り付けてください。</p>
            <textarea class="textarea gemini-response-input" id="${s}-response" placeholder="${n}" rows="6" style="width: 100%; box-sizing: border-box;"></textarea>
            <button class="btn btn-primary btn-sm gemini-submit-btn" data-container="${s}" style="margin-top: var(--space-3); gap: var(--space-2);" disabled>
              ✅ 回答を取り込む
            </button>
          </div>
        </div>
      </div>
    </div>
    `}function k(e,t,s,r=!1){const i=e.querySelector(".gemini-copy-btn"),n=e.querySelector(".gemini-open-btn"),o=e.querySelector(".gemini-response-input"),l=e.querySelector(".gemini-submit-btn"),c=e.querySelector(".gemini-copy-feedback");i&&i.addEventListener("click",async()=>{const d=await fe(t);c&&(c.textContent=d?"✅ コピーしました！":"❌ コピーに失敗しました",c.style.opacity="1",setTimeout(()=>{c.style.opacity="0"},2500))}),n&&n.addEventListener("click",()=>{be()}),o&&l&&(o.addEventListener("input",()=>{l.disabled=!o.value.trim()}),l.addEventListener("click",()=>{const d=o.value.trim();if(d)if(r)try{const u=d.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim(),p=JSON.parse(u);s(p,d)}catch{s(null,d)}else s(d,d)}))}function M(){return a.get("demoMode")}function Se(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function $e(e){const t=a.get("seed"),s=t.refinedResult||null;e.innerHTML=`
    <div class="fade-in">
      <h2 class="step-title">🌱 Step 1：種と整理</h2>
      <p class="step-description">
        現場で感じている疑問、課題、あるいは漠然とした仮説を入力してください。Geminiとの対話を通じてそれを整理します。
      </p>

      <div class="card" style="margin-bottom: var(--space-6);">
        
        <!-- 個人情報入力への警告バナー -->
        <div class="alert" style="background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; border-radius: var(--radius-md); padding: var(--space-4); margin-bottom: var(--space-5);">
          <div style="display: flex; gap: var(--space-3); align-items: flex-start;">
            <div style="font-size: 1.25rem;">⚠️</div>
            <div>
              <p style="font-weight: bold; margin-bottom: var(--space-1);">【重要】個人情報を入力しないでください</p>
              <p style="font-size: var(--font-size-sm); margin-bottom: var(--space-2);">
                本アプリでは、研究構想の支援のためにGeminiを利用しています。<br>
                以下に該当する情報は絶対に入力しないでください。
              </p>
              <button class="btn btn-outline btn-sm" id="btnOpenPrivacyModal" style="background-color: white; border-color: #856404; color: #856404;">
                詳細を確認
              </button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="seedQuestion">現場の疑問・課題・違和感</label>
          <textarea id="seedQuestion" class="textarea" placeholder="例：高齢の入院患者が退院後すぐに再入院してしまうケースが多い。退院支援のやり方を変えれば防げるのではないか？">${t.question||""}</textarea>
        </div>

        <button class="btn btn-primary btn-lg" id="btnStartChat" ${t.question?"":"disabled"}>
          🤖 Geminiでブレインストーミングを始める
        </button>
      </div>

      <div id="geminiArea">
        <div class="card">
          <h3 class="section-title">🗣 Geminiとのブレインストーミング</h3>
          <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-3);">
            上のボタンを押すと、あなたの研究の種に合わせたプロンプトが生成されます。<br>
            プロンプトをコピー → Geminiに貼り付け → Geminiの回答をここに戻す、の3ステップで進めます。
          </p>
          <div id="geminiChatUI"></div>
        </div>
      </div>

      <div id="refinedResultArea" class="${s?"":"hidden"}">
        ${s?N(s):""}
      </div>
    </div>

    <!-- 個人情報警告モーダル -->
    <div class="modal-overlay" id="privacyModal">
      <div class="modal" style="max-height: 90vh; display: flex; flex-direction: column;">
        <div class="modal-header">
          <h2>⚠️ 個人情報に関する注意事項</h2>
          <button class="btn-close" id="btnClosePrivacyModal" aria-label="閉じる">&times;</button>
        </div>
        <div class="modal-body" style="overflow-y: auto; padding-right: var(--space-2);">
          <h3 style="color: var(--color-danger); margin-bottom: var(--space-3);">❌ 入力してはいけない情報</h3>
          
          <div style="margin-bottom: var(--space-4);">
            <h4 style="margin-bottom: var(--space-2);">1. 個人を特定できる情報（個人情報）</h4>
            <ul style="padding-left: var(--space-5); list-style-type: disc;">
              <li>氏名（患者名・家族名・職員名）</li>
              <li>イニシャル</li>
              <li>生年月日</li>
              <li>住所</li>
              <li>電話番号</li>
              <li>メールアドレス</li>
              <li>勤務先＋役職</li>
              <li>病院名＋具体的な所属部署</li>
              <li>顔写真や画像</li>
              <li>マイナンバーなどの識別番号</li>
            </ul>
          </div>

          <div style="margin-bottom: var(--space-4);">
            <h4 style="margin-bottom: var(--space-2);">2. 要配慮個人情報（特に慎重に扱う情報）</h4>
            <ul style="padding-left: var(--space-5); list-style-type: disc;">
              <li>病歴</li>
              <li>診断名</li>
              <li>障害の有無</li>
              <li>精神疾患歴</li>
              <li>感染症罹患歴</li>
              <li>宗教・思想</li>
              <li>犯罪歴</li>
              <li>虐待歴</li>
              <li>妊娠歴・不妊治療歴</li>
            </ul>
            <p style="color: var(--color-danger); font-size: var(--font-size-sm); margin-top: var(--space-1);">※単独でも入力しないでください。</p>
          </div>

          <div class="card" style="background-color: #fdf2f2; border-color: #fbd5d5; margin-bottom: var(--space-4);">
            <h4 style="color: #9b1c1c; margin-bottom: var(--space-2);">⚠️ これも「ギリギリアウト」なので注意</h4>
            <p style="font-size: var(--font-size-sm); margin-bottom: var(--space-3);">以下は一見安全に見えますが、組み合わせると個人を特定できる可能性があります。</p>
            <ul style="padding-left: var(--space-5); list-style-type: disc; font-size: var(--font-size-sm); color: #771d1d;">
              <li>「当院ICUで唯一の20代男性看護師」</li>
              <li>「○○市在住の透析患者」</li>
              <li>「昨年心臓移植を受けた70代女性」</li>
              <li>「救急外来で月に1回来るアルコール依存の患者」</li>
              <li>「NICUで体重900gで出生した症例」</li>
              <li>「市内で唯一のALS患者」</li>
            </ul>
            <p style="font-weight: bold; color: #9b1c1c; margin-top: var(--space-3); text-align: center;">👉 "少数・特異・唯一"という情報は特定リスクが高い</p>
          </div>

          <div>
            <h3 style="color: var(--color-success); margin-bottom: var(--space-3);">✅ 推奨入力方法（安全な書き方）</h3>
            <div style="display: grid; gap: var(--space-3);">
              <div style="background-color: #fdf2f2; padding: var(--space-3); border-radius: var(--radius-sm); border-left: 4px solid var(--color-danger);">
                <div style="font-weight: bold; margin-bottom: var(--space-1); color: var(--color-danger);">❌ NG例</div>
                <div>「70代男性で○○市在住、心不全で再入院を繰り返すA氏」</div>
              </div>
              <div style="background-color: #f0fdf4; padding: var(--space-3); border-radius: var(--radius-sm); border-left: 4px solid var(--color-success);">
                <div style="font-weight: bold; margin-bottom: var(--space-1); color: var(--color-success);">⭕️ OK例</div>
                <div>「高齢心不全患者の再入院予防に関する課題」</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;const r=e.querySelector("#seedQuestion"),i=e.querySelector("#btnStartChat"),n=e.querySelector("#privacyModal"),o=e.querySelector("#btnOpenPrivacyModal"),l=e.querySelector("#btnClosePrivacyModal");if(o&&o.addEventListener("click",()=>{n.classList.add("visible")}),l&&l.addEventListener("click",()=>{n.classList.remove("visible")}),n&&n.addEventListener("click",c=>{c.target===n&&n.classList.remove("visible")}),r.addEventListener("input",()=>{a.set("seed.question",r.value),i.disabled=!r.value.trim()}),i.addEventListener("click",()=>{Re(r.value);const c=e.querySelector("#geminiArea");c&&c.scrollIntoView({behavior:"smooth"})}),s){const c=e.querySelector("#refinedResultArea");D(c,s),$("Theme",(s.theme||s.rq||"").substring(0,60)),$("RQ",s.rq||"")}}function Re(e){const t=`${L.rqAssistant}

---

【ユーザーからの研究の種】
${e}`,s=document.querySelector("#geminiChatUI");if(s){if(M()){we();return}s.innerHTML=T({prompt:t,containerId:"geminiChat",label:"ブレインストーミング（研究の種の整理）",expectJson:!1,placeholder:"Geminiが出力した「📋 研究の骨子」をここにコピー＆ペーストしてください..."}),k(s,t,r=>{if(r){const i=r||"";let n=xe(i);if(n||(n=qe(i)),n){a.set("seed.refinedResult",n);const o=document.querySelector("#refinedResultArea");o&&(o.classList.remove("hidden"),o.innerHTML=N(n),D(o,n),o.scrollIntoView({behavior:"smooth"})),$("Theme",(n.theme||n.rq||"").substring(0,60)),$("RQ",n.rq||""),s.innerHTML=`
          <div class="card" style="background: #f0fdf4; border: 1px solid #86efac; text-align: center; padding: var(--space-4);">
            <p style="color: #166534; font-weight: 600; margin: 0;">✅ 研究の骨子を取り込みました。下の内容を確認して次へ進んでください。</p>
          </div>
        `}else alert("骨子の内容を判読できませんでした。Geminiが出力した「📋 研究の骨子」の部分をそのまま貼り付けてください。")}})}}function we(e){const t=JSON.parse(E.rqOverview);a.set("seed.refinedResult",t);const s=document.querySelector("#geminiChatUI");s&&(s.innerHTML=`
      <div class="card" style="background: #f0fdf4; border: 1px solid #86efac; text-align: center; padding: var(--space-4);">
        <p style="color: #166534; font-weight: 600; margin: 0;">✅ デモモード：研究の骨子を自動生成しました。下の内容を確認してください。</p>
      </div>
    `);const r=document.querySelector("#refinedResultArea");r&&(r.classList.remove("hidden"),r.innerHTML=N(t),D(r,t)),$("Theme",(t.theme||t.rq||"").substring(0,60)),$("RQ",t.rq||"")}function xe(e){try{const s=e.replace(/```json\s*\n?/g,"").replace(/```\s*\n?/g,"").trim().match(/\{[\s\S]*\}/);if(s){const r=JSON.parse(s[0]);if(r.rq||r.theme||r.type)return r}}catch{}return null}function qe(e){const t={type:"research",theme:"",rq:"",target:"",goal:"",approaches:[]},s=e.match(/リサーチクエスチョン[（(]?RQ[)）]?\s*[:：]\s*(.+?)(?:\n|$)/i)||e.match(/RQ\s*[:：]\s*(.+?)(?:\n|$)/i);s&&(t.rq=s[1].trim());const r=e.match(/研究デザイン\s*[:：]\s*(.+?)(?:\n|$)/);r&&(t.theme=r[1].trim());const i=e.match(/対象\s*[:：]\s*(.+?)(?:\n|$)/);i&&(t.target=i[1].trim());const n=e.match(/最終ゴール\s*[:：]\s*(.+?)(?:\n|$)/);n&&(t.goal=n[1].trim()),!t.theme&&t.rq&&(t.theme=t.rq.replace(/[？?]$/,"").substring(0,60));const o=e.matchAll(/(?:量的|質的|STEP\s*\d+|フェーズ)[^:：]*[:：]\s*([\s\S]*?)(?=(?:量的|質的|STEP\s*\d+|フェーズ|最終ゴール|---|\n\n|$))/gi);for(const l of o){const c=l[0].trim(),d=c.match(/^(.+?)[:：]/);d&&t.approaches.push({name:d[1].trim(),description:c.substring(d[0].length).trim().replace(/\n/g," ").substring(0,200)})}return t.rq?t:e.trim().length>30?(t.rq=e.trim().split(`
`)[0].substring(0,200),t.goal=e.trim(),t):null}function N(e){const t=a.get("seed.rqConfirmed"),s={research:{title:"リサーチクエスチョン",badge:"学術研究"},practice:{title:"実践報告の焦点",badge:"実践報告"},qi:{title:"QIプロジェクト目標",badge:"質改善"}},r=s[e.type]||s.research;return`
    <div class="ai-response expert-view" style="margin-top: var(--space-6);">
      <div class="ai-response-header">
        <span class="badge recommended">${r.badge}として整理完了</span>
        整理された研究の骨子
      </div>
      <div class="ai-response-body">
        <p class="text-muted" style="margin-bottom: var(--space-4); font-size: 0.9rem;">
          取り込まれた内容を確認してください。RQは必要に応じて編集できます。内容がよければ「このRQで確定する」ボタンを押して次へ進んでください。
        </p>
        <div class="format-block">
          <div class="format-row" style="flex-direction: column; align-items: stretch; gap: var(--space-2); margin-bottom: var(--space-4);">
            <span class="format-label">${r.title}:</span>
            <textarea id="refinedRqInput" class="textarea input-rq" style="min-height: 80px; width: 100%; box-sizing: border-box; overflow: hidden; resize: none; font-size: 0.95rem; line-height: 1.6;" ${t?"readonly":""}>${e.rq||e.title||""}</textarea>
          </div>
          <div class="format-row" style="margin-bottom: var(--space-4);">
            <span class="format-label">テーマ:</span>
            <span class="format-value"><strong>${e.theme||e.title||"未設定"}</strong></span>
          </div>
          <div class="format-row mt-4">
            <span class="format-label">対象:</span>
            <span class="format-value">${e.target||"未設定"}</span>
          </div>
          <div class="format-row">
            <span class="format-label">ゴール:</span>
            <span class="format-value">${e.goal||"未設定"}</span>
          </div>
          ${e.approaches&&e.approaches.length>0?`
          <div style="margin-top: var(--space-4);">
            <span class="format-label">アプローチ:</span>
            <ul style="margin-top: var(--space-2); padding-left: var(--space-5);">
              ${e.approaches.map(i=>`<li><strong>${i.name}</strong>: ${i.description}</li>`).join("")}
            </ul>
          </div>
          `:""}
        </div>
        
        <div style="margin-top: var(--space-5); text-align: center;">
          <button class="btn ${t?"btn-secondary":"btn-primary"}" id="btnConfirmRq" ${t?"disabled":""}>
            ${t?"✓ 確定済み — 次のステップへ進めます":"✨ このRQで確定する"}
          </button>
        </div>
      </div>
    </div>
  `}function $(e,t){const s=document.querySelector(`#sum${e}`);s&&(s.textContent=t,s.classList.add("active"))}function Le(){return!!a.get("seed.refinedResult")&&!!a.get("seed.rqConfirmed")}function D(e,t){const s=e.querySelector("#btnConfirmRq"),r=e.querySelector("#refinedRqInput");if(!s||!r)return;const i=()=>{r.style.height="auto",r.style.height=Math.max(80,r.scrollHeight+2)+"px"};requestAnimationFrame(i),setTimeout(i,100),r.addEventListener("input",i),s.addEventListener("click",()=>{r.value.trim()&&(t.rq=r.value.trim(),a.set("seed.refinedResult",t),a.set("seed.rqConfirmed",!0),$("Theme",(t.theme||t.title||t.rq).substring(0,60)),$("RQ",t.rq),e.innerHTML=N(t),D(e,t))})}function Ee(e){const t=a.get("rq"),s=a.get("seed.refinedResult");if(!s){e.innerHTML=`
      <div class="fade-in">
        <h2 class="step-title">📋 Step 2：デザイン案</h2>
        <div class="card" style="text-align: center; padding: var(--space-12);">
          <p class="text-muted">先にStep 1で「整理された骨子」を完成させてください。</p>
          <button class="btn btn-primary mt-4" onclick="document.querySelector('[data-step=\\'1\\']').click()">Step 1へ戻る</button>
        </div>
      </div>
    `;return}const r=t.aiResults,i=t.proposalHistory||[],n=t.selectedDesign;e.innerHTML=`
    <div class="fade-in">
      <h2 class="step-title">📋 Step 2：研究デザイン提案</h2>
      <p class="step-description">
        整理された骨子に基づき、FINER基準に準拠した最適な研究デザインを提案します。
      </p>

      <div class="card highlight-card" style="margin-bottom: var(--space-6);">
        <div class="format-row">
          <span class="format-label">テーマ:</span>
          <span class="format-value"><strong>${s.theme||s.title||"未設定"}</strong></span>
        </div>
        <div class="format-row" style="margin-top: var(--space-2);">
          <span class="format-label">リサーチクエスチョン:</span>
          <span class="format-value"><strong>${s.rq||s.title||"未設定"}</strong></span>
        </div>
        <div class="format-row">
          <span class="format-label">対象:</span>
          <span class="format-value">${s.target}</span>
        </div>
      </div>

      <div id="designProposalArea">
        ${r?_(r,n,i):`
          <div style="text-align: center; padding: var(--space-8);">
            <button class="btn btn-primary btn-lg" id="btnGenerateDesign">
              🤖 最適な研究デザインを提案してもらう
            </button>
          </div>
        `}
      </div>
    </div>
  `;const o=e.querySelector("#btnGenerateDesign");o?o.addEventListener("click",()=>ce(!1)):r&&Q(e)}function ce(e=!1){const t=a.get("seed.refinedResult"),s=a.get("rq.proposalHistory")||[],r=a.get("rq.aiResults");let i=`
整理されたリサーチクエスチョン: ${t.rq||t.title||"未設定"}
対象: ${t.target||"未設定"}
ゴール: ${t.goal||"未設定"}
アプローチ例: ${(t.approaches||[]).map(l=>l.name).join(", ")}
  `.trim();if(e&&(r||s.length>0)){const l=[];s.forEach(c=>l.push(c.design)),r&&l.push(r.design),i+=`

【重要】以下の研究デザインはすでに提案済みです。これらとは異なる視点・方法論の研究デザインを提案してください：
${l.map((c,d)=>`${d+1}. ${c}`).join(`
`)}`}const n=`${L.designSelection}

---

${i}`;if(M()){const l=JSON.parse(E.designSelection);if(e&&r){const d=[...s,r];a.set("rq.proposalHistory",d)}a.set("rq.aiResults",l),a.set("rq.selectedDesign",null);const c=document.querySelector("#designProposalArea");if(c){const d=a.get("rq.proposalHistory")||[];c.innerHTML=_(l,null,d),Q(c)}return}const o=document.querySelector("#designProposalArea");o&&(o.innerHTML=T({prompt:n,containerId:"geminiDesign",label:"研究デザイン提案",expectJson:!1,placeholder:"Geminiが出力した「📋 研究デザイン提案」をここにコピー＆ペーストしてください..."}),k(o,n,(l,c)=>{const d=c||l||"";let u=null;try{const m=d.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim().match(/\{[\s\S]*"design"\s*:[\s\S]*\}/);if(m){const g=JSON.parse(m[0]);u=Te(g)}}catch{}if(u||(u=ke(d)),u){if(e&&r){const m=[...s,r];a.set("rq.proposalHistory",m)}a.set("rq.aiResults",u),a.set("rq.selectedDesign",null);const p=a.get("rq.proposalHistory")||[];o.innerHTML=_(u,null,p),Q(o)}else alert("提案内容を判読できませんでした。Geminiが出力した「📋 研究デザイン提案」の部分をそのまま貼り付けてください。")}))}function Te(e){return Array.isArray(e)&&(e=e[0]),e.proposals&&(e=e.proposals[0]),{design:e.design||e.title||e.name||"デザイン提案",vision:e.vision||e.description||e.overview||"",finer:e.finer||{},reason:e.reason||e.recommendation||e.rationale||""}}function ke(e){const t={design:"",vision:"",finer:{},reason:""},s=e.match(/推奨デザイン\s*[:：]\s*(.+?)(?:\n|$)/);s&&(t.design=s[1].trim());const r=e.match(/研究のビジョン\s*[:：]\s*([\s\S]*?)(?=(?:FINER|推奨理由|---|$))/);r&&(t.vision=r[1].trim());const i=e.match(/実現可能性[（(]?F[)）]?\s*[:：]\s*(.+?)(?:\n|$)/);i&&(t.finer.f=i[1].trim());const n=e.match(/面白さ[（(]?I[)）]?\s*[:：]\s*(.+?)(?:\n|$)/);n&&(t.finer.i=n[1].trim());const o=e.match(/新規性[（(]?N[)）]?\s*[:：]\s*(.+?)(?:\n|$)/);o&&(t.finer.n=o[1].trim());const l=e.match(/倫理性[（(]?E[)）]?\s*[:：]\s*(.+?)(?:\n|$)/);l&&(t.finer.e=l[1].trim());const c=e.match(/関連性[（(]?R[)）]?\s*[:：]\s*(.+?)(?:\n|$)/);c&&(t.finer.r=c[1].trim());const d=e.match(/推奨理由\s*[:：]\s*([\s\S]*?)(?=(?:---|✅|📌|$))/);return d&&(t.reason=d[1].trim()),!t.design&&e.trim().length>30&&(t.design=e.trim().split(`
`)[0].substring(0,100)),t.design?t:null}function _(e,t,s){const r=t===e.design,i=Me(e.finer);let n="";return s.length>0&&(n=`
      <div class="card" style="margin-top: var(--space-6); background: var(--color-bg-secondary, #f8f9fa);">
        <h4 style="margin-bottom: var(--space-3); font-size: 0.9rem; color: var(--color-text-secondary);">
          📁 過去の提案（${s.length}件）
        </h4>
        <p class="small text-muted" style="margin-bottom: var(--space-3);">以前の提案を採用したい場合はクリックしてください。</p>
        <div class="history-list">
          ${s.map((o,l)=>`
            <div class="history-item ${t===o.design?"selected":""}" data-history-index="${l}" data-design="${w(o.design)}">
              <span class="history-number">${l+1}</span>
              <span class="history-title">${w(o.design)}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `),`
    <div class="ai-response">
      <div class="ai-response-header">🤖 熟練研究者による研究デザイン提案</div>
      <div class="ai-response-body">
        <p class="mb-4">最新の知見と研究の意義に基づき、FINER基準に準拠した最適な研究デザインを提案します。</p>
        
        <div class="proposal-card main-proposal ${r?"selected":""}" data-design="${w(e.design)}" data-is-current="true">
          <div class="proposal-header">
            <span class="badge recommended">★ 推奨デザイン</span>
          </div>
          
          <h3 class="proposal-title">${w(e.design)}</h3>
          
          ${e.vision?`
            <div class="proposal-section">
              <h4>🔭 研究のビジョン</h4>
              <p>${w(e.vision)}</p>
            </div>
          `:""}

          ${i}
          
          ${e.reason?`
            <div class="proposal-section mt-2">
              <h4>📝 推奨理由</h4>
              <p class="small text-muted">${w(e.reason)}</p>
            </div>
          `:""}
          
          <div class="select-hint">${r?"✅ 選択済み — クリックで選択解除":"クリックしてこのデザインを採用"}</div>
        </div>

        <div style="text-align: center; margin-top: var(--space-6);">
          <p class="small text-muted" style="margin-bottom: var(--space-3);">このデザインがしっくりこない場合は、別の視点から再提案できます。</p>
          <button class="btn btn-outline" id="btnAlternativeDesign" style="font-size: 0.9rem;">
            🔄 別の視点でデザインを提案してもらう
          </button>
        </div>
      </div>
    </div>

    ${n}

    <div class="card" style="margin-top: var(--space-6);">
      <h3 class="section-title">✍️ 自分で研究デザインを選択する</h3>
      <p class="text-muted" style="margin-bottom: var(--space-4);">AIの提案がイメージと違う場合、以下のリストから自分で研究デザイン（研究タイプ）を選択できます。</p>
      
      <div class="form-group">
        <label for="manualDesignSelect">研究タイプを選択</label>
        <select id="manualDesignSelect" class="select" style="max-width: 400px;">
          <option value="">（選択してください）</option>
          <option value="介入研究" ${t==="介入研究"?"selected":""}>介入研究（RCTなど）</option>
          <option value="観察研究" ${t==="観察研究"?"selected":""}>観察研究（コホート・横断など）</option>
          <option value="質的研究" ${t==="質的研究"?"selected":""}>質的研究（インタビューなど）</option>
          <option value="QI（質改善）" ${t==="QI（質改善）"?"selected":""}>QI（質改善プロジェクト）</option>
          <option value="事例／実践報告" ${t==="事例／実践報告"?"selected":""}>事例／実践報告</option>
          <option value="システマティックレビュー" ${t==="システマティックレビュー"?"selected":""}>システマティックレビュー</option>
          <option value="スコーピングレビュー" ${t==="スコーピングレビュー"?"selected":""}>スコーピングレビュー</option>
          <option value="混合研究法" ${t==="混合研究法"?"selected":""}>混合研究法</option>
        </select>
        <p class="hint">これを選択すると、AIの提案ではなくここで選んだデザインが採用されます。</p>
      </div>
    </div>
  `}function Me(e){if(!e||Object.keys(e).length===0)return"";const s=Object.entries({f:{icon:"✅",label:"実現可能性"},i:{icon:"💡",label:"面白さ"},n:{icon:"🆕",label:"新規性"},e:{icon:"🛡️",label:"倫理性"},r:{icon:"🎯",label:"関連性"}}).map(([r,i])=>{const n=e[r];return!n||n===!0?"":`
      <div class="finer-detail-row">
        <span class="finer-label">${i.icon} ${i.label}</span>
        <span class="finer-value">${w(String(n))}</span>
      </div>
    `}).filter(r=>r).join("");return s?`
    <div class="proposal-section finer-details">
      <h4>📊 FINER基準評価</h4>
      ${s}
    </div>
  `:""}function w(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}function Q(e){const t=e.querySelector('.proposal-card[data-is-current="true"]');t&&t.addEventListener("click",()=>{const i=t.dataset.design,n=a.get("rq.selectedDesign"),o=e.querySelector("#manualDesignSelect");n===i?(a.set("rq.selectedDesign",null),t.classList.remove("selected"),t.querySelector(".select-hint").textContent="クリックしてこのデザインを採用"):(e.querySelectorAll(".proposal-card, .history-item").forEach(l=>l.classList.remove("selected")),t.classList.add("selected"),a.set("rq.selectedDesign",i),t.querySelector(".select-hint").textContent="✅ 選択済み — クリックで選択解除",o&&(o.value="")),H("Design",a.get("rq.selectedDesign")||"")}),e.querySelectorAll(".history-item").forEach(i=>{i.addEventListener("click",()=>{const n=i.dataset.design,o=a.get("rq.selectedDesign"),l=e.querySelector("#manualDesignSelect");if(o===n)a.set("rq.selectedDesign",null),i.classList.remove("selected");else{e.querySelectorAll(".proposal-card, .history-item").forEach(d=>d.classList.remove("selected")),i.classList.add("selected"),a.set("rq.selectedDesign",n);const c=e.querySelector('.proposal-card[data-is-current="true"] .select-hint');c&&(c.textContent="クリックしてこのデザインを採用"),l&&(l.value="")}H("Design",a.get("rq.selectedDesign")||"")})});const s=e.querySelector("#manualDesignSelect");s&&s.addEventListener("change",i=>{const n=i.target.value;if(n){e.querySelectorAll(".proposal-card, .history-item").forEach(l=>l.classList.remove("selected"));const o=e.querySelector('.proposal-card[data-is-current="true"] .select-hint');o&&(o.textContent="クリックしてこのデザインを採用"),a.set("rq.selectedDesign",n)}else a.set("rq.selectedDesign",null);H("Design",a.get("rq.selectedDesign")||"")});const r=e.querySelector("#btnAlternativeDesign");r&&r.addEventListener("click",i=>{i.stopPropagation(),ce(!0)})}function H(e,t){const s=document.querySelector(`#sum${e}`);s&&(s.textContent=t,s.classList.add("active"))}function Ae(){return!!a.get("rq.selectedDesign")}const I={介入研究:{name:"CONSORT",full:"Consolidated Standards of Reporting Trials",desc:"ランダム化比較試験(RCT)の報告基準"},横断研究:{name:"STROBE",full:"Strengthening the Reporting of Observational Studies in Epidemiology",desc:"観察研究の報告基準"},"実態調査（記述研究/Descriptive Study）":{name:"STROBE",full:"Strengthening the Reporting of Observational Studies in Epidemiology",desc:"観察研究の報告基準"},観察研究:{name:"STROBE",full:"Strengthening the Reporting of Observational Studies in Epidemiology",desc:"観察研究の報告基準"},"QI（質改善/Quality Improvement）":{name:"SQUIRE 2.0",full:"Standards for QUality Improvement Reporting Excellence",desc:"質改善研究の報告基準"},"QI（質改善）":{name:"SQUIRE 2.0",full:"Standards for QUality Improvement Reporting Excellence",desc:"質改善研究の報告基準"},質的研究:{name:"COREQ",full:"Consolidated Criteria for Reporting Qualitative Research",desc:"質的研究の報告基準"},探索的研究:{name:"COREQ",full:"Consolidated Criteria for Reporting Qualitative Research",desc:"質的研究の報告基準"},スコーピングレビュー:{name:"PRISMA-ScR",full:"Preferred Reporting Items for Systematic reviews and Meta-Analyses extension for Scoping Reviews",desc:"スコーピングレビューの報告基準"},システマティックレビュー:{name:"PRISMA 2020",full:"Preferred Reporting Items for Systematic Reviews and Meta-Analyses",desc:"システマティックレビュー・メタアナリシスの報告基準"},混合研究法:{name:"GRAMMS",full:"Good Reporting of A Mixed Methods Study",desc:"混合研究法の報告基準"},前後比較研究:{name:"STROBE",full:"Strengthening the Reporting of Observational Studies in Epidemiology",desc:"観察研究の報告基準"},"事例／実践報告":{name:"CARE",full:"CAse REport Guidelines",desc:"症例報告の報告基準"}},G={CONSORT:["タイトルに「ランダム化」を含む","構造化された抄録","科学的背景と根拠の説明","具体的な目的・仮説","試験デザインの記述","適格基準の記述","セッティングとデータ収集場所","介入の詳細（再現可能な程度に）","完全に定義されたアウトカム","サンプルサイズの決定方法","ランダム化の手順","割付の隠蔽化","盲検化の記述","統計手法の記述","参加者のフロー図","ベースライン特性の表","各群の結果（効果量と精度）","有害事象の報告","限界、一般化可能性、解釈","試験登録番号"],STROBE:["研究デザインの明示","セッティング・期間・参加者","変数の定義","データソース・測定方法","バイアスへの対処","サンプルサイズの根拠","統計手法の記述","参加者の流れの記述","記述的データの提示","主要結果（粗結果と調整結果）","主要所見の要約","限界の考察","一般化可能性","資金源の開示"],"SQUIRE 2.0":["タイトルに質改善手法を明記","背景と改善の必要性","具体的な改善目標","改善活動の文脈","介入の理論的根拠","倫理的側面の考慮","改善方法のフレームワーク","指標の定義","プロセスとアウトカムの測定","分析方法","結果の記述（ランチャート等）","考察と学びの共有"],COREQ:["研究チームと反射性","研究デザインの理論的枠組み","参加者の選定方法","セッティングの記述","データ収集方法の詳細","インタビューガイドの記述","データの飽和","データ分析方法","信頼性と信用性の確保","主要カテゴリまたはテーマ","参加者の引用"],"PRISMA-ScR":["タイトルにスコーピングレビューを明記","レビューの目的・RQ","適格基準","情報源とデータベース","検索戦略","スクリーニングプロセス","データの抽出方法","結果の要約","エビデンスのマッピング"],"PRISMA 2020":["構造化された抄録","登録番号・プロトコル","適格基準","情報源","検索戦略","研究の選択プロセス","データ抽出プロセス","バイアスリスク評価","エビデンスの確実性","結果の統合方法","フロー図の提示"],GRAMMS:["混合研究法の根拠","研究デザインの記述","量的・質的研究の各方法","統合のタイミングと方法","各要素の限界","統合から得られた洞察"],CARE:["患者情報・背景","臨床所見","タイムライン","診断的評価","治療介入","フォローアップと転帰","考察（学びのポイント）"]},Oe=[{type:"介入研究",guideline:"CONSORT",recommendFor:["research"]},{type:"観察研究",guideline:"STROBE",recommendFor:["research"]},{type:"QI（質改善）",guideline:"SQUIRE 2.0",recommendFor:["qi"]},{type:"質的研究",guideline:"COREQ",recommendFor:["research"]},{type:"スコーピングレビュー",guideline:"PRISMA-ScR",recommendFor:[]},{type:"システマティックレビュー",guideline:"PRISMA 2020",recommendFor:[]},{type:"混合研究法",guideline:"GRAMMS",recommendFor:[]},{type:"事例／実践報告",guideline:"CARE",recommendFor:["practice"]}];function Ie(e){var o;const t=a.get("rq.selectedDesign")||"",s=re(t),r=((o=a.get("seed.refinedResult"))==null?void 0:o.type)||"";s&&a.set("guideline.selected",s.name);const i=G[s==null?void 0:s.name]||[],n=a.get("guideline.notes")||{};e.innerHTML=`
    <div class="fade-in">
      <h2 class="step-title">📑 Step 3：ガイドライン選択</h2>
      <p class="step-description">
        研究デザインに基づいて、準拠すべき報告ガイドラインを選択します。
        下の表から研究タイプをクリックして選んでください。${r?"★マークは Step 1 の結果に基づく推奨です。":""}
      </p>

      <!-- Guideline mapping table -->
      <div class="card" style="margin-bottom: var(--space-6);">
        <h3 class="section-title">📊 研究タイプとガイドライン対応表</h3>
        <p class="hint" style="margin-bottom: var(--space-4);">行をクリックして研究デザインを選択してください</p>
        <table class="data-table data-table-selectable" id="designTable">
          <thead>
            <tr>
              <th>研究タイプ</th>
              <th>準拠ガイドライン</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${Oe.map(l=>{const c=(s==null?void 0:s.name)===l.guideline&&t===l.type,d=r&&l.recommendFor.includes(r);return`
              <tr class="${c?"selected-row":""} ${d?"recommended-row":""}"
                  data-type="${l.type}" data-guideline="${l.guideline}">
                <td>
                  ${d?'<span class="tag tag-recommend">★ 推奨</span> ':""}${l.type}
                </td>
                <td>${l.guideline}</td>
                <td style="text-align: center;">${c?'<span class="tag tag-primary">✓ 選択中</span>':""}</td>
              </tr>
            `}).join("")}
          </tbody>
        </table>

        ${r?Ne(r):""}
      </div>

      <div id="guidelineDetailArea">
        ${s?se(s,i,n):`
          <div class="card" style="text-align: center; padding: var(--space-12);">
            <p style="color: var(--color-text-muted);">上の表から研究タイプを選択してください。</p>
          </div>
        `}
      </div>
    </div>
  `,s&&ne(s.name),e.querySelectorAll("#designTable tbody tr").forEach(l=>{l.addEventListener("click",()=>{const c=l.dataset.type;l.dataset.guideline,a.set("rq.selectedDesign",c),a.set("guideline.checklist",[]),a.set("guideline.notes",{});const d=I[c]||re(c);d&&a.set("guideline.selected",d.name),e.querySelectorAll("#designTable tbody tr").forEach(p=>{p.classList.remove("selected-row");const m=p.querySelector("td:last-child");m&&(m.innerHTML="")}),l.classList.add("selected-row");const u=l.querySelector("td:last-child");if(u&&(u.innerHTML='<span class="tag tag-primary">✓ 選択中</span>'),d){const p=e.querySelector("#guidelineDetailArea"),m=G[d.name]||[];p.innerHTML=se(d,m,{}),ie(e),ne(d.name)}De("Design",c)})}),ie(e)}function se(e,t,s){const r=Object.values(s).filter(i=>i&&i.trim()).length;return`
    <div class="guideline-card">
      <div class="guideline-card-header">
        <h3>${e.name}</h3>
        <p>${e.full}</p>
        <p style="margin-top: var(--space-2); font-size: var(--font-size-xs);">${e.desc}</p>
      </div>
      <div class="checklist" id="guidelineChecklist">
        <h4 style="padding: var(--space-3) 0; font-weight: 700;">チェックリスト <span class="checklist-progress">${r} / ${t.length} 項目入力済み</span></h4>
        <p class="hint" style="margin-bottom: var(--space-3);">考えがある項目はメモを入力してください。未入力の項目は文献レビューで補完します。</p>
        ${t.map((i,n)=>{const o=s[n]||"",l=o.trim().length>0;return`
          <div class="checklist-item-note ${l?"has-note":""}">
            <div class="checklist-item-header">
              <div class="checklist-check ${l?"checked":""}" data-index="${n}">
                ${l?"✓":""}
              </div>
              <span class="checklist-label">${i}</span>
            </div>
            <textarea class="checklist-note-input" data-index="${n}" 
              placeholder="現時点の考え・方針があればメモしてください（未入力でもOK）"
              rows="1">${o}</textarea>
          </div>
        `}).join("")}
      </div>
    </div>
  `}function ie(e){e.querySelectorAll(".checklist-note-input").forEach(t=>{t.value&&(t.style.height="auto",t.style.height=Math.min(t.scrollHeight,120)+"px"),t.addEventListener("input",()=>{const s=t.dataset.index,r=t.value,i=a.get("guideline.notes")||{};i[s]=r,a.set("guideline.notes",i);const n=t.closest(".checklist-item-note"),o=n.querySelector(".checklist-check");r.trim()?(n.classList.add("has-note"),o.classList.add("checked"),o.textContent="✓"):(n.classList.remove("has-note"),o.classList.remove("checked"),o.textContent=""),t.style.height="auto",t.style.height=Math.min(t.scrollHeight,120)+"px",Ce(e);const l=Object.entries(i).filter(([,c])=>c&&c.trim()).map(([c])=>parseInt(c));a.set("guideline.checklist",l)})})}function Ce(e){const t=a.get("guideline.notes")||{},s=Object.values(t).filter(n=>n&&n.trim()).length,r=e.querySelectorAll(".checklist-note-input").length,i=e.querySelector(".checklist-progress");i&&(i.textContent=`${s} / ${r} 項目入力済み`)}function ne(e){const t=document.querySelector("#sumGuideline");t&&(t.textContent=e,t.classList.add("active"))}function Ne(e){const s={research:{icon:"🔬",title:"学術研究として整理されました",designs:"介入研究・観察研究・質的研究",reason:"Step 1 の対話から、仮説の検証や新たな知見の発見を目的とした学術研究と判断しました。研究の目的や方法に応じて、介入研究（RCT等）、観察研究（横断・コホート等）、質的研究（インタビュー・参与観察等）のいずれかを選択してください。"},qi:{icon:"📈",title:"質改善（QI）プロジェクトとして整理されました",designs:"QI（質改善）",reason:"Step 1 の対話から、現場の業務プロセスやケアの質を改善することが主目的と判断しました。QIプロジェクトでは SQUIRE 2.0 ガイドラインに沿って報告することが推奨されています。"},practice:{icon:"📝",title:"実践報告として整理されました",designs:"事例／実践報告",reason:"Step 1 の対話から、臨床での実践経験や症例を共有・報告することが主目的と判断しました。事例報告では CARE ガイドラインに沿って構造化することで、読者にとって再現可能で学びの多い報告になります。"}}[e];return s?`
    <div class="recommend-reason" style="margin-top: var(--space-4);">
      <div class="recommend-reason-header">
        <span>${s.icon}</span>
        <strong>${s.title}</strong>
      </div>
      <div class="recommend-reason-body">
        <p><strong>推奨デザイン：</strong>${s.designs}</p>
        <p>${s.reason}</p>
      </div>
    </div>
  `:""}function re(e){if(!e)return null;if(I[e])return I[e];for(const[t,s]of Object.entries(I))if(e.includes(t)||t.includes(e))return s;return I.横断研究}function De(e,t){const s=document.querySelector(`#sum${e}`);s&&(s.textContent=t,s.classList.add("active"))}function ze(){return!!a.get("guideline.selected")}function Pe(e){return G[e]||[]}function He(e){const t=a.get("review");e.innerHTML=`
    <div class="fade-in">
      <h2 class="step-title">📚 Step 4：研究背景と意義の構築</h2>
      <p class="step-description">
        先行研究の整理から研究の必要性、独自性までを論理的に構築します。
      </p>

      <div class="card" style="margin-bottom: var(--space-6);">
        <div style="margin-bottom: var(--space-6); padding-bottom: var(--space-4); border-bottom: 1px dashed var(--color-border);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-3);">
            <div>
              <h3 style="font-size: 1rem; margin-bottom: var(--space-1);">💡 検索キーワード・式の自動提案</h3>
              <p class="hint">これまでの入力内容から、文献検索に最適なキーワードと検索式を提案します。</p>
            </div>
            <button class="btn btn-secondary btn-sm" id="btnSuggestQueries">
              🤖 提案してもらう
            </button>
          </div>
          
          <div id="suggestedQueriesArea" style="display: none;">
            <!-- 提案結果がここに表示される -->
          </div>
        </div>

        <div class="form-group">
          <label for="reviewKeywords">キーワード・関連テーマ <span style="font-size: 0.8rem; font-weight: normal; color: var(--color-text-muted);">（上記で提案されたものをコピーするか、手入力してください）</span></label>
          <input type="text" id="reviewKeywords" class="input"
                 placeholder="例：退院支援 高齢者 再入院"
                 value="${t.keywords||""}" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
          <div class="form-group">
            <label for="reviewLang">文献の対象範囲</label>
            <select id="reviewLang" class="select">
              <option value="ja+en" ${t.language==="ja+en"?"selected":""}>国内・国際の両方</option>
              <option value="en" ${t.language==="en"?"selected":""}>国際（英語）のみ</option>
              <option value="ja" ${t.language==="ja"?"selected":""}>国内（日本語）のみ</option>
            </select>
          </div>

          <div class="form-group">
            <label for="reviewContext">重視する視点</label>
            <select id="reviewContext" class="select">
              <option value="academic" ${t.context==="academic"?"selected":""}>学術的・論理的整合性</option>
              <option value="clinical" ${t.context==="clinical"?"selected":""}>臨床上の喫緊の課題</option>
              <option value="ethical" ${t.context==="ethical"?"selected":""}>倫理・人権の観点</option>
            </select>
          </div>
        </div>

        <button class="btn btn-primary btn-lg" id="btnReview">
          🖋 背景・意義の論理構成を生成
        </button>
      </div>

      <div id="step4Results">
        ${t.aiResult?J(t.aiResult):""}
      </div>
    </div>
  `;const s=e.querySelector("#reviewKeywords"),r=e.querySelector("#reviewLang"),i=e.querySelector("#reviewContext");s.addEventListener("input",()=>a.set("review.keywords",s.value)),r.addEventListener("change",()=>a.set("review.language",r.value)),i==null||i.addEventListener("change",()=>a.set("review.context",i.value)),e.querySelector("#btnReview").addEventListener("click",Qe);const n=e.querySelector("#btnSuggestQueries");n&&n.addEventListener("click",_e),t.suggestedQueries&&j(t.suggestedQueries)}function _e(){const e=document.querySelector("#suggestedQueriesArea");if(!e)return;const t=a.get("seed.refinedResult"),s=(t==null?void 0:t.rq)||(t==null?void 0:t.title)||"",r=(t==null?void 0:t.goal)||"",i=(t==null?void 0:t.goal)||"",n=a.get("rq.selectedDesign")||"",o=`
研究テーマ: ${s}
リサーチクエスチョン: ${r}
研究の目的: ${i}
研究デザイン: ${n}
  `.trim(),l=`${L.searchQuerySuggestion}

---

${o}`;if(M()){const c=JSON.parse(E.searchQuerySuggestion);a.set("review.suggestedQueries",c),j(c);const d=document.querySelector("#reviewKeywords");if(d&&!d.value.trim()&&c.keywordsJa){const u=c.keywordsJa.join(" ");d.value=u,a.set("review.keywords",u)}return}e.style.display="block",e.innerHTML=T({prompt:l,containerId:"geminiSuggest",label:"検索キーワード・式の提案",expectJson:!1,placeholder:"Geminiが出力した「📋 検索キーワード」をここにコピー＆ペーストしてください..."}),k(e,l,(c,d)=>{const u=d||c||"";let p=null;try{const g=u.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim().match(/\{[\s\S]*"keywordsJa"[\s\S]*\}/);g&&(p=JSON.parse(g[0]))}catch{}if(p||(p=je(u)),p){a.set("review.suggestedQueries",p),j(p);const m=document.querySelector("#reviewKeywords");if(m&&!m.value.trim()&&p.keywordsJa){const v=(Array.isArray(p.keywordsJa)?p.keywordsJa:[p.keywordsJa]).join(" ");m.value=v,a.set("review.keywords",v)}}else e.innerHTML=`
        <div class="card" style="border-color: var(--color-danger);">
          <p style="color: var(--color-danger);">⚠️ 回答を判読できませんでした。Geminiの回答をそのまま貼り付けてください。</p>
        </div>
      `})}function j(e){const t=document.querySelector("#suggestedQueriesArea");t&&(t.style.display="block",t.innerHTML=`
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); background: var(--color-primary-bg); padding: var(--space-4); border-radius: var(--radius-sm); border: 1px solid var(--color-primary-border);">
      <!-- 日本語 -->
      <div style="background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
        <h4 style="font-size: 0.9rem; margin-bottom: var(--space-2); color: var(--color-primary-dark);">🇯🇵 医中誌Web用（日本語）</h4>
        <div style="margin-bottom: var(--space-2);">
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">推奨キーワード:</span><br>
          <span style="font-size: 0.9rem; font-weight: 500;">${(e.keywordsJa||[]).join(", ")}</span>
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">検索式（コピーして使えます）:</span>
          <textarea readonly class="input" style="font-family: monospace; font-size: 0.8rem; padding: var(--space-2); min-height: 60px; background: var(--color-bg); margin-top: var(--space-1); resize: none;" onclick="this.select()">${e.queryJa||""}</textarea>
        </div>
      </div>
      
      <!-- 英語 -->
      <div style="background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
        <h4 style="font-size: 0.9rem; margin-bottom: var(--space-2); color: var(--color-primary-dark);">🌍 PubMed用（英語）</h4>
        <div style="margin-bottom: var(--space-2);">
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">推奨キーワード:</span><br>
          <span style="font-size: 0.9rem; font-weight: 500;">${(e.keywordsEn||[]).join(", ")}</span>
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">検索式（コピーして使えます）:</span>
          <textarea readonly class="input" style="font-family: monospace; font-size: 0.8rem; padding: var(--space-2); min-height: 60px; background: var(--color-bg); margin-top: var(--space-1); resize: none;" onclick="this.select()">${e.queryEn||""}</textarea>
        </div>
      </div>
    </div>
  `)}function Qe(){const e=a.get("review"),t=a.get("seed.refinedResult"),s=(t==null?void 0:t.rq)||(t==null?void 0:t.title)||"",r=(t==null?void 0:t.goal)||"",i=(t==null?void 0:t.goal)||"",n=a.get("rq.selectedDesign")||"",o=a.get("guideline.selected")||"",l=a.get("guideline.notes")||{},c=Pe(o);let d="";if(c.length>0){const g=[],v=[];c.forEach((S,f)=>{const b=l[f];b&&b.trim()?g.push(`✓ ${S}: ${b.trim()}`):v.push(`□ ${S}`)}),g.length>0&&(d+=`
検討済みの項目:
${g.join(`
`)}`),v.length>0&&(d+=`
未検討の項目（文献レビューで補完が必要）:
${v.join(`
`)}`)}const u=`
研究テーマ: ${s}
リサーチクエスチョン: ${r}
研究の目的: ${i}
研究デザイン: ${n}
準拠ガイドライン: ${o}
重視するキーワード: ${e.keywords}
対象範囲: ${e.language}
重視する視点: ${e.context||"特定なし"}
${d}
  `.trim(),p=`${L.literatureReview}

---

${u}`;if(M()){const g=JSON.parse(E.literatureReview);a.set("review.aiResult",g),document.querySelector("#step4Results").innerHTML=J(g);const v=document.querySelector("#sumLiterature");v&&(v.textContent="背景構築済み",v.classList.add("active"));return}const m=document.querySelector("#step4Results");m.innerHTML=T({prompt:p,containerId:"geminiReview",label:"背景・意義の論理構成",expectJson:!1,placeholder:"Geminiが出力した「📋 研究背景・意義の論理構成案」をここにコピー＆ペーストしてください..."}),k(m,p,(g,v)=>{const S=v||g||"";let f=null;try{const A=S.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim().match(/\{[\s\S]*"structure"[\s\S]*\}/);A&&(f=JSON.parse(A[0]))}catch{}f||(f={structure:S}),a.set("review.aiResult",f),m.innerHTML=J(f);const b=document.querySelector("#sumLiterature");b&&(b.textContent="背景構築済み",b.classList.add("active"))})}function J(e){return`
    <div class="ai-response">
      <div class="ai-response-header">📖 背景と意義の論理構成案（設計図）</div>
      <div class="ai-response-body">
        <p class="text-muted" style="margin-bottom: var(--space-4); font-size: 0.9rem;">
          以下は検索した文献を使ってどのような順番で背景を記述するべきかの「構成案」です。これを参考に実際の文献を検索し、ご自身で文章を肉付けしてください。
        </p>
        <div class="academic-text" style="line-height: 1.8;">
          ${(e.structure||e.narrative||"").replace(/\n/g,"<br>")}
        </div>
      </div>
    </div>
  `}function Ge(){return!!a.get("review.aiResult")}function je(e){const t={keywordsJa:[],keywordsEn:[],queryJa:"",queryEn:""},s=e.match(/日本語キーワード\s*[:：]\s*(.+?)(?:\n|$)/i);s&&(t.keywordsJa=s[1].split(/[,、，]/).map(o=>o.trim()).filter(o=>o));const r=e.match(/英語キーワード\s*[:：]\s*(.+?)(?:\n|$)/i);r&&(t.keywordsEn=r[1].split(/[,、，]/).map(o=>o.trim()).filter(o=>o));const i=e.match(/日本語検索式\s*[:：]\s*([\s\S]*?)(?=(?:🌍|英語キーワード|英語検索式|---|✅|📌|$))/i);i&&(t.queryJa=i[1].trim());const n=e.match(/英語検索式\s*[:：]\s*([\s\S]*?)(?=(?:---|✅|📌|$))/i);return n&&(t.queryEn=n[1].trim()),t.keywordsJa.length>0||t.keywordsEn.length>0?t:null}const K=[{id:"attributes",label:"基本属性（年齢・性別など）",icon:"👤"},{id:"vitals",label:"バイタルサイン",icon:"💓"},{id:"labs",label:"検査値",icon:"🧪"},{id:"scales",label:"スケール（HADS, BIなど）",icon:"📏"},{id:"observation",label:"観察記録",icon:"👁"},{id:"interview",label:"インタビュー",icon:"🎤"},{id:"questionnaire",label:"アンケート（Likert尺度）",icon:"📋"},{id:"intervention",label:"介入有無",icon:"💊"},{id:"timeseries",label:"時系列データ",icon:"📈"},{id:"medical_record",label:"診療記録・カルテ（看護記録や計画など）",icon:"🏥"},{id:"existing_db",label:"既存データベース利用",icon:"🗄"},{id:"other",label:"その他",icon:"✏️"}],de=[{value:"none",label:"なし（単群・記述的・実態調査など）"},{value:"2groups",label:"2群（ばく露 vs 非ばく露 / 介入 vs 対照 等）"},{value:"3groups",label:"3群以上"},{value:"prepost",label:"前後比較（同一対象への1つの介入前後など）"},{value:"repeated",label:"反復測定・クロスオーバー（同一対象に対する複数の条件・姿勢・時間での測定など）"},{value:"other",label:"その他"}];function Je(e){const t=a.get("data");e.innerHTML=`
    <div class="fade-in">
      <h2 class="step-title">📊 Step 5：収集可能データの選択</h2>
      <p class="step-description">
        実際に収集可能なデータの種類を選択してください。次のステップで最適な分析方法を提案します。
      </p>

      <!-- Data Types -->
      <div class="card" style="margin-bottom: var(--space-6);">
        <h3 class="section-title">📁 1. データタイプ</h3>
        <p class="hint" style="margin-bottom: var(--space-4);">収集予定のデータをすべて選択してください（複数選択可）</p>
        <div class="checkbox-group" id="dataTypeGroup">
          ${K.map(i=>`
            <label class="checkbox-item ${(t.types||[]).includes(i.id)?"checked":""}">
              <input type="checkbox" value="${i.id}" ${(t.types||[]).includes(i.id)?"checked":""} />
              <span>${i.icon} ${i.label}</span>
            </label>
          `).join("")}
        </div>
        <div id="typeOtherWrapper" style="display: ${(t.types||[]).includes("other")?"block":"none"}; margin-top: var(--space-3);">
          <input type="text" id="typeOtherText" class="input" placeholder="具体的なデータタイプを入力してください" value="${t.typeOtherText||""}" />
        </div>
      </div>

      <!-- Sample Size -->
      <div class="card" style="margin-bottom: var(--space-6);">
        <h3 class="section-title">👥 2. サンプル数（予定）</h3>
        <div class="form-group">
          <div style="display: flex; align-items: center; gap: var(--space-4);">
            <input type="number" id="sampleSize" class="input" style="max-width: 200px;"
                   placeholder="例：100" min="1"
                   value="${t.sampleSize||""}" />
            <span class="hint">名（件）</span>
          </div>
          <p class="hint" style="margin-top: var(--space-2);">
            概算で構いません。正確なサンプルサイズはStep 6で計算を支援します。
          </p>
        </div>
      </div>

      <!-- Grouping -->
      <div class="card" style="margin-bottom: var(--space-6);">
        <h3 class="section-title">⚖️ 3. 群分け</h3>
        <div class="radio-group" id="groupingGroup">
          ${de.map(i=>`
            <label class="radio-item ${t.grouping===i.value?"checked":""}">
              <input type="radio" name="grouping" value="${i.value}" ${t.grouping===i.value?"checked":""} />
              ${i.label}
            </label>
          `).join("")}
        </div>
        <div id="groupingOtherWrapper" style="display: ${t.grouping==="other"?"block":"none"}; margin-top: var(--space-3);">
          <input type="text" id="groupingOtherText" class="input" placeholder="具体的な群分け・設計を入力してください" value="${t.groupingOtherText||""}" />
        </div>
      </div>

      <!-- Summary preview -->
      <div class="card card-highlight" id="dataSummaryPreview">
        <h3 class="section-title">📋 データ収集計画の概要</h3>
        <div id="dataSummaryContent">${pe(t)}</div>
      </div>
    </div>
  `,e.querySelectorAll('#dataTypeGroup input[type="checkbox"]').forEach(i=>{i.addEventListener("change",()=>{const n=Array.from(e.querySelectorAll("#dataTypeGroup input:checked")).map(l=>l.value);a.set("data.types",n),e.querySelectorAll("#dataTypeGroup .checkbox-item").forEach(l=>{l.classList.toggle("checked",l.querySelector("input").checked)});const o=e.querySelector("#typeOtherWrapper");if(o&&(o.style.display=n.includes("other")?"block":"none",!n.includes("other"))){a.set("data.typeOtherText","");const l=e.querySelector("#typeOtherText");l&&(l.value="")}O()})});const s=e.querySelector("#typeOtherText");s&&s.addEventListener("input",i=>{a.set("data.typeOtherText",i.target.value),O()}),e.querySelector("#sampleSize").addEventListener("input",i=>{a.set("data.sampleSize",i.target.value),O()}),e.querySelectorAll('input[name="grouping"]').forEach(i=>{i.addEventListener("change",n=>{a.set("data.grouping",n.target.value),e.querySelectorAll("#groupingGroup .radio-item").forEach(l=>{l.classList.toggle("checked",l.querySelector("input").checked)});const o=e.querySelector("#groupingOtherWrapper");if(o&&(o.style.display=n.target.value==="other"?"block":"none",n.target.value!=="other")){a.set("data.groupingOtherText","");const l=e.querySelector("#groupingOtherText");l&&(l.value="")}O()})});const r=e.querySelector("#groupingOtherText");r&&r.addEventListener("input",i=>{a.set("data.groupingOtherText",i.target.value),O()})}function O(){const e=a.get("data"),t=document.querySelector("#dataSummaryContent");t&&(t.innerHTML=pe(e));const s=document.querySelector("#sumData");if(s){const r=e.types||[];if(r.length>0){const i=r.map(n=>{var o;return((o=K.find(l=>l.id===n))==null?void 0:o.label.split("（")[0])||n});s.textContent=i.join("、"),s.classList.add("active")}}}function pe(e){var r;const t=(e.types||[]).map(i=>K.find(n=>n.id===i));let s=((r=de.find(i=>i.value===e.grouping))==null?void 0:r.label)||"未選択";return e.grouping==="other"&&e.groupingOtherText&&(s+=`（${ae(e.groupingOtherText)}）`),t.length===0&&!e.sampleSize&&!e.grouping?'<p style="color: var(--color-text-muted);">データを選択すると、ここに概要が表示されます。</p>':`
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
      <div>
        <strong>データタイプ（${t.length}種類）</strong>
        <ul style="margin-top: var(--space-2); padding-left: var(--space-5);">
          ${t.map(i=>{if(!i)return"";let n=i.label;return i.id==="other"&&e.typeOtherText&&(n+=`（${ae(e.typeOtherText)}）`),`<li>${i.icon} ${n}</li>`}).join("")||'<li style="color: var(--color-text-muted);">未選択</li>'}
        </ul>
      </div>
      <div>
        <p><strong>サンプル数:</strong> ${e.sampleSize||"未入力"}</p>
        <p style="margin-top: var(--space-2);"><strong>群分け:</strong> ${s}</p>
      </div>
    </div>
  `}function Fe(){const e=a.get("data");return(e.types||[]).length>0&&e.grouping}function ae(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}const oe={"2groups":{continuous:{normal:"t検定（独立2群）",nonNormal:"Mann-Whitney U検定"},categorical:"χ²検定 / Fisher正確確率検定"},"3groups":{continuous:{normal:"一元配置分散分析（ANOVA）",nonNormal:"Kruskal-Wallis検定"},categorical:"χ²検定"},prepost:{continuous:{normal:"対応のあるt検定",nonNormal:"Wilcoxon符号付順位和検定"},categorical:"McNemar検定"},none:{continuous:{normal:"記述統計、相関分析",nonNormal:"Spearman順位相関"},categorical:"度数分布、記述統計"}};function Be(e){const t=a.get("analysis"),s=a.get("data");e.innerHTML=`
    <div class="fade-in">
      <h2 class="step-title">📐 Step 6：分析方法提案</h2>
      <p class="step-description">
        Step 5で選択したデータ特性に基づいて、最適な統計分析手法を提案します。
      </p>

      <!-- Quick decision table -->
      <div class="card" style="margin-bottom: var(--space-6);">
        <h3 class="section-title">📊 分析手法クイックリファレンス</h3>
        <div style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>状況</th>
                <th>推奨分析手法</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>2群・連続変数・正規分布</td><td>t検定（独立2群）</td></tr>
              <tr><td>2群・連続変数・非正規</td><td>Mann-Whitney U検定</td></tr>
              <tr><td>3群以上・連続変数</td><td>ANOVA / Kruskal-Wallis検定</td></tr>
              <tr><td>カテゴリ変数</td><td>χ²検定 / Fisher正確確率検定</td></tr>
              <tr><td>前後比較・連続変数</td><td>対応のあるt検定 / Wilcoxon検定</td></tr>
              <tr><td>関連分析</td><td>相関分析 / 回帰分析</td></tr>
              <tr><td>時系列データ</td><td>線形混合モデル</td></tr>
              <tr><td>QI（質改善）</td><td>ランチャート / SPC</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Auto-suggested based on Step 5 -->
      <div class="card card-highlight" style="margin-bottom: var(--space-6);">
        <h3 class="section-title">🤖 あなたのデータに基づく提案</h3>
        ${Ue(s)}
      </div>

      <!-- AI-powered detailed proposal -->
      <div class="card" style="margin-bottom: var(--space-6);">
        <button class="btn btn-primary btn-lg" id="btnAnalysis">
          🤖 詳細な分析計画を提案してもらう
        </button>
      </div>

      <div id="step6Results">
        ${t.aiResult?F(t.aiResult):""}
      </div>
    </div>
  `,e.querySelector("#btnAnalysis").addEventListener("click",We)}function Ue(e){var d,u;const t=e.grouping||"none",s=e.types||[],r=oe[t]||oe.none,i=s.some(p=>["vitals","labs","scales"].includes(p)),n=s.some(p=>["attributes","intervention"].includes(p)),o=s.includes("timeseries"),l=s.some(p=>["interview","observation"].includes(p)),c=[];return i&&c.push(`<li><strong>連続変数の群比較:</strong> ${((d=r.continuous)==null?void 0:d.normal)||r.continuous||"記述統計"}（正規分布を仮定）/ ${((u=r.continuous)==null?void 0:u.nonNormal)||"非パラメトリック検定"}（正規分布でない場合）</li>`),n&&c.push(`<li><strong>カテゴリ変数:</strong> ${r.categorical}</li>`),o&&c.push("<li><strong>時系列分析:</strong> 線形混合モデル（Linear Mixed Model）/ 反復測定分散分析</li>"),l&&c.push("<li><strong>質的データ:</strong> 質的内容分析 / テーマ分析 / グラウンデッドセオリー</li>"),e.sampleSize&&parseInt(e.sampleSize)<30&&c.push('<li style="color: var(--color-warning);"><strong>⚠️ 注意:</strong> サンプルサイズが30未満のため、ノンパラメトリック検定の使用を推奨します</li>'),c.length===0?'<p style="color: var(--color-text-muted);">Step 5でデータを選択すると、自動提案が表示されます。</p>':`<ul style="padding-left: var(--space-5);">${c.join("")}</ul>`}function We(){var n;const e=a.get("data"),s=`
研究デザイン: ${a.get("rq.selectedDesign")||""}
データタイプ: ${(e.types||[]).join(", ")}
サンプルサイズ: ${e.sampleSize||"未定"}
群分け: ${e.grouping||"未定"}
  `.trim(),r=`${L.statisticsProposal}

---

${s}`;if(M()){const o=JSON.parse(E.statisticsProposal);a.set("analysis.aiResult",o),document.querySelector("#step6Results").innerHTML=F(o);const l=document.querySelector("#sumAnalysis");l&&(l.textContent=((n=o.primaryAnalysis)==null?void 0:n.method)||"提案済み",l.classList.add("active"));return}const i=document.querySelector("#step6Results");i.innerHTML=T({prompt:r,containerId:"geminiAnalysis",label:"統計分析手法の提案",expectJson:!1,placeholder:"Geminiが出力した「📋 分析方法提案」をここにコピー＆ペーストしてください..."}),k(i,r,(o,l)=>{var u;const c=l||o||"";let d=null;try{const m=c.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim().match(/\{[\s\S]*"primaryAnalysis"[\s\S]*\}/);m&&(d=JSON.parse(m[0]))}catch{}if(d||(d=Ke(c)),d){a.set("analysis.aiResult",d),i.innerHTML=F(d);const p=document.querySelector("#sumAnalysis");p&&(p.textContent=((u=d.primaryAnalysis)==null?void 0:u.method)||"提案済み",p.classList.add("active"))}else alert("提案内容を判読できませんでした。Geminiが出力した「📋 分析方法提案」をそのまま貼り付けてください。")})}function Ke(e){const t={primaryAnalysis:{method:"",reason:""},secondaryAnalyses:[],effectSize:"",multivariateNeeded:!1,multivariateMethod:"",sampleSizeNote:""},s=e.match(/主解析\s*[:：]\s*(.+?)(?:\n|$)/);s&&(t.primaryAnalysis.method=s[1].trim());const r=e.match(/主解析の理由\s*[:：]\s*([\s\S]*?)(?=(?:副解析|効果量|多変量|サンプル|---|✅|📌|$))/);r&&(t.primaryAnalysis.reason=r[1].trim());const i=e.match(/副解析\s*[:：]\s*(.+?)(?:\n|$)/);if(i&&i[1].trim()){const c=e.match(/副解析の理由\s*[:：]\s*([\s\S]*?)(?=(?:効果量|多変量|サンプル|---|✅|📌|$))/);t.secondaryAnalyses.push({method:i[1].trim(),reason:c?c[1].trim():""})}const n=e.match(/効果量\s*[:：]\s*([\s\S]*?)(?=(?:多変量|サンプル|---|✅|📌|$))/);n&&(t.effectSize=n[1].trim());const o=e.match(/多変量解析\s*[:：]\s*([\s\S]*?)(?=(?:サンプル|---|✅|📌|$))/);if(o){const c=o[1].trim();(c.includes("必要")||c.includes("要"))&&(t.multivariateNeeded=!0,t.multivariateMethod=c.replace(/必要[。、．]?\s*/,"").trim())}const l=e.match(/サンプルサイズ概算\s*[:：]\s*([\s\S]*?)(?=(?:---|✅|📌|$))/);return l&&(t.sampleSizeNote=l[1].trim()),t.primaryAnalysis.method?t:e.trim().length>30?(t.primaryAnalysis.method=e.trim().split(`
`)[0].substring(0,100),t.primaryAnalysis.reason=e.trim(),t):null}function F(e){var t;return`
    <div class="ai-response">
      <div class="ai-response-header">📐 分析方法提案</div>
      <div class="ai-response-body">

        ${e.primaryAnalysis?`
          <h4>🎯 主解析</h4>
          <div class="card card-highlight" style="margin-bottom: var(--space-4);">
            <h3 style="color: var(--color-primary); margin-bottom: var(--space-2);">${e.primaryAnalysis.method}</h3>
            <div style="white-space: pre-wrap; line-height: 1.6;">${e.primaryAnalysis.reason}</div>
          </div>
        `:""}

        ${(t=e.secondaryAnalyses)!=null&&t.length?`
          <h4>📊 副解析の候補</h4>
          ${e.secondaryAnalyses.map(s=>`
            <div class="card" style="margin-bottom: var(--space-3);">
              <strong>${s.method}</strong>
              <div style="color: var(--color-text-secondary); margin-top: var(--space-2); white-space: pre-wrap; line-height: 1.5;">${s.reason}</div>
            </div>
          `).join("")}
        `:""}

        ${e.effectSize?`
          <h4>📏 効果量</h4>
          <p>${e.effectSize}</p>
        `:""}

        ${e.multivariateNeeded!==void 0?`
          <h4>🔗 多変量解析</h4>
          <p>${e.multivariateNeeded?`<span class="tag tag-warning">必要</span> ${e.multivariateMethod||""}`:'<span class="tag tag-success">不要</span>'}</p>
        `:""}

        ${e.sampleSizeNote?`
          <h4>👥 サンプルサイズ概算</h4>
          <div class="card card-success">
            <div style="white-space: pre-wrap; line-height: 1.5;">${e.sampleSizeNote}</div>
          </div>
        `:""}

      </div>
    </div>
  `}function Ye(){return!!a.get("analysis.aiResult")}function Ve(e){const t=a.get("proposal");e.innerHTML=`
    <div class="fade-in">
      <h2 class="step-title">📝 Step 7：研究計画書草案</h2>
      <p class="step-description">
        これまでのステップで整理した内容を統合し、ガイドライン準拠の研究計画書草案を生成します。
      </p>

      <!-- Summary of all steps -->
      <div class="card" style="margin-bottom: var(--space-6);">
        <h3 class="section-title">🗂 これまでの入力内容</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
          ${Xe()}
        </div>
      </div>

      <div style="margin-bottom: var(--space-6);">
        <button class="btn btn-primary btn-lg" id="btnGenerate" style="width: 100%;">
          📝 研究計画書草案を生成
        </button>
      </div>

      <div id="step7Results">
        ${t.draft?B(t.draft):""}
      </div>
    </div>
  `,e.querySelector("#btnGenerate").addEventListener("click",Ze),t.draft&&U(t.draft)}function Xe(){var o,l;const e=a.get("seed"),t=a.get("rq"),s=a.get("guideline"),r=a.get("review");a.get("data");const i=a.get("analysis"),n=e.refinedResult;return`
    <div>
      <p><strong>テーマ:</strong> ${n?(n.theme||n.rq||n.title||"未整理").substring(0,80):"未整理"}</p>
      <p><strong>研究デザイン:</strong> ${t.selectedDesign||"未選択"}</p>
      <p><strong>ガイドライン:</strong> ${s.selected||"未選択"}</p>
    </div>
    <div>
      <p><strong>骨子整理:</strong> ${n?"完了":"未完了"}</p>
      <p><strong>文献レビュー:</strong> ${r.aiResult?"実施済み":"未実施"}</p>
      <p><strong>分析方法:</strong> ${((l=(o=i.aiResult)==null?void 0:o.primaryAnalysis)==null?void 0:l.method)||"未提案"}</p>
    </div>
    `}function Ze(){var d,u,p,m,g,v,S,f,b,C,A,V,X,Z,ee,te;const e=a.get("seed"),t=a.get("rq"),s=a.get("guideline"),r=a.get("review"),i=a.get("data"),n=a.get("analysis"),o=`
以下の情報を統合して研究計画書草案を作成してください。

【研究テーマ】
${((d=e.refinedResult)==null?void 0:d.theme)||((u=e.refinedResult)==null?void 0:u.title)||""}

【リサーチクエスチョン】
${((p=e.refinedResult)==null?void 0:p.rq)||e.question||""}

【研究デザイン】
${t.selectedDesign||""}

【研究の骨子】
対象: ${((m=e.refinedResult)==null?void 0:m.target)||"未整理"}
ゴール: ${((g=e.refinedResult)==null?void 0:g.goal)||"未整理"}
アプローチ: ${(((v=e.refinedResult)==null?void 0:v.approaches)||[]).map(h=>`${h.name}: ${h.description}`).join(`
`)}

【準拠ガイドライン】
${s.selected||""}

【文献レビュー概要（論理構成案）】
${((S=r.aiResult)==null?void 0:S.structure)||"未実施"}

【データ収集計画】
データタイプ: ${(i.types||[]).join(", ")}
サンプルサイズ: ${i.sampleSize||"未定"}
群分け: ${i.grouping||"未定"}

【分析方法】
主解析: ${((b=(f=n.aiResult)==null?void 0:f.primaryAnalysis)==null?void 0:b.method)||"未提案"}
理由: ${((A=(C=n.aiResult)==null?void 0:C.primaryAnalysis)==null?void 0:A.reason)||""}
副解析: ${(((V=n.aiResult)==null?void 0:V.secondaryAnalyses)||[]).map(h=>h.method).join(", ")}
効果量: ${((X=n.aiResult)==null?void 0:X.effectSize)||""}
多変量解析: ${(Z=n.aiResult)!=null&&Z.multivariateNeeded?(ee=n.aiResult)==null?void 0:ee.multivariateMethod:"不要"}
サンプルサイズ根拠: ${((te=n.aiResult)==null?void 0:te.sampleSizeNote)||""}
  `.trim(),l=`${L.proposalDraft}

---

${o}`;if(M()){const h=E.proposalDraft;a.set("proposal.draft",h),document.querySelector("#step7Results").innerHTML=B(h),U(h);return}const c=document.querySelector("#step7Results");c.innerHTML=T({prompt:l,containerId:"geminiProposal",label:"研究計画書草案の生成",expectJson:!1,placeholder:"Geminiからの研究計画書草案をここに貼り付けてください..."}),k(c,l,h=>{h&&(a.set("proposal.draft",h),c.innerHTML=B(h),U(h))})}function B(e){return`
    <div class="ai-response">
      <div class="ai-response-header">📝 研究計画書草案</div>
      <div class="ai-response-body">
        <div class="proposal-output" style="white-space: normal;">
          ${e.replace(/^# (.+)$/gm,'<h2 style="margin-top: var(--space-6); color: var(--color-primary-dark); border-bottom: 2px solid var(--color-primary-border); padding-bottom: var(--space-2);">$1</h2>').replace(/^## (.+)$/gm,'<h3 style="margin-top: var(--space-5); color: var(--color-text);">$1</h3>').replace(/^### (.+)$/gm,'<h4 style="margin-top: var(--space-4); color: var(--color-text-secondary);">$1</h4>').replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>")}
        </div>
      </div>
    </div>

    <div class="export-actions" style="display: flex; gap: var(--space-3); flex-wrap: wrap; margin-top: var(--space-4);">
      <button class="btn btn-success" id="btnCopyProposal">
        📋 テキストをコピー
      </button>
      <button class="btn btn-primary" id="btnDownloadWord">
        📄 Word形式でダウンロード
      </button>
      <button class="btn btn-outline" id="btnDownloadPDF">
        📑 PDF形式でダウンロード
      </button>
    </div>
  `}function U(e){const t=document.querySelector("#btnCopyProposal");t&&t.addEventListener("click",()=>{navigator.clipboard.writeText(e).then(()=>{t.textContent="✅ コピーしました",setTimeout(()=>{t.textContent="📋 テキストをコピー"},2e3)}).catch(()=>{const i=document.createElement("textarea");i.value=e,document.body.appendChild(i),i.select(),document.execCommand("copy"),document.body.removeChild(i),t.textContent="✅ コピーしました",setTimeout(()=>{t.textContent="📋 テキストをコピー"},2e3)})});const s=document.querySelector("#btnDownloadWord");s&&s.addEventListener("click",()=>{et(e)});const r=document.querySelector("#btnDownloadPDF");r&&r.addEventListener("click",()=>{tt(e)})}function et(e){var l,c,d,u;const s=`
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'ＭＳ 明朝', 'Yu Mincho', serif;
      font-size: 10.5pt;
      line-height: 1.8;
      margin: 2cm 2.5cm;
    }
    h1 {
      font-size: 16pt;
      text-align: center;
      margin-bottom: 24pt;
      border-bottom: none;
    }
    h2 {
      font-size: 13pt;
      margin-top: 18pt;
      margin-bottom: 6pt;
      border-bottom: 1px solid #333;
      padding-bottom: 3pt;
    }
    h3 {
      font-size: 11pt;
      margin-top: 12pt;
      margin-bottom: 4pt;
    }
    p {
      text-indent: 1em;
      margin: 0 0 6pt 0;
    }
    li {
      margin-left: 2em;
      margin-bottom: 3pt;
    }
  </style>
</head>
<body>
  ${e.replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>")}
</body>
</html>`,r=new Blob(["\uFEFF"+s],{type:"application/msword;charset=utf-8"}),i=URL.createObjectURL(r),n=document.createElement("a"),o=(((c=(l=a.get("seed"))==null?void 0:l.refinedResult)==null?void 0:c.theme)||((u=(d=a.get("seed"))==null?void 0:d.refinedResult)==null?void 0:u.rq)||"研究計画書").substring(0,30);n.href=i,n.download=`研究計画書草案_${o}.doc`,document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(i)}function tt(e){const t=e.replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/\n\n/g,"</p><p>").replace(/\n/g,"<br>"),s=window.open("","_blank");s.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>研究計画書草案</title>
  <style>
    @page {
      size: A4;
      margin: 2cm 2.5cm;
    }
    body {
      font-family: 'Hiragino Mincho ProN', 'Yu Mincho', 'ＭＳ 明朝', serif;
      font-size: 10.5pt;
      line-height: 1.8;
      color: #000;
    }
    h1 {
      font-size: 16pt;
      text-align: center;
      margin-bottom: 24pt;
    }
    h2 {
      font-size: 13pt;
      margin-top: 18pt;
      margin-bottom: 6pt;
      border-bottom: 1px solid #333;
      padding-bottom: 3pt;
    }
    h3 {
      font-size: 11pt;
      margin-top: 12pt;
      margin-bottom: 4pt;
    }
    p {
      text-indent: 1em;
      margin: 0 0 6pt 0;
    }
    li {
      margin-left: 2em;
      margin-bottom: 3pt;
    }
  </style>
</head>
<body>
  ${t}
</body>
</html>`),s.document.close(),setTimeout(()=>{s.print()},500)}function st(){return!!a.get("proposal.draft")}const it=[{id:1,render:$e,validate:Le},{id:2,render:Ee,validate:Ae},{id:3,render:Ie,validate:ze},{id:4,render:He,validate:Ge},{id:5,render:Je,validate:Fe},{id:6,render:Be,validate:Ye},{id:7,render:Ve,validate:st}],nt=document.getElementById("stepContent"),rt=document.getElementById("progressFill"),ue=document.querySelectorAll(".step-tab"),me=document.getElementById("btnPrev"),x=document.getElementById("btnNext"),at=document.getElementById("stepIndicator"),q=document.getElementById("settingsModal");let y=a.get("currentStep")||1,le=!1;function ge(){le||(le=!0,a.hasSavedData()&&dt(),z(),P(),ct(),ot(),lt(),pt(),Y())}function z(){const e=it.find(t=>t.id===y);e&&e.render(nt)}function W(e){e<1||e>7||(y=e,a.set("currentStep",y),z(),P(),window.scrollTo({top:0,behavior:"smooth"}))}function P(){const e=y/7*100;rt.style.width=`${e}%`,ue.forEach(t=>{const s=parseInt(t.dataset.step);t.classList.toggle("active",s===y),t.classList.toggle("completed",a.get("completedSteps").has(s))}),me.disabled=y===1,y===7?(x.innerHTML="✅ 完了",x.classList.remove("btn-primary"),x.classList.add("btn-success")):(x.innerHTML=`
      確認して次へ
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    `,x.classList.remove("btn-success"),x.classList.add("btn-primary")),at.textContent=`Step ${y} / 7`}function ot(){ue.forEach(e=>{e.addEventListener("click",()=>{const t=parseInt(e.dataset.step);W(t)})})}function lt(){me.addEventListener("click",()=>{W(y-1)}),x.addEventListener("click",()=>{const e=a.get("completedSteps");e.add(y),a.set("completedSteps",e),y<7&&W(y+1)})}function ct(){const e=document.getElementById("btnSettings"),t=document.getElementById("btnCloseSettings"),s=document.getElementById("btnSaveSettings"),r=document.getElementById("demoModeToggle");r.checked=a.get("demoMode"),e.addEventListener("click",()=>{q.classList.add("visible")}),t.addEventListener("click",()=>{q.classList.remove("visible")}),q.addEventListener("click",i=>{i.target===q&&q.classList.remove("visible")}),s.addEventListener("click",()=>{a.saveDemoMode(r.checked),q.classList.remove("visible"),s.textContent="✅ 保存しました",setTimeout(()=>{s.textContent="保存"},1500)})}function Y(){var o,l,c,d,u,p;const e=a.get("seed"),t=a.get("rq"),s=a.get("guideline"),r=a.get("review"),i=a.get("data"),n=a.get("analysis");((o=e.refinedResult)!=null&&o.theme||(l=e.refinedResult)!=null&&l.title||e.question)&&R("Theme",(((c=e.refinedResult)==null?void 0:c.theme)||((d=e.refinedResult)==null?void 0:d.title)||e.question).substring(0,60)),e.refinedResult&&R("RQ",e.refinedResult.rq||e.refinedResult.title),t.selectedDesign&&R("Design",t.selectedDesign),s.selected&&R("Guideline",s.selected),r.aiResult&&R("Literature","背景構築済み"),((u=i.types)==null?void 0:u.length)>0&&R("Data",`${i.types.length}種類のデータ`),(p=n.aiResult)!=null&&p.primaryAnalysis&&R("Analysis",n.aiResult.primaryAnalysis.method)}function R(e,t){const s=document.querySelector(`#sum${e}`);s&&(s.textContent=t,s.classList.add("active"))}function dt(){const e=document.createElement("div");e.className="modal-overlay visible",e.id="resumeDialog",e.innerHTML=`
        <div class="modal" style="max-width: 440px;">
            <div class="modal-header">
                <h2>📂 保存データが見つかりました</h2>
            </div>
            <div class="modal-body" style="text-align: center;">
                <p style="margin-bottom: var(--space-4); color: var(--color-text-secondary);">
                    前回の作業データが保存されています。<br>続きから再開しますか？
                </p>
                <div style="display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-primary" id="btnResume">
                        ▶ 続きから再開
                    </button>
                    <button class="btn btn-outline" id="btnNewProject">
                        🆕 新しく始める
                    </button>
                </div>
            </div>
        </div>
    `,document.body.appendChild(e),document.getElementById("btnResume").addEventListener("click",()=>{a.loadFullState(),y=a.get("currentStep")||1,z(),P(),Y(),e.remove()}),document.getElementById("btnNewProject").addEventListener("click",()=>{a.reset()})}function pt(){const e=document.getElementById("btnExport"),t=document.getElementById("btnImport"),s=document.getElementById("fileImport");e&&e.addEventListener("click",()=>{a.exportToJSON();const r=e.innerHTML;e.innerHTML="✅ 保存しました",setTimeout(()=>{e.innerHTML=r},2e3)}),t&&s&&(t.addEventListener("click",()=>{s.click()}),s.addEventListener("change",async r=>{const i=r.target.files[0];if(i){try{await a.importFromJSON(i),y=a.get("currentStep")||1,z(),P(),Y();const n=t.innerHTML;t.innerHTML="✅ 読み込み完了",setTimeout(()=>{t.innerHTML=n},2e3)}catch(n){alert("ファイルの読み込みに失敗しました: "+n.message)}s.value=""}}))}document.addEventListener("DOMContentLoaded",ge);document.readyState!=="loading"&&ge();
