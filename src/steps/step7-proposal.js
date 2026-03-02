/**
 * step7-proposal.js — 研究計画書草案生成 — Gemini連携版
 */

import { state } from '../state.js';
import { PROMPTS, DEMO_RESPONSES } from '../prompts/index.js';
import { renderGeminiUI, attachGeminiListeners, isDemoMode } from '../gemini-helper.js';
import { CHECKLIST_ITEMS } from './step3-guideline.js';

export function renderStep7(container) {
  const proposal = state.get('proposal');

  container.innerHTML = `
    <div class="fade-in">
      <h2 class="step-title">📝 Step 7：研究計画書草案</h2>
      <p class="step-description">
        これまでのステップで整理した内容を統合し、ガイドライン準拠の研究計画書草案を生成します。
      </p>

      <!-- Summary of all steps -->
      <div class="card" style="margin-bottom: var(--space-6);">
        <h3 class="section-title">🗂 これまでの入力内容</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
          ${renderInputSummary()}
        </div>
      </div>

      <div style="margin-bottom: var(--space-6);">
        <button class="btn btn-primary btn-lg" id="btnGenerate" style="width: 100%;">
          📝 研究計画書草案を生成
        </button>
      </div>

      <div id="step7Results">
        ${proposal.draft ? renderProposal(proposal.draft) : ''}
      </div>
    </div>
  `;

  container.querySelector('#btnGenerate').addEventListener('click', generateProposal);

  if (proposal.draft) {
    attachExportListeners(proposal.draft);
  }
}

function renderInputSummary() {
  const seed = state.get('seed');
  const rq = state.get('rq');
  const guideline = state.get('guideline');
  const review = state.get('review');
  const data = state.get('data');
  const analysis = state.get('analysis');

  const refined = seed.refinedResult;
  return `
    <div>
      <p><strong>テーマ:</strong> ${refined ? (refined.theme || refined.rq || refined.title || '未整理').substring(0, 80) : '未整理'}</p>
      <p><strong>研究デザイン:</strong> ${rq.selectedDesign || '未選択'}</p>
      <p><strong>ガイドライン:</strong> ${guideline.selected || '未選択'}</p>
    </div>
    <div>
      <p><strong>骨子整理:</strong> ${refined ? '完了' : '未完了'}</p>
      <p><strong>文献レビュー:</strong> ${review.aiResult ? '実施済み' : '未実施'}</p>
      <p><strong>分析方法:</strong> ${analysis.aiResult?.primaryAnalysis?.method || '未提案'}</p>
    </div>
    `;
}

function generateProposal() {
  const seed = state.get('seed');
  const rq = state.get('rq');
  const guideline = state.get('guideline');
  const review = state.get('review');
  const data = state.get('data');
  const analysis = state.get('analysis');

  // チェックリストのメモ情報を収集
  const guidelineName = guideline.selected || '';
  const notes = guideline.notes || {};
  const guidelineItems = CHECKLIST_ITEMS[guidelineName] || [];
  let checklistSection = '';
  if (guidelineItems.length > 0) {
    const entries = [];
    guidelineItems.forEach((item, i) => {
      const note = notes[i];
      if (note && note.trim()) {
        entries.push(`  ✓ ${item}: ${note.trim()}`);
      }
    });
    if (entries.length > 0) {
      checklistSection = `\n\n【ガイドライン（${guidelineName}）チェックリストに基づくユーザーのメモ・方針】\n※ 以下はユーザーがStep 3で入力した研究の方針や検討内容です。計画書作成時にこれらの内容を積極的に反映してください。\n${entries.join('\n')}`;
    }
  }

  // --- 情報の優先度付けと要約 ---

  // 文献レビュー構成案が長すぎる場合は省略（Geminiのコンテキスト過負荷防止）
  let litStructure = review.aiResult?.structure || '';
  if (litStructure.length > 600) {
    litStructure = litStructure.substring(0, 600) + '\n…（以下省略。全体の骨格は上記を参考に執筆してください）';
  }

  // 分析方法の要点のみ
  const analysisMethod = analysis.aiResult?.primaryAnalysis?.method || '未提案';
  const analysisReason = (analysis.aiResult?.primaryAnalysis?.reason || '').substring(0, 200);
  const secondaryMethods = (analysis.aiResult?.secondaryAnalyses || []).map(s => s.method).filter(Boolean).join(', ');

  const userMsg = `
以下の情報を統合して研究計画書草案を作成してください。
情報は優先度順に整理されています。【コア情報】を最も重視し、【詳細情報】で肉付けしてください。

━━━ コア情報（最重要）━━━

【研究テーマ】
${seed.refinedResult?.theme || seed.refinedResult?.title || '未設定'}

【リサーチクエスチョン】
${seed.refinedResult?.rq || seed.question || '未設定'}

【研究デザイン】
${rq.selectedDesign || '未選択'}

【研究の骨子】
対象: ${seed.refinedResult?.target || '未整理'}
ゴール: ${seed.refinedResult?.goal || '未整理'}
アプローチ: ${(seed.refinedResult?.approaches || []).map(a => `${a.name}: ${a.description}`).join('\n') || 'なし'}

━━━ 詳細情報 ━━━

【準拠ガイドライン】
${guidelineName || '未選択'}${checklistSection}

【データ収集計画】
データタイプ: ${(data.types || []).join(', ') || '未定'}
サンプルサイズ: ${data.sampleSize || '未定'}
群分け: ${data.grouping || '未定'}

【分析方法】
主解析: ${analysisMethod}
理由: ${analysisReason}
${secondaryMethods ? `副解析: ${secondaryMethods}` : ''}
効果量: ${analysis.aiResult?.effectSize || '未決定'}
多変量解析: ${analysis.aiResult?.multivariateNeeded ? analysis.aiResult?.multivariateMethod : '不要'}
サンプルサイズ根拠: ${analysis.aiResult?.sampleSizeNote || '未算出'}

━━━ 補足情報 ━━━

【文献レビュー概要（論理構成案）】
${litStructure || '未実施'}
  `.trim();

  const fullPrompt = `${PROMPTS.proposalDraft}\n\n---\n\n${userMsg}`;

  if (isDemoMode()) {
    const response = DEMO_RESPONSES.proposalDraft;
    state.set('proposal.draft', response);
    document.querySelector('#step7Results').innerHTML = renderProposal(response);
    attachExportListeners(response);
    return;
  }

  // Gemini連携モード
  const resultsArea = document.querySelector('#step7Results');
  resultsArea.innerHTML = renderGeminiUI({
    prompt: fullPrompt,
    containerId: 'geminiProposal',
    label: '研究計画書草案の生成',
    expectJson: false,
    placeholder: 'Geminiからの研究計画書草案をここに貼り付けてください...',
  });

  attachGeminiListeners(resultsArea, fullPrompt, (response) => {
    if (response) {
      state.set('proposal.draft', response);
      resultsArea.innerHTML = renderProposal(response);
      attachExportListeners(response);
    }
  });
}

function addReviewMarkers(html) {
  const ms = 'display:inline-block;background:#fff3cd;color:#856404;font-size:0.7rem;padding:1px 6px;border-radius:3px;margin-left:4px;font-weight:bold;vertical-align:middle;border:1px solid #f0c36d;';
  const tags = {
    lit: `<span style="${ms}" title="文献を自身で検索し、実在を確認してください">⚠️文献要確認</span>`,
    stat: `<span style="${ms}" title="統計の専門家に妥当性を確認してください">⚠️統計要確認</span>`,
    sample: `<span style="${ms}" title="サンプルサイズの計算根拠を自身で検証してください">⚠️要検証</span>`,
    ethics: `<span style="${ms}" title="施設の倫理審査要件に合わせて修正してください">⚠️施設に合わせて修正</span>`,
    citation: `<span style="${ms}background:#f8d7da;color:#721c24;border-color:#f5c6cb;" title="実在する文献に差し替えてください">🔴出典未確認</span>`,
  };
  let count = 0;
  const mark = (t) => { count++; return t; };

  // 「出典確認中」
  html = html.replace(/出典確認中/g, () => mark(`出典確認中 ${tags.citation}`));

  // 文献言及パターン
  html = html.replace(/(先行研究によ(?:れば|ると))/g, (m) => mark(`${m} ${tags.lit}`));
  html = html.replace(/(既存の(?:エビデンス|研究|知見)(?:では|によ(?:れば|ると)))/g, (m) => mark(`${m} ${tags.lit}`));
  html = html.replace(/((?:国内外の|複数の|多くの|近年の)(?:研究|報告|調査)(?:では|で|が|において))/g, (m) => mark(`${m} ${tags.lit}`));
  html = html.replace(/((?:メタアナリシス|システマティックレビュー)(?:では|によ(?:れば|ると)))/g, (m) => mark(`${m} ${tags.lit}`));

  // 統計手法
  html = html.replace(/(t検定|χ²検定|カイ二乗検定|Mann-Whitney|Wilcoxon|ANOVA|分散分析|ロジスティック回帰|Cox比例ハザード|Kaplan-Meier|ログランク検定|線形混合モデル|共分散分析|因子分析|主成分分析|構造方程式)/g, (m) => mark(`${m} ${tags.stat}`));

  // サンプルサイズ
  html = html.replace(/((?:サンプルサイズ|標本サイズ|症例数)(?:は|を|の)[^<]{5,60}?(?:名|例|人|とする|と設定|を目標))/g, (m) => mark(`${m} ${tags.sample}`));

  // 倫理関連
  html = html.replace(/(インフォームド・コンセント)/g, (m) => mark(`${m} ${tags.ethics}`));
  html = html.replace(/(倫理審査委員会(?:の承認|に申請|の審査))/g, (m) => mark(`${m} ${tags.ethics}`));

  return { html, count, tags };
}

function renderProposal(draft) {
  // Convert markdown-like formatting to HTML
  let htmlContent = draft
    .replace(/^# (.+)$/gm, '<h2 style="margin-top: var(--space-6); color: var(--color-primary-dark); border-bottom: 2px solid var(--color-primary-border); padding-bottom: var(--space-2);">$1</h2>')
    .replace(/^## (.+)$/gm, '<h3 style="margin-top: var(--space-5); color: var(--color-text);">$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 style="margin-top: var(--space-4); color: var(--color-text-secondary);">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // 要確認マーカーを自動挿入
  const { html: markedHtml, count, tags } = addReviewMarkers(htmlContent);
  htmlContent = markedHtml;

  const legend = count > 0 ? `
    <div style="background: var(--color-bg-secondary, #f8f9fa); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-4); margin-bottom: var(--space-4);">
      <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);">
        <span style="font-size: 1.2rem;">🔍</span>
        <strong style="font-size: 0.95rem;">要確認箇所: ${count}件を自動検出しました</strong>
      </div>
      <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-3);">計画書内の以下のマーカーが付いた箇所は、提出前に必ずご自身で確認・修正してください。</p>
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-4); font-size: var(--font-size-sm);">
        <span>${tags.citation} 出典未確認→実在文献に差替え</span>
        <span>${tags.lit} 文献参照→自身で検索・確認</span>
        <span>${tags.stat} 統計手法→専門家に確認</span>
        <span>${tags.sample} サンプルサイズ→根拠を検証</span>
        <span>${tags.ethics} 倫理関連→施設に合わせて修正</span>
      </div>
    </div>
  ` : '';

  return `
    <div class="ai-response">
      <div class="ai-response-header">📝 研究計画書草案</div>
      <div class="ai-response-body">
        ${legend}
        <div class="proposal-output" style="white-space: normal;">
          ${htmlContent}
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

    <div style="margin-top: var(--space-6); background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%); border: 1px solid #f0c36d; border-radius: var(--radius-md); padding: var(--space-5);">
      <div style="display: flex; gap: var(--space-3); align-items: flex-start;">
        <div style="font-size: 1.5rem; line-height: 1;">⚠️</div>
        <div>
          <p style="font-weight: bold; color: #856404; margin-bottom: var(--space-2); font-size: 1.05rem;">この計画書はAIが生成した「草案」です</p>
          <ul style="color: #856404; font-size: var(--font-size-sm); line-height: 1.8; padding-left: var(--space-5); margin: 0;">
            <li>本草案はAI（Gemini）によって自動生成されたものであり、<strong>そのまま提出することは推奨しません</strong>。</li>
            <li>記載内容が<strong>ご自身の研究環境・施設の実情に沿っているか</strong>必ず確認し、修正してください。</li>
            <li>引用文献は「出典確認中」と表記されている場合があります。<strong>実在する文献を自身で検索し差し替えてください</strong>。</li>
            <li><strong>倫理審査委員会（IRB）へ提出する前に</strong>、指導教員や研究倫理の専門家にレビューを依頼してください。</li>
            <li>統計手法やサンプルサイズの妥当性は、<strong>統計の専門家に相談する</strong>ことを強く推奨します。</li>
            <li>AIが生成した文章をそのまま使用する場合、<strong>所属機関のAI利用ポリシー</strong>を確認してください。</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function attachExportListeners(draft) {
  const btnCopy = document.querySelector('#btnCopyProposal');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(draft).then(() => {
        btnCopy.textContent = '✅ コピーしました';
        setTimeout(() => { btnCopy.textContent = '📋 テキストをコピー'; }, 2000);
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = draft;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btnCopy.textContent = '✅ コピーしました';
        setTimeout(() => { btnCopy.textContent = '📋 テキストをコピー'; }, 2000);
      });
    });
  }

  const btnWord = document.querySelector('#btnDownloadWord');
  if (btnWord) {
    btnWord.addEventListener('click', () => {
      downloadAsWord(draft);
    });
  }

  const btnPDF = document.querySelector('#btnDownloadPDF');
  if (btnPDF) {
    btnPDF.addEventListener('click', () => {
      downloadAsPDF(draft);
    });
  }
}

function downloadAsWord(draft) {
  const htmlBody = draft
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  const wordContent = `
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
  ${htmlBody}
</body>
</html>`;

  const blob = new Blob(['\ufeff' + wordContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const theme = (state.get('seed')?.refinedResult?.theme || state.get('seed')?.refinedResult?.rq || '研究計画書').substring(0, 30);
  a.href = url;
  a.download = `研究計画書草案_${theme}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadAsPDF(draft) {
  const htmlBody = draft
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
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
  ${htmlBody}
</body>
</html>`);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

export function validateStep7() {
  return !!state.get('proposal.draft');
}
