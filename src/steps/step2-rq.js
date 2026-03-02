/**
 * step2-rq.js — デザイン案 (Research Design Proposal) — Gemini連携版
 * 最優先の1案を提案し、代替デザインも希望できる設計
 */

import { state } from '../state.js';
import { PROMPTS, DEMO_RESPONSES } from '../prompts/index.js';
import { renderGeminiUI, attachGeminiListeners, isDemoMode } from '../gemini-helper.js';

export function renderStep2(container) {
  const rq = state.get('rq');
  const refinedResult = state.get('seed.refinedResult');

  if (!refinedResult) {
    container.innerHTML = `
      <div class="fade-in">
        <h2 class="step-title">📋 Step 2：デザイン案</h2>
        <div class="card" style="text-align: center; padding: var(--space-12);">
          <p class="text-muted">先にStep 1で「整理された骨子」を完成させてください。</p>
          <button class="btn btn-primary mt-4" onclick="document.querySelector('[data-step=\\'1\\']').click()">Step 1へ戻る</button>
        </div>
      </div>
    `;
    return;
  }

  // 現在の提案と履歴
  const currentProposal = rq.aiResults;
  const history = rq.proposalHistory || [];
  const selectedDesign = rq.selectedDesign;

  container.innerHTML = `
    <div class="fade-in">
      <h2 class="step-title">📋 Step 2：研究デザイン提案</h2>
      <p class="step-description">
        整理された骨子に基づき、FINER基準に準拠した最適な研究デザインを提案します。
      </p>

      <div class="card highlight-card" style="margin-bottom: var(--space-6);">
        <div class="format-row">
          <span class="format-label">テーマ:</span>
          <span class="format-value"><strong>${refinedResult.theme || refinedResult.title || '未設定'}</strong></span>
        </div>
        <div class="format-row" style="margin-top: var(--space-2);">
          <span class="format-label">リサーチクエスチョン:</span>
          <span class="format-value"><strong>${refinedResult.rq || refinedResult.title || '未設定'}</strong></span>
        </div>
        <div class="format-row">
          <span class="format-label">対象:</span>
          <span class="format-value">${refinedResult.target}</span>
        </div>
      </div>

      <div id="designProposalArea">
        ${currentProposal ? renderProposal(currentProposal, selectedDesign, history) : `
          <div style="text-align: center; padding: var(--space-8);">
            <button class="btn btn-primary btn-lg" id="btnGenerateDesign">
              🤖 最適な研究デザインを提案してもらう
            </button>
          </div>
        `}
      </div>
    </div>
  `;

  const btnGenerate = container.querySelector('#btnGenerateDesign');
  if (btnGenerate) {
    btnGenerate.addEventListener('click', () => generateDesign(false));
  } else if (currentProposal) {
    attachListeners(container);
  }
}

function generateDesign(requestAlternative = false) {
  const refinedResult = state.get('seed.refinedResult');
  const history = state.get('rq.proposalHistory') || [];
  const currentProposal = state.get('rq.aiResults');

  let userMsg = `
整理されたリサーチクエスチョン: ${refinedResult.rq || refinedResult.title || '未設定'}
対象: ${refinedResult.target || '未設定'}
ゴール: ${refinedResult.goal || '未設定'}
アプローチ例: ${(refinedResult.approaches || []).map(a => a.name).join(', ')}
  `.trim();

  if (requestAlternative && (currentProposal || history.length > 0)) {
    const pastDesigns = [];
    history.forEach(h => pastDesigns.push(h.design));
    if (currentProposal) pastDesigns.push(currentProposal.design);
    userMsg += `\n\n【重要】以下の研究デザインはすでに提案済みです。これらとは異なる視点・方法論の研究デザインを提案してください：\n${pastDesigns.map((d, i) => `${i + 1}. ${d}`).join('\n')}`;
  }

  const fullPrompt = `${PROMPTS.designSelection}\n\n---\n\n${userMsg}`;

  if (isDemoMode()) {
    // デモモード
    const demoResult = JSON.parse(DEMO_RESPONSES.designSelection);

    if (requestAlternative && currentProposal) {
      const updatedHistory = [...history, currentProposal];
      state.set('rq.proposalHistory', updatedHistory);
    }

    state.set('rq.aiResults', demoResult);
    state.set('rq.selectedDesign', null);

    const area = document.querySelector('#designProposalArea');
    if (area) {
      const newHistory = state.get('rq.proposalHistory') || [];
      area.innerHTML = renderProposal(demoResult, null, newHistory);
      attachListeners(area);
    }
    return;
  }

  // Gemini連携モード
  const area = document.querySelector('#designProposalArea');
  if (area) {
    area.innerHTML = renderGeminiUI({
      prompt: fullPrompt,
      containerId: 'geminiDesign',
      label: '研究デザイン提案',
      expectJson: false,
      placeholder: 'Geminiが出力した「📋 研究デザイン提案」をここにコピー＆ペーストしてください...',
    });

    attachGeminiListeners(area, fullPrompt, (response, raw) => {
      const rawText = raw || response || '';

      // 1. まずJSON形式を試行
      let proposal = null;
      try {
        const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*"design"\s*:[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          proposal = normalizeProposal(parsed);
        }
      } catch (_) { /* skip */ }

      // 2. JSONが失敗したらテキスト形式からパース
      if (!proposal) {
        proposal = parseTextDesign(rawText);
      }

      if (proposal) {
        if (requestAlternative && currentProposal) {
          const updatedHistory = [...history, currentProposal];
          state.set('rq.proposalHistory', updatedHistory);
        }

        state.set('rq.aiResults', proposal);
        state.set('rq.selectedDesign', null);

        const newHistory = state.get('rq.proposalHistory') || [];
        area.innerHTML = renderProposal(proposal, null, newHistory);
        attachListeners(area);
      } else {
        alert('提案内容を判読できませんでした。Geminiが出力した「📋 研究デザイン提案」の部分をそのまま貼り付けてください。');
      }
    });
  }
}

function normalizeProposal(data) {
  // 配列の場合は最初の要素を使用
  if (Array.isArray(data)) data = data[0];
  if (data.proposals) data = data.proposals[0];

  return {
    design: data.design || data.title || data.name || 'デザイン提案',
    vision: data.vision || data.description || data.overview || '',
    finer: data.finer || {},
    reason: data.reason || data.recommendation || data.rationale || '',
  };
}

function parseTextDesign(raw) {
  // プリプロセス: 太字マークダウン除去、リスト記号除去
  raw = raw.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^[-•]\s*/gm, '').replace(/^\d+\.\s*/gm, '');

  const result = {
    design: '',
    vision: '',
    finer: {},
    reason: '',
  };

  // 推奨デザインを探す
  const designMatch = raw.match(/推奨デザイン\s*[:：]\s*(.+?)(?:\n|$)/);
  if (designMatch) result.design = designMatch[1].trim();

  // ビジョンを探す
  const visionMatch = raw.match(/研究のビジョン\s*[:：]\s*([\s\S]*?)(?=(?:FINER|推奨理由|---|$))/);
  if (visionMatch) result.vision = visionMatch[1].trim();

  // FINER評価を探す
  const fMatch = raw.match(/実現可能性[（(]?F[)）]?\s*[:：]\s*(.+?)(?:\n|$)/);
  if (fMatch) result.finer.f = fMatch[1].trim();
  const iMatch = raw.match(/面白さ[（(]?I[)）]?\s*[:：]\s*(.+?)(?:\n|$)/);
  if (iMatch) result.finer.i = iMatch[1].trim();
  const nMatch = raw.match(/新規性[（(]?N[)）]?\s*[:：]\s*(.+?)(?:\n|$)/);
  if (nMatch) result.finer.n = nMatch[1].trim();
  const eMatch = raw.match(/倫理性[（(]?E[)）]?\s*[:：]\s*(.+?)(?:\n|$)/);
  if (eMatch) result.finer.e = eMatch[1].trim();
  const rMatch = raw.match(/関連性[（(]?R[)）]?\s*[:：]\s*(.+?)(?:\n|$)/);
  if (rMatch) result.finer.r = rMatch[1].trim();

  // 推奨理由を探す
  const reasonMatch = raw.match(/推奨理由\s*[:：]\s*([\s\S]*?)(?=(?:---|✅|📌|$))/);
  if (reasonMatch) result.reason = reasonMatch[1].trim();

  // デザイン名がなくても内容があれば採用
  if (!result.design && raw.trim().length > 30) {
    result.design = raw.trim().split('\n')[0].substring(0, 100);
  }

  if (result.design) return result;
  return null;
}

/**
 * メイン提案カードをレンダリング
 */
function renderProposal(proposal, selectedDesign, history) {
  const isSelected = selectedDesign === proposal.design;
  const finerRows = renderFinerDetails(proposal.finer);

  let historySection = '';
  if (history.length > 0) {
    historySection = `
      <div class="card" style="margin-top: var(--space-6); background: var(--color-bg-secondary, #f8f9fa);">
        <h4 style="margin-bottom: var(--space-3); font-size: 0.9rem; color: var(--color-text-secondary);">
          📁 過去の提案（${history.length}件）
        </h4>
        <p class="small text-muted" style="margin-bottom: var(--space-3);">以前の提案を採用したい場合はクリックしてください。</p>
        <div class="history-list">
          ${history.map((h, i) => `
            <div class="history-item ${selectedDesign === h.design ? 'selected' : ''}" data-history-index="${i}" data-design="${escapeHtml(h.design)}">
              <span class="history-number">${i + 1}</span>
              <span class="history-title">${escapeHtml(h.design)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return `
    <div class="ai-response">
      <div class="ai-response-header">🤖 熟練研究者による研究デザイン提案</div>
      <div class="ai-response-body">
        <p class="mb-4">最新の知見と研究の意義に基づき、FINER基準に準拠した最適な研究デザインを提案します。</p>
        
        <div class="proposal-card main-proposal ${isSelected ? 'selected' : ''}" data-design="${escapeHtml(proposal.design)}" data-is-current="true">
          <div class="proposal-header">
            <span class="badge recommended">★ 推奨デザイン</span>
          </div>
          
          <h3 class="proposal-title">${escapeHtml(proposal.design)}</h3>
          
          ${proposal.vision ? `
            <div class="proposal-section">
              <h4>🔭 研究のビジョン</h4>
              <p>${escapeHtml(proposal.vision)}</p>
            </div>
          ` : ''}

          ${finerRows}
          
          ${proposal.reason ? `
            <div class="proposal-section mt-2">
              <h4>📝 推奨理由</h4>
              <p class="small text-muted">${escapeHtml(proposal.reason)}</p>
            </div>
          ` : ''}
          
          <div class="select-hint">${isSelected ? '✅ 選択済み — クリックで選択解除' : 'クリックしてこのデザインを採用'}</div>
        </div>

        <div style="text-align: center; margin-top: var(--space-6);">
          <p class="small text-muted" style="margin-bottom: var(--space-3);">このデザインがしっくりこない場合は、別の視点から再提案できます。</p>
          <button class="btn btn-outline" id="btnAlternativeDesign" style="font-size: 0.9rem;">
            🔄 別の視点でデザインを提案してもらう
          </button>
        </div>
      </div>
    </div>

    ${historySection}

    <div class="card" style="margin-top: var(--space-6);">
      <h3 class="section-title">✍️ 自分で研究デザインを選択する</h3>
      <p class="text-muted" style="margin-bottom: var(--space-4);">AIの提案がイメージと違う場合、以下のリストから自分で研究デザイン（研究タイプ）を選択できます。</p>
      
      <div class="form-group">
        <label for="manualDesignSelect">研究タイプを選択</label>
        <select id="manualDesignSelect" class="select" style="max-width: 400px;">
          <option value="">（選択してください）</option>
          <option value="介入研究" ${selectedDesign === '介入研究' ? 'selected' : ''}>介入研究（RCTなど）</option>
          <option value="観察研究" ${selectedDesign === '観察研究' ? 'selected' : ''}>観察研究（コホート・横断など）</option>
          <option value="質的研究" ${selectedDesign === '質的研究' ? 'selected' : ''}>質的研究（インタビューなど）</option>
          <option value="QI（質改善）" ${selectedDesign === 'QI（質改善）' ? 'selected' : ''}>QI（質改善プロジェクト）</option>
          <option value="事例／実践報告" ${selectedDesign === '事例／実践報告' ? 'selected' : ''}>事例／実践報告</option>
          <option value="システマティックレビュー" ${selectedDesign === 'システマティックレビュー' ? 'selected' : ''}>システマティックレビュー</option>
          <option value="スコーピングレビュー" ${selectedDesign === 'スコーピングレビュー' ? 'selected' : ''}>スコーピングレビュー</option>
          <option value="混合研究法" ${selectedDesign === '混合研究法' ? 'selected' : ''}>混合研究法</option>
        </select>
        <p class="hint">これを選択すると、AIの提案ではなくここで選んだデザインが採用されます。</p>
      </div>
    </div>
  `;
}

function renderFinerDetails(finer) {
  if (!finer || Object.keys(finer).length === 0) {
    return '';
  }

  const labels = {
    f: { icon: '✅', label: '実現可能性' },
    i: { icon: '💡', label: '面白さ' },
    n: { icon: '🆕', label: '新規性' },
    e: { icon: '🛡️', label: '倫理性' },
    r: { icon: '🎯', label: '関連性' },
  };

  const rows = Object.entries(labels).map(([key, meta]) => {
    const value = finer[key];
    if (!value || value === true) return '';
    return `
      <div class="finer-detail-row">
        <span class="finer-label">${meta.icon} ${meta.label}</span>
        <span class="finer-value">${escapeHtml(String(value))}</span>
      </div>
    `;
  }).filter(r => r).join('');

  if (!rows) return '';

  return `
    <div class="proposal-section finer-details">
      <h4>📊 FINER基準評価</h4>
      ${rows}
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function attachListeners(container) {
  // メイン提案カードのクリック
  const mainCard = container.querySelector('.proposal-card[data-is-current="true"]');
  if (mainCard) {
    mainCard.addEventListener('click', () => {
      const design = mainCard.dataset.design;
      const currentSelected = state.get('rq.selectedDesign');
      const manualSelect = container.querySelector('#manualDesignSelect');

      if (currentSelected === design) {
        state.set('rq.selectedDesign', null);
        mainCard.classList.remove('selected');
        mainCard.querySelector('.select-hint').textContent = 'クリックしてこのデザインを採用';
      } else {
        container.querySelectorAll('.proposal-card, .history-item').forEach(c => c.classList.remove('selected'));
        mainCard.classList.add('selected');
        state.set('rq.selectedDesign', design);
        mainCard.querySelector('.select-hint').textContent = '✅ 選択済み — クリックで選択解除';
        if (manualSelect) manualSelect.value = '';
      }
      updateSummary('Design', state.get('rq.selectedDesign') || '');
    });
  }

  // 履歴アイテムのクリック
  container.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const design = item.dataset.design;
      const currentSelected = state.get('rq.selectedDesign');
      const manualSelect = container.querySelector('#manualDesignSelect');

      if (currentSelected === design) {
        state.set('rq.selectedDesign', null);
        item.classList.remove('selected');
      } else {
        container.querySelectorAll('.proposal-card, .history-item').forEach(c => c.classList.remove('selected'));
        item.classList.add('selected');
        state.set('rq.selectedDesign', design);
        const hint = container.querySelector('.proposal-card[data-is-current="true"] .select-hint');
        if (hint) hint.textContent = 'クリックしてこのデザインを採用';
        if (manualSelect) manualSelect.value = '';
      }
      updateSummary('Design', state.get('rq.selectedDesign') || '');
    });
  });

  // 手動デザイン選択セレクトボックス
  const manualSelect = container.querySelector('#manualDesignSelect');
  if (manualSelect) {
    manualSelect.addEventListener('change', (e) => {
      const design = e.target.value;
      if (design) {
        container.querySelectorAll('.proposal-card, .history-item').forEach(c => c.classList.remove('selected'));
        const hint = container.querySelector('.proposal-card[data-is-current="true"] .select-hint');
        if (hint) hint.textContent = 'クリックしてこのデザインを採用';
        state.set('rq.selectedDesign', design);
      } else {
        state.set('rq.selectedDesign', null);
      }
      updateSummary('Design', state.get('rq.selectedDesign') || '');
    });
  }

  // 代替デザインボタン
  const altBtn = container.querySelector('#btnAlternativeDesign');
  if (altBtn) {
    altBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      generateDesign(true);
    });
  }
}

function updateSummary(key, value) {
  const el = document.querySelector(`#sum${key}`);
  if (el) {
    el.textContent = value;
    el.classList.add('active');
  }
}

export function validateStep2() {
  return !!state.get('rq.selectedDesign');
}
