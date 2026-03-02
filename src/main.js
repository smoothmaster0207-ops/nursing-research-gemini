/**
 * main.js — Application entry point (Gemini連携版)
 * Manages tab navigation, step rendering, progress bar, settings modal, and summary panel.
 */

import { state } from './state.js';
import { renderStep1, validateStep1 } from './steps/step1-seed.js';
import { renderStep2, validateStep2 } from './steps/step2-rq.js';
import { renderStep3, validateStep3 } from './steps/step3-guideline.js';
import { renderStep4, validateStep4 } from './steps/step4-review.js';
import { renderStep5, validateStep5 } from './steps/step5-data.js';
import { renderStep6, validateStep6 } from './steps/step6-analysis.js';
import { renderStep7, validateStep7 } from './steps/step7-proposal.js';

// Step definitions
const STEPS = [
    { id: 1, render: renderStep1, validate: validateStep1 },
    { id: 2, render: renderStep2, validate: validateStep2 },
    { id: 3, render: renderStep3, validate: validateStep3 },
    { id: 4, render: renderStep4, validate: validateStep4 },
    { id: 5, render: renderStep5, validate: validateStep5 },
    { id: 6, render: renderStep6, validate: validateStep6 },
    { id: 7, render: renderStep7, validate: validateStep7 },
];

// DOM Elements
const stepContent = document.getElementById('stepContent');
const progressFill = document.getElementById('progressFill');
const stepTabs = document.querySelectorAll('.step-tab');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const stepIndicator = document.getElementById('stepIndicator');
const settingsModal = document.getElementById('settingsModal');

let currentStep = state.get('currentStep') || 1;

// ===========================
//  INITIALIZATION
// ===========================

let _initialized = false;

function init() {
    if (_initialized) return;
    _initialized = true;

    // 保存データがあれば再開ダイアログを表示
    if (state.hasSavedData()) {
        showResumeDialog();
    }

    renderCurrentStep();
    updateNavigation();
    initSettings();
    initTabListeners();
    initNavListeners();
    initSaveLoadButtons();
    restoreSummary();
}

// ===========================
//  STEP RENDERING
// ===========================

function renderCurrentStep() {
    const step = STEPS.find(s => s.id === currentStep);
    if (step) {
        step.render(stepContent);
    }
}

// ステップ依存関係: 各ステップが変更されたら、どの下流ステップの再生成を推奨するか
const STEP_DEPENDENCIES = {
    1: { label: '種と整理', affects: [2, 4, 6, 7], dataKeys: ['seed.refinedResult'] },
    2: { label: 'デザイン案', affects: [3, 4, 6, 7], dataKeys: ['rq.selectedDesign', 'rq.aiResults'] },
    3: { label: 'ガイドライン', affects: [4, 7], dataKeys: ['guideline.selected'] },
    4: { label: '文献レビュー', affects: [7], dataKeys: ['review.aiResult'] },
    5: { label: 'データ収集', affects: [6, 7], dataKeys: ['data.types', 'data.sampleSize'] },
    6: { label: '分析方法', affects: [7], dataKeys: ['analysis.aiResult'] },
};

const STEP_NAMES = {
    1: '種と整理', 2: 'デザイン案', 3: 'ガイドライン', 4: '文献レビュー',
    5: 'データ収集', 6: '分析方法', 7: '計画書草案',
};

function goToStep(stepNum) {
    if (stepNum < 1 || stepNum > 7) return;

    // 後戻り検知: 戻った先のステップより後に既存データがある場合、警告を表示
    if (stepNum < currentStep) {
        const dep = STEP_DEPENDENCIES[stepNum];
        if (dep) {
            const affectedWithData = dep.affects.filter(s => {
                if (s === 2) return !!state.get('rq.aiResults');
                if (s === 3) return !!state.get('guideline.selected');
                if (s === 4) return !!state.get('review.aiResult');
                if (s === 6) return !!state.get('analysis.aiResult');
                if (s === 7) return !!state.get('proposal.draft');
                return false;
            });

            if (affectedWithData.length > 0) {
                showStaleDataWarning(stepNum, affectedWithData);
            }
        }
    }

    currentStep = stepNum;
    state.set('currentStep', currentStep);
    renderCurrentStep();
    updateNavigation();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showStaleDataWarning(changedStep, affectedSteps) {
    const names = affectedSteps.map(s => `Step ${s}（${STEP_NAMES[s]}）`).join('、');
    const existing = document.getElementById('staleDataWarning');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'staleDataWarning';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(135deg,#fff3cd,#ffeeba);border-bottom:2px solid #f0c36d;padding:12px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);';
    banner.innerHTML = `
      <span style="font-size:1.3rem;">🔄</span>
      <div style="flex:1;color:#856404;font-size:0.9rem;">
        <strong>Step ${changedStep}（${STEP_NAMES[changedStep]}）を修正すると、${names} の内容が古くなる可能性があります。</strong><br>
        修正後は該当ステップでAI提案の再生成をお勧めします。
      </div>
      <button onclick="this.parentElement.remove()" style="background:none;border:1px solid #856404;color:#856404;border-radius:4px;padding:4px 12px;cursor:pointer;font-size:0.85rem;">OK</button>
    `;
    document.body.prepend(banner);
    // 10秒後に自動で消す
    setTimeout(() => { if (banner.parentElement) banner.remove(); }, 10000);
}

// ===========================
//  NAVIGATION
// ===========================

function updateNavigation() {
    // Progress bar
    const pct = (currentStep / 7) * 100;
    progressFill.style.width = `${pct}%`;

    // Tab states
    stepTabs.forEach(tab => {
        const stepNum = parseInt(tab.dataset.step);
        tab.classList.toggle('active', stepNum === currentStep);
        tab.classList.toggle('completed', state.get('completedSteps').has(stepNum));
    });

    // Prev/Next buttons
    btnPrev.disabled = currentStep === 1;

    if (currentStep === 7) {
        btnNext.innerHTML = '✅ 完了';
        btnNext.classList.remove('btn-primary');
        btnNext.classList.add('btn-success');
    } else {
        btnNext.innerHTML = `
      確認して次へ
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    `;
        btnNext.classList.remove('btn-success');
        btnNext.classList.add('btn-primary');
    }

    // Step indicator
    stepIndicator.textContent = `Step ${currentStep} / 7`;
}

function initTabListeners() {
    stepTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const stepNum = parseInt(tab.dataset.step);
            goToStep(stepNum);
        });
    });
}

function initNavListeners() {
    btnPrev.addEventListener('click', () => {
        goToStep(currentStep - 1);
    });

    btnNext.addEventListener('click', () => {
        // Mark current step as completed
        const completedSteps = state.get('completedSteps');
        completedSteps.add(currentStep);
        state.set('completedSteps', completedSteps);

        if (currentStep < 7) {
            goToStep(currentStep + 1);
        }
    });
}

// ===========================
//  SETTINGS MODAL
// ===========================

function initSettings() {
    const btnSettings = document.getElementById('btnSettings');
    const btnClose = document.getElementById('btnCloseSettings');
    const btnSave = document.getElementById('btnSaveSettings');
    const demoToggle = document.getElementById('demoModeToggle');

    // Load saved values
    demoToggle.checked = state.get('demoMode');

    btnSettings.addEventListener('click', () => {
        settingsModal.classList.add('visible');
    });

    btnClose.addEventListener('click', () => {
        settingsModal.classList.remove('visible');
    });

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('visible');
        }
    });

    btnSave.addEventListener('click', () => {
        state.saveDemoMode(demoToggle.checked);
        settingsModal.classList.remove('visible');

        // Show saved feedback
        btnSave.textContent = '✅ 保存しました';
        setTimeout(() => { btnSave.textContent = '保存'; }, 1500);
    });
}

// ===========================
//  SUMMARY PANEL RESTORE
// ===========================

function restoreSummary() {
    const seed = state.get('seed');
    const rq = state.get('rq');
    const guideline = state.get('guideline');
    const review = state.get('review');
    const data = state.get('data');
    const analysis = state.get('analysis');

    if (seed.refinedResult?.theme || seed.refinedResult?.title || seed.question) {
        setSum('Theme', ((seed.refinedResult?.theme || seed.refinedResult?.title || seed.question)).substring(0, 60));
    }
    if (seed.refinedResult) {
        setSum('RQ', seed.refinedResult.rq || seed.refinedResult.title);
    }
    if (rq.selectedDesign) {
        setSum('Design', rq.selectedDesign);
    }
    if (guideline.selected) {
        setSum('Guideline', guideline.selected);
    }
    if (review.aiResult) {
        setSum('Literature', '背景構築済み');
    }
    if (data.types?.length > 0) {
        setSum('Data', `${data.types.length}種類のデータ`);
    }
    if (analysis.aiResult?.primaryAnalysis) {
        setSum('Analysis', analysis.aiResult.primaryAnalysis.method);
    }
}

function setSum(key, value) {
    const el = document.querySelector(`#sum${key}`);
    if (el) {
        el.textContent = value;
        el.classList.add('active');
    }
}

// ===========================
//  SAVE / LOAD / RESUME
// ===========================

function showResumeDialog() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay visible';
    overlay.id = 'resumeDialog';
    overlay.innerHTML = `
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
    `;
    document.body.appendChild(overlay);

    document.getElementById('btnResume').addEventListener('click', () => {
        state.loadFullState();
        currentStep = state.get('currentStep') || 1;
        renderCurrentStep();
        updateNavigation();
        restoreSummary();
        overlay.remove();
    });

    document.getElementById('btnNewProject').addEventListener('click', () => {
        state.reset();
    });
}

function initSaveLoadButtons() {
    const btnExport = document.getElementById('btnExport');
    const btnImport = document.getElementById('btnImport');
    const fileInput = document.getElementById('fileImport');

    if (btnExport) {
        btnExport.addEventListener('click', () => {
            state.exportToJSON();
            const origHTML = btnExport.innerHTML;
            btnExport.innerHTML = '✅ 保存しました';
            setTimeout(() => { btnExport.innerHTML = origHTML; }, 2000);
        });
    }

    if (btnImport && fileInput) {
        btnImport.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                await state.importFromJSON(file);
                currentStep = state.get('currentStep') || 1;
                renderCurrentStep();
                updateNavigation();
                restoreSummary();

                const origHTML = btnImport.innerHTML;
                btnImport.innerHTML = '✅ 読み込み完了';
                setTimeout(() => { btnImport.innerHTML = origHTML; }, 2000);
            } catch (err) {
                alert('ファイルの読み込みに失敗しました: ' + err.message);
            }

            fileInput.value = '';
        });
    }
}

// ===========================
//  START
// ===========================

document.addEventListener('DOMContentLoaded', init);
// For Vite HMR
if (document.readyState !== 'loading') {
    init();
}
