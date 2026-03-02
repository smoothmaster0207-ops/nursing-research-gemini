/**
 * step1-seed.js — 種と整理 (Initial Seed + Chat) — Gemini連携版
 */

import { state } from '../state.js';
import { PROMPTS, DEMO_RESPONSES } from '../prompts/index.js';
import { renderGeminiUI, attachGeminiListeners, isDemoMode } from '../gemini-helper.js';

export function renderStep1(container) {
  const seed = state.get('seed');
  const chatHistory = seed.chatHistory || [];
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
          🤖 アドバイザーと対話を始める
        </button>
      </div>

      <div id="chatArea" class="${chatHistory.length > 0 ? '' : 'hidden'}">
        <div class="card expert-chat-card">
          <h3 class="section-title">🗣 壁打ち（Brainstorming）</h3>
          
          <div id="geminiChatUI"></div>

          <div class="chat-container" id="chatContainer">
            ${chatHistory.map(msg => renderChatMessage(msg)).join('')}
          </div>

          <div class="chat-input-area" id="chatInputArea">
            <textarea class="textarea" id="chatInput" placeholder="回答を入力してください..." rows="3"></textarea>
            <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
              <button class="btn btn-primary" id="btnSend">送信</button>
            </div>
          </div>
        </div>

        <div id="refinedResultArea" class="${refinedResult ? '' : 'hidden'}">
          ${refinedResult ? renderRefinedResult(refinedResult) : ''}
        </div>
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
  const chatArea = container.querySelector('#chatArea');
  const input = container.querySelector('#chatInput');
  const btnSend = container.querySelector('#btnSend');

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

  btnStartChat.addEventListener('click', async () => {
    chatArea.classList.remove('hidden');
    if ((state.get('seed.chatHistory') || []).length === 0) {
      await startChat(textarea.value);
    }
    textarea.closest('.card').scrollIntoView({ behavior: 'smooth' });
  });

  const handleSend = () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    handleUserMessage(text);
  };

  btnSend.addEventListener('click', handleSend);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.stopPropagation();
    }
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 150) + 'px';
  });

  if (refinedResult) {
    const area = container.querySelector('#refinedResultArea');
    attachRefinedResultListeners(area, refinedResult);
  }
}

function renderChatMessage(msg) {
  return `
    <div class="chat-message ${msg.role}">
      <div class="chat-avatar">${msg.role === 'ai' ? '🤖' : '👤'}</div>
      <div class="chat-bubble">${msg.content.replace(/\n/g, '<br>')}</div>
    </div>
  `;
}

async function startChat(question) {
  if (isDemoMode()) {
    const initialMsg = {
      role: 'ai',
      content: `素敵な研究の種ですね！「${question}」は、看護実践の質に直結する大切なテーマだと思います。\n\nもう少し研究を具体化していくために、いくつか教えていただけますか？すべてに答える必要はありません。書きやすいものだけで大丈夫です。\n\n- **研究対象**: どのような患者さん・場面を想定していますか？\n- **研究目的**: 最終的に何を明らかにしたい、もしくは改善したいですか？\n- **背景**: すでに分かっていること、まだ明らかでないことは？\n- **今の悩み**: テーマが広すぎる、方法が分からない、など困っていることは？\n\nお気軽にお聞かせください。一緒に整理していきましょう！`,
    };
    addMessage(initialMsg);
  } else {
    // Gemini連携: プロンプトを生成してUI表示
    showGeminiChatUI(question);
  }
}

function showGeminiChatUI(question) {
  const history = state.get('seed.chatHistory') || [];

  let prompt;
  if (history.length === 0) {
    // 初回: システムプロンプト + ユーザーの研究の種
    prompt = `${PROMPTS.rqAssistant}\n\n---\n\n【ユーザーからの研究の種】\n${question}`;
  } else {
    // 会話の続き: これまでのやり取り + 新しいメッセージ
    const conversationHistory = history.map(m =>
      `${m.role === 'ai' ? 'アシスタント' : 'ユーザー'}: ${m.content}`
    ).join('\n\n');
    prompt = `${PROMPTS.rqAssistant}\n\n---\n\n【これまでの対話】\n${conversationHistory}\n\n---\n\n上記の対話に続けて、アシスタントとして次の返答をしてください。`;
  }

  const geminiUIContainer = document.querySelector('#geminiChatUI');
  if (geminiUIContainer) {
    geminiUIContainer.innerHTML = renderGeminiUI({
      prompt: prompt,
      containerId: 'geminiChat',
      label: 'ブレインストーミング',
      expectJson: false,
      placeholder: 'Geminiからの回答をここに貼り付けてください...',
    });

    attachGeminiListeners(geminiUIContainer, prompt, (response) => {
      if (response) {
        addMessage({ role: 'ai', content: response });
        // UI をクリアして次のやり取りに備える
        geminiUIContainer.innerHTML = '';

        // 十分な対話が行われたら骨子生成を促す
        const chatHistory = state.get('seed.chatHistory') || [];
        if (chatHistory.length >= 6 && !state.get('seed.refinedResult')) {
          showRefineUI();
        }
      }
    });
  }
}

function handleUserMessage(text) {
  addMessage({ role: 'user', content: text });

  if (isDemoMode()) {
    handleDemoMessage(text);
  } else {
    // Gemini連携: 新しいプロンプトを生成して表示
    showGeminiChatUI(state.get('seed.question'));
  }
}

async function handleDemoMessage(text) {
  const chatHistory = state.get('seed.chatHistory') || [];
  const userMsgCount = chatHistory.filter(m => m.role === 'user').length;

  await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

  let response;
  if (userMsgCount <= 1) {
    response = `ありがとうございます！とても具体的なイメージが湧いてきました。\n\n65歳以上の急性期病棟の患者さんを対象に、多職種連携の退院支援の効果を検証するという方向ですね。\n\nもう少し教えてください：\n- **介入の具体的な内容**: 現在の退院支援と比べて、どんな「新しい取り組み」を導入したいですか？（例：退院支援カンファレンスの標準化、退院後フォローアップの仕組みなど）\n- **アウトカム指標**: 「再入院が減った」かどうかを、どんな指標で測りたいですか？（例：30日以内再入院率、患者満足度、在宅療養日数など）`;
  } else if (userMsgCount <= 2) {
    response = `なるほど、かなり研究の輪郭が見えてきましたね！\n\n整理すると：\n- **P（対象）**: 65歳以上の急性期病棟入院患者\n- **I（介入）**: 標準化された多職種連携退院支援プログラム\n- **C（比較）**: 従来の退院支援\n- **O（結果）**: 30日以内再入院率の低下\n\nこれは非常に実現可能性が高く、臨床的意義も大きいテーマですね。もう1点だけ確認させてください：\n- **研究環境**: データ収集が可能な施設や協力体制はありますか？また、倫理審査の見通しはいかがでしょうか？`;
  } else {
    response = `素晴らしい情報をありがとうございます。研究の骨子がまとまりました！\n\nこの内容で「整理された研究の骨子」をお出ししますので、次のステップで具体的な研究デザインを検討していきましょう。`;
  }

  addMessage({ role: 'ai', content: response });

  if (chatHistory.length >= 6 && !state.get('seed.refinedResult')) {
    setTimeout(() => generateRefinedResult(), 500);
  }
}

function showRefineUI() {
  const geminiUIContainer = document.querySelector('#geminiChatUI');
  if (!geminiUIContainer) return;

  const history = (state.get('seed.chatHistory') || []).map(m => m.content).join('\n');

  const prompt = `これまでの対話に基づき、研究の骨子を整理してJSON出力してください。
以下の3つのうち最適なカテゴリーを選択し、その形式で出力してください。

【出力形式（JSONのみ）】
{
  "type": "research" | "practice" | "qi",
  "theme": "研究テーマ（名詞句として体言止め。「〜に関する研究」など）",
  "rq": "整理されたリサーチクエスチョン（必ず「〜は〜にどのような影響を与えるか？」などの疑問形で出力すること。実践報告やQIの場合はその目標を疑問形で構文すること）",
  "target": "対象者（母集団）",
  "goal": "目的・核心的な到達点",
  "approaches": [
    { "name": "アプローチ名", "description": "具体的な方法や工夫の概要" }
  ]
}

---

【これまでの対話】
${history}`;

  geminiUIContainer.innerHTML = `
    <div class="card" style="background: linear-gradient(135deg, #fef3c7, #fef9c3); border: 1px solid #fbbf24; margin: var(--space-4) 0;">
      <p style="margin: 0 0 var(--space-3); font-weight: 600;">💡 対話が十分に進みました。研究の骨子を生成しましょう。</p>
      ${renderGeminiUI({
    prompt: prompt,
    containerId: 'geminiRefine',
    label: '研究の骨子を整理',
    expectJson: true,
    placeholder: 'GeminiからのJSON回答をここに貼り付けてください...',
  })}
    </div>
  `;

  attachGeminiListeners(geminiUIContainer, prompt, (parsed, raw) => {
    if (parsed) {
      state.set('seed.refinedResult', parsed);
      const area = document.querySelector('#refinedResultArea');
      if (area) {
        area.classList.remove('hidden');
        area.innerHTML = renderRefinedResult(parsed);
        attachRefinedResultListeners(area, parsed);
      }
      geminiUIContainer.innerHTML = '';
    } else {
      alert('JSON形式の回答を貼り付けてください。Geminiの回答から { から始まる部分をコピーしてください。');
    }
  }, true);
}

function addMessage(msg) {
  const history = state.get('seed.chatHistory') || [];
  history.push(msg);
  state.set('seed.chatHistory', history);

  const chatContainer = document.querySelector('#chatContainer');
  if (chatContainer) {
    chatContainer.insertAdjacentHTML('beforeend', renderChatMessage(msg));
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

async function generateRefinedResult() {
  if (isDemoMode()) {
    await new Promise(r => setTimeout(r, 800));
    const result = JSON.parse(DEMO_RESPONSES.rqOverview);
    state.set('seed.refinedResult', result);
    const area = document.querySelector('#refinedResultArea');
    if (area) {
      area.classList.remove('hidden');
      area.innerHTML = renderRefinedResult(result);
      attachRefinedResultListeners(area, result);
    }
  } else {
    showRefineUI();
  }
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
          AIが提案したリサーチクエスチョン（RQ）を必要に応じて編集し、納得できる内容になったら「このRQで確定する」ボタンを押してください。
        </p>
        <div class="format-block">
          <div class="format-row" style="margin-bottom: var(--space-4);">
            <span class="format-label">テーマ:</span>
            <span class="format-value"><strong>${result.theme || result.title || '未設定'}</strong></span>
          </div>
          <div class="format-row" style="flex-direction: column; align-items: stretch; gap: var(--space-2);">
            <span class="format-label">${labels.title}:</span>
            <textarea id="refinedRqInput" class="textarea input-rq" style="min-height: 80px; width: 100%; box-sizing: border-box; overflow: hidden; resize: none; font-size: 0.95rem; line-height: 1.6;" ${isConfirmed ? 'readonly' : ''}>${result.rq || result.title || ''}</textarea>
          </div>
          <div class="format-row mt-4">
            <span class="format-label">対象:</span>
            <span class="format-value">${result.target}</span>
          </div>
          <div class="format-row">
            <span class="format-label">ゴール:</span>
            <span class="format-value">${result.goal}</span>
          </div>
        </div>
        
        <div style="margin-top: var(--space-5); text-align: center;">
          <button class="btn ${isConfirmed ? 'btn-secondary' : 'btn-primary'}" id="btnConfirmRq" ${isConfirmed ? 'disabled' : ''}>
            ${isConfirmed ? '✓ 確定済み' : '✨ このRQで確定する'}
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
