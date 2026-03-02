/**
 * step6-5-audit.js — 論理整合性監査モジュール
 * Step 6完了後、全ステップの出力を統合してlogicalAuditに渡す。
 * 判定結果（🟢🟡🔴）に応じてUI分岐を行う。
 */

import { state } from '../state.js';
import { PROMPTS, DEMO_RESPONSES } from '../prompts/index.js';
import { renderGeminiUI, attachGeminiListeners, isDemoMode } from '../gemini-helper.js';

export function renderStep7Audit(container) {
    const auditResult = state.get('audit.result');

    container.innerHTML = `
    <div class="fade-in">
      <h2 class="step-title">🔎 Step 7：論理整合性チェック</h2>
      <p class="step-description">
        Step 1〜6で入力した研究計画の各要素が論理的に整合しているかをAIが厳密にチェックします。
        <strong>このステップでは「冷酷な監査者」として矛盾のみを指摘します。</strong>
      </p>

      <div class="card" style="margin-bottom: var(--space-4); background: var(--color-bg-secondary);">
        <h3 class="section-title">📋 チェック対象（各ステップからの入力情報）</h3>
        <div id="auditInputsSummary" style="font-size: var(--font-size-sm); color: var(--color-text-secondary);"></div>
      </div>

      <div style="text-align: center; margin-bottom: var(--space-4);">
        <button class="btn btn-primary" id="btnRunAudit" style="font-size: 1.05rem; padding: 12px 32px;">
          🔎 整合性チェックを実行
        </button>
      </div>

      <div id="auditResults">
        ${auditResult ? renderAuditResults(auditResult) : ''}
      </div>
    </div>
  `;

    // 入力情報サマリーを表示
    renderAuditInputs();

    // ボタンリスナー
    const btnRun = document.getElementById('btnRunAudit');
    if (btnRun) {
        btnRun.addEventListener('click', runAudit);
    }
}

function renderAuditInputs() {
    const el = document.getElementById('auditInputsSummary');
    if (!el) return;

    const seed = state.get('seed');
    const rq = state.get('rq');
    const guideline = state.get('guideline');
    const data = state.get('data');
    const analysis = state.get('analysis');

    const items = [
        { label: 'RQ', value: seed.refinedResult?.rq || seed.question || '未設定', ok: !!(seed.refinedResult?.rq || seed.question) },
        { label: '研究デザイン', value: rq.selectedDesign || '未選択', ok: !!rq.selectedDesign },
        { label: 'ガイドライン', value: guideline.selected || '未選択', ok: !!guideline.selected },
        { label: 'データタイプ', value: (data.types || []).join(', ') || '未定', ok: (data.types || []).length > 0 },
        { label: 'サンプルサイズ', value: data.sampleSize || '未定', ok: !!data.sampleSize },
        { label: '主解析', value: analysis.aiResult?.primaryAnalysis?.method || '未提案', ok: !!analysis.aiResult?.primaryAnalysis?.method },
    ];

    el.innerHTML = items.map(item => `
    <div style="display: flex; align-items: center; gap: 8px; padding: 4px 0; border-bottom: 1px solid var(--color-border);">
      <span style="font-size: 0.9rem;">${item.ok ? '✅' : '⚠️'}</span>
      <span style="font-weight: 500; min-width: 120px;">${item.label}:</span>
      <span style="color: ${item.ok ? 'var(--color-text)' : 'var(--color-danger)'};">${item.value}</span>
    </div>
  `).join('');
}

function runAudit() {
    const seed = state.get('seed');
    const rq = state.get('rq');
    const guideline = state.get('guideline');
    const data = state.get('data');
    const analysis = state.get('analysis');

    const userMsg = `
以下の研究計画の論理整合性を監査してください。

【リサーチクエスチョン】
${seed.refinedResult?.rq || seed.question || '未設定'}

【研究目的】
${seed.refinedResult?.goal || '未設定'}

【研究デザイン】
${rq.selectedDesign || '未選択'}

【準拠ガイドライン】
${guideline.selected || '未選択'}

【研究対象】
${seed.refinedResult?.target || '未整理'}

【データ収集計画】
データタイプ: ${(data.types || []).join(', ') || '未定'}
サンプルサイズ: ${data.sampleSize || '未定'}
群分け: ${data.grouping || '未定'}

【分析方法】
主解析: ${analysis.aiResult?.primaryAnalysis?.method || '未提案'}
理由: ${analysis.aiResult?.primaryAnalysis?.reason || ''}
副解析: ${(analysis.aiResult?.secondaryAnalyses || []).map(s => s.method).join(', ')}
効果量: ${analysis.aiResult?.effectSize || ''}
多変量解析: ${analysis.aiResult?.multivariateNeeded ? analysis.aiResult?.multivariateMethod : '不要'}
サンプルサイズ根拠: ${analysis.aiResult?.sampleSizeNote || ''}
  `.trim();

    const fullPrompt = `${PROMPTS.logicalAudit}\n\n---\n\n${userMsg}`;

    if (isDemoMode()) {
        const response = DEMO_RESPONSES.logicalAudit;
        state.set('audit.result', response);
        document.querySelector('#auditResults').innerHTML = renderAuditResults(response);
        return;
    }

    // Gemini連携モード
    const resultsArea = document.querySelector('#auditResults');
    resultsArea.innerHTML = renderGeminiUI({
        prompt: fullPrompt,
        containerId: 'geminiAudit',
        label: '論理整合性チェック',
        expectJson: false,
        placeholder: 'Geminiが出力した「🔎 研究整合性チェック結果」をここにコピー＆ペーストしてください...',
    });

    attachGeminiListeners(resultsArea, fullPrompt, (response, raw) => {
        const rawText = raw || response || '';
        state.set('audit.result', rawText);
        resultsArea.innerHTML = renderAuditResults(rawText);

        // サマリー更新
        const sumAudit = document.querySelector('#sumAudit');
        if (sumAudit) {
            const verdict = detectVerdict(rawText);
            sumAudit.textContent = verdict.label;
            sumAudit.classList.add('active');
        }
    });
}

function detectVerdict(text) {
    if (text.includes('🔴')) return { level: 'critical', label: '🔴 要修正', color: '#dc3545' };
    if (text.includes('🟡')) return { level: 'warning', label: '🟡 軽微修正', color: '#ffc107' };
    if (text.includes('🟢')) return { level: 'ok', label: '🟢 問題なし', color: '#28a745' };
    return { level: 'unknown', label: '判定不明', color: '#6c757d' };
}

function renderAuditResults(text) {
    // プリプロセス
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    const verdict = detectVerdict(text);

    // 問題点と修正提案を抽出
    const problemsMatch = text.match(/問題点[\s\S]*?(?=##|修正提案|総合判定|$)/);
    const fixesMatch = text.match(/修正提案[\s\S]*?(?=総合判定|$)/);
    const verdictMatch = text.match(/総合判定[:：]?\s*([\s\S]*?)(?:---|$)/);

    // 判定に応じたバナースタイル
    const bannerStyles = {
        critical: 'background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); border-color: #f5c6cb; color: #721c24;',
        warning: 'background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%); border-color: #f0c36d; color: #856404;',
        ok: 'background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border-color: #c3e6cb; color: #155724;',
        unknown: 'background: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text);',
    };

    const actionButtons = verdict.level === 'critical' ? `
    <div style="margin-top: var(--space-4); display: flex; gap: var(--space-3); flex-wrap: wrap;">
      <button class="btn" style="background: #dc3545; color: white;" onclick="document.querySelector('[data-step=\\"6\\"]').click()">
        ← Step 6（分析方法）に戻って修正
      </button>
      <button class="btn" style="background: #856404; color: white;" onclick="document.querySelector('[data-step=\\"2\\"]').click()">
        ← Step 2（デザイン案）に戻って修正
      </button>
    </div>
  ` : verdict.level === 'warning' ? `
    <div style="margin-top: var(--space-4); display: flex; gap: var(--space-3); flex-wrap: wrap;">
      <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
        ⚠️ 修正を推奨しますが、このまま計画書作成に進むことも可能です。
      </p>
    </div>
  ` : verdict.level === 'ok' ? `
    <div style="margin-top: var(--space-4);">
      <p style="font-size: var(--font-size-sm); color: #155724;">
        ✅ 論理的整合性に問題はありません。「次へ」を押して計画書作成に進んでください。
      </p>
    </div>
  ` : '';

    return `
    <div class="ai-response">
      <div class="ai-response-header">🔎 論理整合性チェック結果</div>
      <div class="ai-response-body">

        <!-- 総合判定バナー -->
        <div style="border: 2px solid; border-radius: var(--radius-md); padding: var(--space-4); margin-bottom: var(--space-4); ${bannerStyles[verdict.level]}">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <span style="font-size: 2rem;">${verdict.level === 'critical' ? '🔴' : verdict.level === 'warning' ? '🟡' : verdict.level === 'ok' ? '🟢' : '❓'}</span>
            <div>
              <p style="font-weight: bold; font-size: 1.1rem; margin-bottom: 4px;">総合判定: ${verdict.label}</p>
              <p style="font-size: var(--font-size-sm);">${verdictMatch ? verdictMatch[1].replace(/<[^>]*>/g, '').trim() : ''}</p>
            </div>
          </div>
          ${actionButtons}
        </div>

        <!-- 問題点 -->
        ${problemsMatch ? `
          <h4>🚨 問題点</h4>
          <div class="card" style="border-left: 4px solid #dc3545; margin-bottom: var(--space-4);">
            <div style="white-space: pre-wrap; line-height: 1.7;">${problemsMatch[0].replace(/^##?\s*🚨?\s*問題点\s*/m, '').trim()}</div>
          </div>
        ` : ''}

        <!-- 修正提案 -->
        ${fixesMatch ? `
          <h4>🔧 修正提案</h4>
          <div class="card" style="border-left: 4px solid #007bff; margin-bottom: var(--space-4);">
            <div style="white-space: pre-wrap; line-height: 1.7;">${fixesMatch[0].replace(/^##?\s*🔧?\s*修正提案\s*/m, '').trim()}</div>
          </div>
        ` : ''}

      </div>
    </div>
  `;
}

export function validateStep7Audit() {
    return !!state.get('audit.result');
}
