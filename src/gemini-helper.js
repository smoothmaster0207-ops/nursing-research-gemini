/**
 * gemini-helper.js — Geminiウェブページ連携ヘルパー
 * APIキーを使わず、Geminiのウェブインターフェースと連携する
 */

import { state } from './state.js';
import { DEMO_RESPONSES } from './prompts/index.js';

const GEMINI_URL = 'https://gemini.google.com/app';

/**
 * プロンプトをクリップボードにコピー
 */
export async function copyPromptToClipboard(prompt) {
    try {
        await navigator.clipboard.writeText(prompt);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = prompt;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        } catch {
            document.body.removeChild(textarea);
            return false;
        }
    }
}

/**
 * Geminiを別タブで開く
 */
export function openGemini() {
    window.open(GEMINI_URL, '_blank', 'noopener,noreferrer');
}

/**
 * Gemini連携UIを生成する
 * @param {Object} options
 * @param {string} options.prompt - Geminiに送るプロンプト
 * @param {string} options.containerId - UI埋め込み先のコンテナID
 * @param {string} options.label - セクションラベル（例: "研究デザイン提案"）
 * @param {boolean} options.expectJson - JSON形式の回答を期待するか
 * @param {function} options.onResponse - 回答を受け取った時のコールバック
 * @param {string} options.placeholder - テキストエリアのプレースホルダー
 */
export function renderGeminiUI(options) {
    const {
        prompt,
        containerId,
        label = 'AI回答',
        expectJson = false,
        placeholder = 'Geminiからの回答をここに貼り付けてください...',
    } = options;

    return `
    <div class="gemini-ui card" id="${containerId}" style="margin-top: var(--space-5);">
      <div class="gemini-ui-header" style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
        <span style="font-size: 1.5rem;">✨</span>
        <h3 style="margin: 0; font-size: 1.1rem;">${label} — Gemini連携</h3>
      </div>

      <div class="gemini-steps" style="margin-bottom: var(--space-4);">
        <div class="gemini-step" style="display: flex; gap: var(--space-3); align-items: flex-start; margin-bottom: var(--space-4); padding: var(--space-4); background: var(--color-bg-secondary, #f8f9fa); border-radius: var(--radius-md);">
          <div style="min-width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary, #4f46e5); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem;">1</div>
          <div style="flex: 1;">
            <p style="font-weight: 600; margin-bottom: var(--space-2);">プロンプトをコピー</p>
            <div class="gemini-prompt-preview" style="background: var(--color-bg, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius-sm); padding: var(--space-3); margin-bottom: var(--space-3); max-height: 150px; overflow-y: auto; font-size: var(--font-size-sm); white-space: pre-wrap; color: var(--color-text-secondary, #64748b);">${escapeHtml(prompt.substring(0, 500))}${prompt.length > 500 ? '\n...(続き)' : ''}</div>
            <button class="btn btn-primary btn-sm gemini-copy-btn" data-prompt-target="${containerId}" style="gap: var(--space-2);">
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
            <textarea class="textarea gemini-response-input" id="${containerId}-response" placeholder="${placeholder}" rows="6" style="width: 100%; box-sizing: border-box;"></textarea>
            <button class="btn btn-primary btn-sm gemini-submit-btn" data-container="${containerId}" style="margin-top: var(--space-3); gap: var(--space-2);" disabled>
              ✅ 回答を取り込む
            </button>
          </div>
        </div>
      </div>
    </div>
    `;
}

/**
 * Gemini UIのイベントリスナーをアタッチ
 */
export function attachGeminiListeners(container, prompt, onResponse, expectJson = false) {
    const copyBtn = container.querySelector('.gemini-copy-btn');
    const openBtn = container.querySelector('.gemini-open-btn');
    const responseInput = container.querySelector('.gemini-response-input');
    const submitBtn = container.querySelector('.gemini-submit-btn');
    const feedback = container.querySelector('.gemini-copy-feedback');

    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            const success = await copyPromptToClipboard(prompt);
            if (feedback) {
                feedback.textContent = success ? '✅ コピーしました！' : '❌ コピーに失敗しました';
                feedback.style.opacity = '1';
                setTimeout(() => { feedback.style.opacity = '0'; }, 2500);
            }
        });
    }

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            openGemini();
        });
    }

    if (responseInput && submitBtn) {
        responseInput.addEventListener('input', () => {
            submitBtn.disabled = !responseInput.value.trim();
        });

        submitBtn.addEventListener('click', () => {
            const rawResponse = responseInput.value.trim();
            if (!rawResponse) return;

            if (expectJson) {
                try {
                    // JSON解析を試みる
                    const cleaned = rawResponse
                        .replace(/```json\n?/g, '')
                        .replace(/```\n?/g, '')
                        .trim();
                    const parsed = JSON.parse(cleaned);
                    onResponse(parsed, rawResponse);
                } catch (err) {
                    // JSONパースに失敗した場合はテキストとして渡す
                    onResponse(null, rawResponse);
                }
            } else {
                onResponse(rawResponse, rawResponse);
            }
        });
    }
}

/**
 * デモモード判定
 */
export function isDemoMode() {
    return state.get('demoMode');
}

/**
 * デモレスポンスを返す
 */
export async function getDemoResponse(module) {
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    return DEMO_RESPONSES[module] || DEMO_RESPONSES.default;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
