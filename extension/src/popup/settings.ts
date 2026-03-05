import { saveSettings, resetSettings, DEFAULTS, type Preset, type Settings } from '../lib/storage';
import * as popup from './popup';

const $ = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;

// --- Theme ---
const VALID_THEMES = ['auto', 'light', 'dark'] as const;

export function applyTheme(theme: string): void {
  const safe = VALID_THEMES.includes(theme as any) ? theme : 'auto';
  document.body.className = '';
  if (safe === 'dark') document.body.classList.add('theme-dark');
  else if (safe === 'auto') document.body.classList.add('theme-auto');
}

// --- Presets ---
let presets: Preset[] = [...DEFAULTS.presets];

function renderPresets(): void {
  const btns = document.querySelectorAll<HTMLButtonElement>('.preset-btn[data-index]');
  btns.forEach((btn, i) => {
    if (presets[i]) btn.textContent = presets[i].label;
  });
}

function initPresets(): void {
  const btns = document.querySelectorAll<HTMLButtonElement>('.preset-btn[data-index]');
  const modal = $('preset-modal');
  const labelInput = $<HTMLInputElement>('preset-label-input');

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = presets[parseInt(btn.dataset.index!, 10)];
      if (!p) return;
      $<HTMLInputElement>('chk-lorem').checked = p.startWithLorem;
      $<HTMLInputElement>('chk-html').checked = p.htmlWrap;
      $('html-tag-row').classList.toggle('hidden', !p.htmlWrap);
      $<HTMLSelectElement>('select-tag').value = p.htmlTag;
      $<HTMLInputElement>('count-input').value = String(p.count);
      popup.setActiveTab(p.unit);
    });
  });

  $('btn-save-preset').addEventListener('click', () => {
    labelInput.value = '';
    // Show current slot labels in picker
    document.querySelectorAll<HTMLSpanElement>('.slot-label[data-slot]').forEach((el) => {
      const i = parseInt(el.dataset.slot!, 10);
      el.textContent = presets[i]?.label || `Slot ${i + 1}`;
    });
    // Default to first slot
    const firstRadio = modal.querySelector<HTMLInputElement>('input[name="slot"][value="0"]');
    if (firstRadio) firstRadio.checked = true;
    modal.classList.remove('hidden');
    labelInput.focus();
  });

  $('btn-modal-cancel').addEventListener('click', () => modal.classList.add('hidden'));

  $('btn-modal-save').addEventListener('click', () => {
    const label = labelInput.value.trim() ||
      `${$<HTMLInputElement>('count-input').value}${popup.currentUnit[0]}`;
    const opts = popup.getOptions();
    const slot = parseInt(
      modal.querySelector<HTMLInputElement>('input[name="slot"]:checked')?.value ?? '0', 10
    );
    presets[slot] = { label, ...opts };
    saveSettings({ presets: [...presets] });
    renderPresets();
    modal.classList.add('hidden');
  });
}

// --- Settings view ---
function initSettingsView(): void {
  const mainView = $('main-view');
  const settingsView = $('settings-view');
  const chkAutocopy = $<HTMLInputElement>('chk-autocopy');

  $('btn-settings').addEventListener('click', () => {
    mainView.classList.add('hidden');
    settingsView.classList.remove('hidden');
  });

  $('btn-back').addEventListener('click', () => {
    settingsView.classList.add('hidden');
    mainView.classList.remove('hidden');
  });

  // Theme radios
  document.querySelectorAll<HTMLInputElement>('input[name="theme"]').forEach((r) => {
    r.addEventListener('change', () => {
      applyTheme(r.value);
      saveSettings({ theme: r.value as Settings['theme'] });
    });
  });

  // Auto-copy
  chkAutocopy.addEventListener('change', () => {
    popup.setAutoCopy(chkAutocopy.checked);
    saveSettings({ autoCopy: chkAutocopy.checked });
  });

  // Shortcuts link
  $('link-shortcuts').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });

  // Reset
  $('btn-reset').addEventListener('click', async () => {
    await resetSettings();
    const s = DEFAULTS;
    applyTheme(s.theme);
    chkAutocopy.checked = s.autoCopy;
    popup.setAutoCopy(s.autoCopy);
    $<HTMLInputElement>('chk-lorem').checked = s.startWithLorem;
    $<HTMLInputElement>('chk-html').checked = s.htmlWrap;
    $('html-tag-row').classList.add('hidden');
    $<HTMLSelectElement>('select-tag').value = s.htmlTag;
    $<HTMLInputElement>('count-input').value = String(s.count);
    presets = [...s.presets];
    renderPresets();
    const themeR = document.querySelector<HTMLInputElement>(
      `input[name="theme"][value="${s.theme}"]`
    );
    if (themeR) themeR.checked = true;
    popup.setActiveTab(s.unit);
    settingsView.classList.add('hidden');
    mainView.classList.remove('hidden');
  });
}

// --- Public init (called from popup.ts) ---
export function initSettings(s: Settings): void {
  applyTheme(s.theme);
  const themeR = document.querySelector<HTMLInputElement>(
    `input[name="theme"][value="${s.theme}"]`
  );
  if (themeR) themeR.checked = true;

  popup.setAutoCopy(s.autoCopy);
  $<HTMLInputElement>('chk-autocopy').checked = s.autoCopy;

  if (s.presets?.length) presets = s.presets;
  renderPresets();
  initPresets();
  initSettingsView();
}
