/**
 * step6-analysis.js — 分析方法提案ロジック — Gemini連携版
 */

import { state } from '../state.js';
import { PROMPTS, DEMO_RESPONSES } from '../prompts/index.js';
import { renderGeminiUI, attachGeminiListeners, isDemoMode } from '../gemini-helper.js';

// Built-in decision logic (used alongside AI)
const ANALYSIS_RULES = {
  '2groups': {
    continuous: { normal: 't検定（独立2群）', nonNormal: 'Mann-Whitney U検定' },
    categorical: 'χ²検定 / Fisher正確確率検定',
  },
  '3groups': {
    continuous: { normal: '一元配置分散分析（ANOVA）', nonNormal: 'Kruskal-Wallis検定' },
    categorical: 'χ²検定',
  },
  'prepost': {
    continuous: { normal: '対応のあるt検定', nonNormal: 'Wilcoxon符号付順位和検定' },
    categorical: 'McNemar検定',
  },
  'none': {
    continuous: { normal: '記述統計、相関分析', nonNormal: 'Spearman順位相関' },
    categorical: '度数分布、記述統計',
  },
};

export function renderStep6(container) {
  const analysis = state.get('analysis');
  const data = state.get('data');

  container.innerHTML = `
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
        ${renderAutoSuggestion(data)}
      </div>

      <!-- AI-powered detailed proposal -->
      <div class="card" style="margin-bottom: var(--space-6);">
        <button class="btn btn-primary btn-lg" id="btnAnalysis">
          🤖 詳細な分析計画を提案してもらう
        </button>
      </div>

      <div id="step6Results">
        ${analysis.aiResult ? renderAnalysisResults(analysis.aiResult) : ''}
      </div>
    </div>
  `;

  container.querySelector('#btnAnalysis').addEventListener('click', runAnalysis);
}

function renderAutoSuggestion(data) {
  const grouping = data.grouping || 'none';
  const types = data.types || [];
  const rules = ANALYSIS_RULES[grouping] || ANALYSIS_RULES.none;

  const hasContinuous = types.some(t => ['vitals', 'labs', 'scales'].includes(t));
  const hasCategorical = types.some(t => ['attributes', 'intervention'].includes(t));
  const hasTimeseries = types.includes('timeseries');
  const hasQualitative = types.some(t => ['interview', 'observation'].includes(t));

  const suggestions = [];

  if (hasContinuous) {
    suggestions.push(`<li><strong>連続変数の群比較:</strong> ${rules.continuous?.normal || rules.continuous || '記述統計'}（正規分布を仮定）/ ${rules.continuous?.nonNormal || '非パラメトリック検定'}（正規分布でない場合）</li>`);
  }
  if (hasCategorical) {
    suggestions.push(`<li><strong>カテゴリ変数:</strong> ${rules.categorical}</li>`);
  }
  if (hasTimeseries) {
    suggestions.push(`<li><strong>時系列分析:</strong> 線形混合モデル（Linear Mixed Model）/ 反復測定分散分析</li>`);
  }
  if (hasQualitative) {
    suggestions.push(`<li><strong>質的データ:</strong> 質的内容分析 / テーマ分析 / グラウンデッドセオリー</li>`);
  }
  if (data.sampleSize && parseInt(data.sampleSize) < 30) {
    suggestions.push(`<li style="color: var(--color-warning);"><strong>⚠️ 注意:</strong> サンプルサイズが30未満のため、ノンパラメトリック検定の使用を推奨します</li>`);
  }

  if (suggestions.length === 0) {
    return '<p style="color: var(--color-text-muted);">Step 5でデータを選択すると、自動提案が表示されます。</p>';
  }

  return `<ul style="padding-left: var(--space-5);">${suggestions.join('')}</ul>`;
}

function runAnalysis() {
  const data = state.get('data');
  const design = state.get('rq.selectedDesign') || '';

  const userMsg = `
研究デザイン: ${design}
データタイプ: ${(data.types || []).join(', ')}
サンプルサイズ: ${data.sampleSize || '未定'}
群分け: ${data.grouping || '未定'}
  `.trim();

  const fullPrompt = `${PROMPTS.statisticsProposal}\n\n---\n\n${userMsg}`;

  if (isDemoMode()) {
    const parsed = JSON.parse(DEMO_RESPONSES.statisticsProposal);
    state.set('analysis.aiResult', parsed);
    document.querySelector('#step6Results').innerHTML = renderAnalysisResults(parsed);

    const sumAnalysis = document.querySelector('#sumAnalysis');
    if (sumAnalysis) {
      sumAnalysis.textContent = parsed.primaryAnalysis?.method || '提案済み';
      sumAnalysis.classList.add('active');
    }
    return;
  }

  // Gemini連携モード
  const resultsArea = document.querySelector('#step6Results');
  resultsArea.innerHTML = renderGeminiUI({
    prompt: fullPrompt,
    containerId: 'geminiAnalysis',
    label: '統計分析手法の提案',
    expectJson: true,
    placeholder: 'GeminiからのJSON回答をここに貼り付けてください...',
  });

  attachGeminiListeners(resultsArea, fullPrompt, (parsed, raw) => {
    let result;
    if (parsed) {
      result = parsed;
    } else {
      result = { primaryAnalysis: { method: '提案結果', reason: raw } };
    }
    state.set('analysis.aiResult', result);
    resultsArea.innerHTML = renderAnalysisResults(result);

    const sumAnalysis = document.querySelector('#sumAnalysis');
    if (sumAnalysis) {
      sumAnalysis.textContent = result.primaryAnalysis?.method || '提案済み';
      sumAnalysis.classList.add('active');
    }
  }, true);
}

function renderAnalysisResults(data) {
  return `
    <div class="ai-response">
      <div class="ai-response-header">📐 分析方法提案</div>
      <div class="ai-response-body">

        ${data.primaryAnalysis ? `
          <h4>🎯 主解析</h4>
          <div class="card card-highlight" style="margin-bottom: var(--space-4);">
            <h3 style="color: var(--color-primary); margin-bottom: var(--space-2);">${data.primaryAnalysis.method}</h3>
            <div style="white-space: pre-wrap; line-height: 1.6;">${data.primaryAnalysis.reason}</div>
          </div>
        ` : ''}

        ${data.secondaryAnalyses?.length ? `
          <h4>📊 副解析の候補</h4>
          ${data.secondaryAnalyses.map(s => `
            <div class="card" style="margin-bottom: var(--space-3);">
              <strong>${s.method}</strong>
              <div style="color: var(--color-text-secondary); margin-top: var(--space-2); white-space: pre-wrap; line-height: 1.5;">${s.reason}</div>
            </div>
          `).join('')}
        ` : ''}

        ${data.effectSize ? `
          <h4>📏 効果量</h4>
          <p>${data.effectSize}</p>
        ` : ''}

        ${data.multivariateNeeded !== undefined ? `
          <h4>🔗 多変量解析</h4>
          <p>${data.multivariateNeeded ? `<span class="tag tag-warning">必要</span> ${data.multivariateMethod || ''}` : '<span class="tag tag-success">不要</span>'}</p>
        ` : ''}

        ${data.sampleSizeNote ? `
          <h4>👥 サンプルサイズ概算</h4>
          <div class="card card-success">
            <div style="white-space: pre-wrap; line-height: 1.5;">${data.sampleSizeNote}</div>
          </div>
        ` : ''}

      </div>
    </div>
  `;
}

export function validateStep6() {
  return !!state.get('analysis.aiResult');
}
