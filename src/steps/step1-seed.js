/**
 * step1-seed.js — 種と整理 (Initial Seed + Gemini連携) — Gemini連携版
 */

import { state } from '../state.js';
import { PROMPTS, DEMO_RESPONSES } from '../prompts/index.js';
import { renderGeminiUI, attachGeminiListeners, isDemoMode } from '../gemini-helper.js';

export function renderStep1(container) {
  const seed = state.get('seed');
  const refinedResult = seed.refinedResult || null;

  container.innerHTML = `
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
          <textarea id="seedQuestion" class="textarea" placeholder="例：高齢の入院患者が退院後すぐに再入院してしまうケースが多い。退院支援のやり方を変えれば防げるのではないか？">${seed.question || ''}</textarea>
        </div>

        <button class="btn btn-primary btn-lg" id="btnStartChat" ${!seed.question ? 'disabled' : ''}>
          🤖 Geminiでブレインストーミングを始める
        </button>
      </div>

      <div id="geminiArea" class="hidden">
        <div class="card">
          <h3 class="section-title">🗣 Geminiとのブレインストーミング</h3>
          <div id="geminiChatUI"></div>
        </div>
      </div>

      <div id="refinedResultArea" class="${refinedResult ? '' : 'hidden'}">
        ${refinedResult ? renderRefinedResult(refinedResult) : ''}
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
  `;

  // Event listeners
  const textarea = container.querySelector('#seedQuestion');
  const btnStartChat = container.querySelector('#btnStartChat');
  const geminiArea = container.querySelector('#geminiArea');

  // Modal logic
  const privacyModal = container.querySelector('#privacyModal');
  const btnOpenPrivacyModal = container.querySelector('#btnOpenPrivacyModal');
  const btnClosePrivacyModal = container.querySelector('#btnClosePrivacyModal');

  if (btnOpenPrivacyModal) {
    btnOpenPrivacyModal.addEventListener('click', () => {
      privacyModal.classList.add('visible');
    });
  }

  if (btnClosePrivacyModal) {
    btnClosePrivacyModal.addEventListener('click', () => {
      privacyModal.classList.remove('visible');
    });
  }

  if (privacyModal) {
    privacyModal.addEventListener('click', (e) => {
      if (e.target === privacyModal) {
        privacyModal.classList.remove('visible');
      }
    });
  }

  textarea.addEventListener('input', () => {
    state.set('seed.question', textarea.value);
    btnStartChat.disabled = !textarea.value.trim();
  });

  btnStartChat.addEventListener('click', () => {
    geminiArea.classList.remove('hidden');
    showGeminiPromptUI(textarea.value);
    geminiArea.scrollIntoView({ behavior: 'smooth' });
  });

  if (refinedResult) {
    const area = container.querySelector('#refinedResultArea');
    attachRefinedResultListeners(area, refinedResult);
    // 右サイドバーにも反映
    updateSummary('Theme', (refinedResult.theme || refinedResult.rq || '').substring(0, 60));
    updateSummary('RQ', refinedResult.rq || '');
  }
}

function showGeminiPromptUI(question) {
  const prompt = `${PROMPTS.rqAssistant}\n\n---\n\n【ユーザーからの研究の種】\n${question}`;

  const geminiUIContainer = document.querySelector('#geminiChatUI');
  if (!geminiUIContainer) return;

  if (isDemoMode()) {
    // デモモード: サンプルレスポンスを使用
    handleDemoMode(question);
    return;
  }

  geminiUIContainer.innerHTML = renderGeminiUI({
    prompt: prompt,
    containerId: 'geminiChat',
    label: 'ブレインストーミング（研究の種の整理）',
    expectJson: false,
    placeholder: 'Geminiが出力した「📋 研究の骨子」をここにコピー＆ペーストしてください...',
  });

  attachGeminiListeners(geminiUIContainer, prompt, (response) => {
    if (response) {
      const rawText = response || '';

      // テキストから骨子をパース
      let parsed = tryParseJSON(rawText);
      if (!parsed) {
        parsed = parseTextSkeleton(rawText);
      }

      if (parsed) {
        // 骨子を保存してUIに反映
        state.set('seed.refinedResult', parsed);
        const area = document.querySelector('#refinedResultArea');
        if (area) {
          area.classList.remove('hidden');
          area.innerHTML = renderRefinedResult(parsed);
          attachRefinedResultListeners(area, parsed);
          area.scrollIntoView({ behavior: 'smooth' });
        }
        // 右サイドバーに反映
        updateSummary('Theme', (parsed.theme || parsed.rq || '').substring(0, 60));
        updateSummary('RQ', parsed.rq || '');

        // Gemini UIを「完了」状態に
        geminiUIContainer.innerHTML = `
          <div class="card" style="background: #f0fdf4; border: 1px solid #86efac; text-align: center; padding: var(--space-4);">
            <p style="color: #166534; font-weight: 600; margin: 0;">✅ 研究の骨子を取り込みました。下の内容を確認して次へ進んでください。</p>
          </div>
        `;
      } else {
        alert('骨子の内容を判読できませんでした。Geminiが出力した「📋 研究の骨子」の部分をそのまま貼り付けてください。');
      }
    }
  });
}

function handleDemoMode(question) {
  // デモモード：即座に骨子を生成して表示
  const result = JSON.parse(DEMO_RESPONSES.rqOverview);
  state.set('seed.refinedResult', result);

  const geminiUIContainer = document.querySelector('#geminiChatUI');
  if (geminiUIContainer) {
    geminiUIContainer.innerHTML = `
      <div class="card" style="background: #f0fdf4; border: 1px solid #86efac; text-align: center; padding: var(--space-4);">
        <p style="color: #166534; font-weight: 600; margin: 0;">✅ デモモード：研究の骨子を自動生成しました。下の内容を確認してください。</p>
      </div>
    `;
  }

  const area = document.querySelector('#refinedResultArea');
  if (area) {
    area.classList.remove('hidden');
    area.innerHTML = renderRefinedResult(result);
    attachRefinedResultListeners(area, result);
  }
  // 右サイドバーに反映
  updateSummary('Theme', (result.theme || result.rq || '').substring(0, 60));
  updateSummary('RQ', result.rq || '');
}

function tryParseJSON(text) {
  try {
    let cleaned = text.replace(/```json\s*\n?/g, '').replace(/```\s*\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.rq || parsed.theme || parsed.type) return parsed;
    }
  } catch (_) { /* skip */ }
  return null;
}

function parseTextSkeleton(text) {
  const result = {
    type: 'research',
    theme: '',
    rq: '',
    target: '',
    goal: '',
    approaches: [],
  };

  // リサーチクエスチョン（RQ）を探す
  const rqMatch = text.match(/リサーチクエスチョン[（(]?RQ[)）]?\s*[:：]\s*(.+?)(?:\n|$)/i) ||
    text.match(/RQ\s*[:：]\s*(.+?)(?:\n|$)/i);
  if (rqMatch) result.rq = rqMatch[1].trim();

  // 研究デザインを探す
  const designMatch = text.match(/研究デザイン\s*[:：]\s*(.+?)(?:\n|$)/);
  if (designMatch) result.theme = designMatch[1].trim();

  // 対象を探す
  const targetMatch = text.match(/対象\s*[:：]\s*(.+?)(?:\n|$)/);
  if (targetMatch) result.target = targetMatch[1].trim();

  // 最終ゴールを探す
  const goalMatch = text.match(/最終ゴール\s*[:：]\s*(.+?)(?:\n|$)/);
  if (goalMatch) result.goal = goalMatch[1].trim();

  // テーマがない場合はRQから生成
  if (!result.theme && result.rq) {
    result.theme = result.rq.replace(/[？?]$/, '').substring(0, 60);
  }

  // 量的フェーズ・質的フェーズなどをアプローチとして抽出
  const phaseMatches = text.matchAll(/(?:量的|質的|STEP\s*\d+|フェーズ)[^:：]*[:：]\s*([\s\S]*?)(?=(?:量的|質的|STEP\s*\d+|フェーズ|最終ゴール|---|\n\n|$))/gi);
  for (const match of phaseMatches) {
    const content = match[0].trim();
    const nameMatch = content.match(/^(.+?)[:：]/);
    if (nameMatch) {
      result.approaches.push({
        name: nameMatch[1].trim(),
        description: content.substring(nameMatch[0].length).trim().replace(/\n/g, ' ').substring(0, 200),
      });
    }
  }

  // 最低限RQがあればパース成功
  if (result.rq) return result;

  // RQが見つからなくてもテキストに意味のある内容があれば採用
  if (text.trim().length > 30) {
    result.rq = text.trim().split('\n')[0].substring(0, 200);
    result.goal = text.trim();
    return result;
  }

  return null;
}

function renderRefinedResult(result) {
  const isConfirmed = state.get('seed.rqConfirmed');
  const typeLabels = {
    research: { title: 'リサーチクエスチョン', badge: '学術研究' },
    practice: { title: '実践報告の焦点', badge: '実践報告' },
    qi: { title: 'QIプロジェクト目標', badge: '質改善' },
  };
  const labels = typeLabels[result.type] || typeLabels.research;

  return `
    <div class="ai-response expert-view" style="margin-top: var(--space-6);">
      <div class="ai-response-header">
        <span class="badge recommended">${labels.badge}として整理完了</span>
        整理された研究の骨子
      </div>
      <div class="ai-response-body">
        <p class="text-muted" style="margin-bottom: var(--space-4); font-size: 0.9rem;">
          取り込まれた内容を確認してください。RQは必要に応じて編集できます。内容がよければ「このRQで確定する」ボタンを押して次へ進んでください。
        </p>
        <div class="format-block">
          <div class="format-row" style="flex-direction: column; align-items: stretch; gap: var(--space-2); margin-bottom: var(--space-4);">
            <span class="format-label">${labels.title}:</span>
            <textarea id="refinedRqInput" class="textarea input-rq" style="min-height: 80px; width: 100%; box-sizing: border-box; overflow: hidden; resize: none; font-size: 0.95rem; line-height: 1.6;" ${isConfirmed ? 'readonly' : ''}>${result.rq || result.title || ''}</textarea>
          </div>
          <div class="format-row" style="margin-bottom: var(--space-4);">
            <span class="format-label">テーマ:</span>
            <span class="format-value"><strong>${result.theme || result.title || '未設定'}</strong></span>
          </div>
          <div class="format-row mt-4">
            <span class="format-label">対象:</span>
            <span class="format-value">${result.target || '未設定'}</span>
          </div>
          <div class="format-row">
            <span class="format-label">ゴール:</span>
            <span class="format-value">${result.goal || '未設定'}</span>
          </div>
          ${result.approaches && result.approaches.length > 0 ? `
          <div style="margin-top: var(--space-4);">
            <span class="format-label">アプローチ:</span>
            <ul style="margin-top: var(--space-2); padding-left: var(--space-5);">
              ${result.approaches.map(a => `<li><strong>${a.name}</strong>: ${a.description}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
        </div>
        
        <div style="margin-top: var(--space-5); text-align: center;">
          <button class="btn ${isConfirmed ? 'btn-secondary' : 'btn-primary'}" id="btnConfirmRq" ${isConfirmed ? 'disabled' : ''}>
            ${isConfirmed ? '✓ 確定済み — 次のステップへ進めます' : '✨ このRQで確定する'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function updateSummary(key, value) {
  const el = document.querySelector(`#sum${key}`);
  if (el) {
    el.textContent = value;
    el.classList.add('active');
  }
}

export function validateStep1() {
  return !!state.get('seed.refinedResult') && !!state.get('seed.rqConfirmed');
}

function attachRefinedResultListeners(area, result) {
  const btnConfirm = area.querySelector('#btnConfirmRq');
  const rqInput = area.querySelector('#refinedRqInput');
  if (!btnConfirm || !rqInput) return;

  const autoResize = () => {
    rqInput.style.height = 'auto';
    rqInput.style.height = Math.max(80, rqInput.scrollHeight + 2) + 'px';
  };

  requestAnimationFrame(autoResize);
  setTimeout(autoResize, 100);

  rqInput.addEventListener('input', autoResize);

  btnConfirm.addEventListener('click', () => {
    if (!rqInput.value.trim()) return;

    result.rq = rqInput.value.trim();
    state.set('seed.refinedResult', result);
    state.set('seed.rqConfirmed', true);

    updateSummary('Theme', (result.theme || result.title || result.rq).substring(0, 60));
    updateSummary('RQ', result.rq);

    area.innerHTML = renderRefinedResult(result);
    attachRefinedResultListeners(area, result);
  });
}
