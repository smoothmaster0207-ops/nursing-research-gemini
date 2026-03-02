/**
 * step4-review.js — 文献レビュー支援 — Gemini連携版
 */

import { state } from '../state.js';
import { PROMPTS, DEMO_RESPONSES } from '../prompts/index.js';
import { CHECKLIST_ITEMS } from './step3-guideline.js';
import { renderGeminiUI, attachGeminiListeners, isDemoMode } from '../gemini-helper.js';

function getChecklistItems(guidelineName) {
  return CHECKLIST_ITEMS[guidelineName] || [];
}

export function renderStep4(container) {
  const review = state.get('review');

  container.innerHTML = `
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
                 value="${review.keywords || ''}" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
          <div class="form-group">
            <label for="reviewLang">文献の対象範囲</label>
            <select id="reviewLang" class="select">
              <option value="ja+en" ${review.language === 'ja+en' ? 'selected' : ''}>国内・国際の両方</option>
              <option value="en" ${review.language === 'en' ? 'selected' : ''}>国際（英語）のみ</option>
              <option value="ja" ${review.language === 'ja' ? 'selected' : ''}>国内（日本語）のみ</option>
            </select>
          </div>

          <div class="form-group">
            <label for="reviewContext">重視する視点</label>
            <select id="reviewContext" class="select">
              <option value="academic" ${review.context === 'academic' ? 'selected' : ''}>学術的・論理的整合性</option>
              <option value="clinical" ${review.context === 'clinical' ? 'selected' : ''}>臨床上の喫緊の課題</option>
              <option value="ethical" ${review.context === 'ethical' ? 'selected' : ''}>倫理・人権の観点</option>
            </select>
          </div>
        </div>

        <button class="btn btn-primary btn-lg" id="btnReview">
          🖋 背景・意義の論理構成を生成
        </button>
      </div>

      <div id="step4Results">
        ${review.aiResult ? renderReviewResults(review.aiResult) : ''}
      </div>
    </div>
  `;

  // Event listeners
  const keywordsInput = container.querySelector('#reviewKeywords');
  const langSelect = container.querySelector('#reviewLang');
  const contextSelect = container.querySelector('#reviewContext');

  keywordsInput.addEventListener('input', () => state.set('review.keywords', keywordsInput.value));
  langSelect.addEventListener('change', () => state.set('review.language', langSelect.value));
  contextSelect?.addEventListener('change', () => state.set('review.context', contextSelect.value));

  container.querySelector('#btnReview').addEventListener('click', runReview);

  const btnSuggest = container.querySelector('#btnSuggestQueries');
  if (btnSuggest) {
    btnSuggest.addEventListener('click', suggestQueries);
  }

  // 既に提案データがあれば表示を復元
  if (review.suggestedQueries) {
    renderSuggestedQueries(review.suggestedQueries);
  }
}

function suggestQueries() {
  const area = document.querySelector('#suggestedQueriesArea');
  if (!area) return;

  const refined = state.get('seed.refinedResult');
  const theme = refined?.rq || refined?.title || '';
  const rqText = refined?.goal || '';
  const purpose = refined?.goal || '';
  const design = state.get('rq.selectedDesign') || '';

  const userMsg = `
研究テーマ: ${theme}
リサーチクエスチョン: ${rqText}
研究の目的: ${purpose}
研究デザイン: ${design}
  `.trim();

  const fullPrompt = `${PROMPTS.searchQuerySuggestion}\n\n---\n\n${userMsg}`;

  if (isDemoMode()) {
    const parsed = JSON.parse(DEMO_RESPONSES.searchQuerySuggestion);
    state.set('review.suggestedQueries', parsed);
    renderSuggestedQueries(parsed);

    const keywordsInput = document.querySelector('#reviewKeywords');
    if (keywordsInput && !keywordsInput.value.trim() && parsed.keywordsJa) {
      const newKeywords = parsed.keywordsJa.join(' ');
      keywordsInput.value = newKeywords;
      state.set('review.keywords', newKeywords);
    }
    return;
  }

  // Gemini連携モード
  area.style.display = 'block';
  area.innerHTML = renderGeminiUI({
    prompt: fullPrompt,
    containerId: 'geminiSuggest',
    label: '検索キーワード・式の提案',
    expectJson: false,
    placeholder: 'Geminiが出力した「📋 検索キーワード」をここにコピー＆ペーストしてください...',
  });

  attachGeminiListeners(area, fullPrompt, (response, raw) => {
    const rawText = raw || response || '';

    // JSON形式を試行
    let parsed = null;
    try {
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*"keywordsJa"[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch (_) { /* skip */ }

    // テキスト形式からパース
    if (!parsed) {
      parsed = parseTextKeywords(rawText);
    }

    if (parsed) {
      state.set('review.suggestedQueries', parsed);
      renderSuggestedQueries(parsed);

      const keywordsInput = document.querySelector('#reviewKeywords');
      if (keywordsInput && !keywordsInput.value.trim() && parsed.keywordsJa) {
        const keywords = Array.isArray(parsed.keywordsJa) ? parsed.keywordsJa : [parsed.keywordsJa];
        const newKeywords = keywords.join(' ');
        keywordsInput.value = newKeywords;
        state.set('review.keywords', newKeywords);
      }
    } else {
      area.innerHTML = `
        <div class="card" style="border-color: var(--color-danger);">
          <p style="color: var(--color-danger);">⚠️ 回答を判読できませんでした。Geminiの回答をそのまま貼り付けてください。</p>
        </div>
      `;
    }
  });
}

function renderSuggestedQueries(data) {
  const area = document.querySelector('#suggestedQueriesArea');
  if (!area) return;

  // 検索リンクを生成
  const jaKeywords = (data.keywordsJa || []).join(' ');
  const enKeywords = (data.keywordsEn || []).join(' ');
  const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(enKeywords)}`;
  const scholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(enKeywords)}`;
  const ciniiUrl = `https://cir.nii.ac.jp/all?q=${encodeURIComponent(jaKeywords)}`;
  const jstageUrl = `https://www.jstage.jst.go.jp/result/global/-char/ja?globalSearchKey=${encodeURIComponent(jaKeywords)}`;

  const linkBtnStyle = 'display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:4px;font-size:0.78rem;text-decoration:none;border:1px solid;margin-top:6px;margin-right:6px;font-weight:500;';

  area.style.display = 'block';
  area.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); background: var(--color-primary-bg); padding: var(--space-4); border-radius: var(--radius-sm); border: 1px solid var(--color-primary-border);">
      <!-- 日本語 -->
      <div style="background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
        <h4 style="font-size: 0.9rem; margin-bottom: var(--space-2); color: var(--color-primary-dark);">🇯🇵 医中誌Web用（日本語）</h4>
        <div style="margin-bottom: var(--space-2);">
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">推奨キーワード:</span><br>
          <span style="font-size: 0.9rem; font-weight: 500;">${(data.keywordsJa || []).join(', ')}</span>
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">検索式（コピーして使えます）:</span>
          <textarea readonly class="input" style="font-family: monospace; font-size: 0.8rem; padding: var(--space-2); min-height: 60px; background: var(--color-bg); margin-top: var(--space-1); resize: none;" onclick="this.select()">${data.queryJa || ''}</textarea>
        </div>
        <div style="margin-top: var(--space-2);">
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">直接検索:</span><br>
          <a href="${ciniiUrl}" target="_blank" rel="noopener" style="${linkBtnStyle}color:#1a73e8;border-color:#1a73e8;background:#e8f0fe;">📚 CiNii Research</a>
          <a href="${jstageUrl}" target="_blank" rel="noopener" style="${linkBtnStyle}color:#2e7d32;border-color:#2e7d32;background:#e8f5e9;">📄 J-STAGE</a>
        </div>
      </div>
      
      <!-- 英語 -->
      <div style="background: var(--color-surface); padding: var(--space-3); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
        <h4 style="font-size: 0.9rem; margin-bottom: var(--space-2); color: var(--color-primary-dark);">🌍 PubMed用（英語）</h4>
        <div style="margin-bottom: var(--space-2);">
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">推奨キーワード:</span><br>
          <span style="font-size: 0.9rem; font-weight: 500;">${(data.keywordsEn || []).join(', ')}</span>
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">検索式（コピーして使えます）:</span>
          <textarea readonly class="input" style="font-family: monospace; font-size: 0.8rem; padding: var(--space-2); min-height: 60px; background: var(--color-bg); margin-top: var(--space-1); resize: none;" onclick="this.select()">${data.queryEn || ''}</textarea>
        </div>
        <div style="margin-top: var(--space-2);">
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">直接検索:</span><br>
          <a href="${pubmedUrl}" target="_blank" rel="noopener" style="${linkBtnStyle}color:#1565c0;border-color:#1565c0;background:#e3f2fd;">🔬 PubMed</a>
          <a href="${scholarUrl}" target="_blank" rel="noopener" style="${linkBtnStyle}color:#4285f4;border-color:#4285f4;background:#e8f0fe;">🎓 Google Scholar</a>
        </div>
      </div>
    </div>
  `;
}

function runReview() {
  const review = state.get('review');
  const refined = state.get('seed.refinedResult');
  const theme = refined?.rq || refined?.title || '';
  const rqText = refined?.goal || '';
  const purpose = refined?.goal || '';
  const design = state.get('rq.selectedDesign') || '';
  const guidelineName = state.get('guideline.selected') || '';

  // チェックリストのメモ情報を収集
  const notes = state.get('guideline.notes') || {};
  const guidelineItems = getChecklistItems(guidelineName);
  let checklistSummary = '';
  if (guidelineItems.length > 0) {
    const filled = [];
    const unfilled = [];
    guidelineItems.forEach((item, i) => {
      const note = notes[i];
      if (note && note.trim()) {
        filled.push(`✓ ${item}: ${note.trim()}`);
      } else {
        unfilled.push(`□ ${item}`);
      }
    });
    if (filled.length > 0) {
      checklistSummary += `\n検討済みの項目:\n${filled.join('\n')}`;
    }
    if (unfilled.length > 0) {
      checklistSummary += `\n未検討の項目（文献レビューで補完が必要）:\n${unfilled.join('\n')}`;
    }
  }

  const userMsg = `
研究テーマ: ${theme}
リサーチクエスチョン: ${rqText}
研究の目的: ${purpose}
研究デザイン: ${design}
準拠ガイドライン: ${guidelineName}
重視するキーワード: ${review.keywords}
対象範囲: ${review.language}
重視する視点: ${review.context || '特定なし'}
${checklistSummary}
  `.trim();

  const fullPrompt = `${PROMPTS.literatureReview}\n\n---\n\n${userMsg}`;

  if (isDemoMode()) {
    const parsed = JSON.parse(DEMO_RESPONSES.literatureReview);
    state.set('review.aiResult', parsed);
    document.querySelector('#step4Results').innerHTML = renderReviewResults(parsed);

    const sumLit = document.querySelector('#sumLiterature');
    if (sumLit) {
      sumLit.textContent = '背景構築済み';
      sumLit.classList.add('active');
    }
    return;
  }

  // Gemini連携モード
  const resultsArea = document.querySelector('#step4Results');
  resultsArea.innerHTML = renderGeminiUI({
    prompt: fullPrompt,
    containerId: 'geminiReview',
    label: '背景・意義の論理構成',
    expectJson: false,
    placeholder: 'Geminiが出力した「📋 研究背景・意義の論理構成案」をここにコピー＆ペーストしてください...',
  });

  attachGeminiListeners(resultsArea, fullPrompt, (response, raw) => {
    const rawText = raw || response || '';

    // JSON形式を試行
    let result = null;
    try {
      const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*"structure"[\s\S]*\}/);
      if (jsonMatch) result = JSON.parse(jsonMatch[0]);
    } catch (_) { /* skip */ }

    // テキスト形式はそのまま使用
    if (!result) {
      result = { structure: rawText };
    }

    state.set('review.aiResult', result);
    resultsArea.innerHTML = renderReviewResults(result);

    const sumLit = document.querySelector('#sumLiterature');
    if (sumLit) {
      sumLit.textContent = '背景構築済み';
      sumLit.classList.add('active');
    }
  });
}

function renderReviewResults(data) {
  const content = data.structure || data.narrative || '';
  return `
    <div class="ai-response">
      <div class="ai-response-header">📖 背景と意義の論理構成案（設計図）</div>
      <div class="ai-response-body">
        <p class="text-muted" style="margin-bottom: var(--space-4); font-size: 0.9rem;">
          以下は検索した文献を使ってどのような順番で背景を記述するべきかの「構成案」です。これを参考に実際の文献を検索し、ご自身で文章を肉付けしてください。
        </p>
        <div class="academic-text" style="line-height: 1.8;">
          ${content.replace(/\n/g, '<br>')}
        </div>
      </div>
    </div>
  `;
}

export function validateStep4() {
  return !!state.get('review.aiResult');
}

function parseTextKeywords(text) {
  // プリプロセス: 太字マークダウン除去、リスト記号除去
  text = text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^[-•]\s*/gm, '').replace(/^\d+\.\s*/gm, '');

  const result = {
    keywordsJa: [],
    keywordsEn: [],
    queryJa: '',
    queryEn: '',
  };

  // 日本語キーワードを探す
  const jaMatch = text.match(/日本語キーワード\s*[:：]\s*(.+?)(?:\n|$)/i);
  if (jaMatch) {
    result.keywordsJa = jaMatch[1].split(/[,、，]/).map(k => k.trim()).filter(k => k);
  }

  // 英語キーワードを探す
  const enMatch = text.match(/英語キーワード\s*[:：]\s*(.+?)(?:\n|$)/i);
  if (enMatch) {
    result.keywordsEn = enMatch[1].split(/[,、，]/).map(k => k.trim()).filter(k => k);
  }

  // 日本語検索式を探す
  const queryJaMatch = text.match(/日本語検索式\s*[:：]\s*([\s\S]*?)(?=(?:🌍|英語キーワード|英語検索式|---|✅|📌|$))/i);
  if (queryJaMatch) result.queryJa = queryJaMatch[1].trim();

  // 英語検索式を探す
  const queryEnMatch = text.match(/英語検索式\s*[:：]\s*([\s\S]*?)(?=(?:---|✅|📌|$))/i);
  if (queryEnMatch) result.queryEn = queryEnMatch[1].trim();

  // 最低限キーワードがあれば成功
  if (result.keywordsJa.length > 0 || result.keywordsEn.length > 0) return result;
  return null;
}
