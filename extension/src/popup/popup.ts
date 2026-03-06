import { generate, countWords, type GenerateOptions } from '../lib/lorem';
import { loadSettings, saveSettings, DEFAULTS, type Preset } from '../lib/storage';
import { initSettings } from './settings';

const $ = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;

// --- DOM refs ---
const tabs = document.querySelectorAll<HTMLButtonElement>('.tab');
const countInput = $<HTMLInputElement>('count-input');
const chkLorem = $<HTMLInputElement>('chk-lorem');
const chkHtml = $<HTMLInputElement>('chk-html');
const htmlTagRow = $('html-tag-row');
const selectTag = $<HTMLSelectElement>('select-tag');
const preview = $<HTMLTextAreaElement>('preview');
const btnCopy = $('btn-copy');
const statusMsg = $('status-msg');
const wordCount = $('word-count');

// --- State ---
export let currentUnit: GenerateOptions['unit'] = 'paragraphs';
let autoCopy = false;
export function setAutoCopy(val: boolean): void { autoCopy = val; }

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let copyTimeout: ReturnType<typeof setTimeout> | null = null;

const LIMITS: Record<string, { min: number; max: number }> = {
  paragraphs: { min: 1, max: 99 },
  sentences: { min: 1, max: 99 },
  words: { min: 1, max: 9999 },
};

// --- Persistence (debounced) ---
function scheduleSave(): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveSettings({
      unit: currentUnit,
      count: parseInt(countInput.value, 10) || 1,
      startWithLorem: chkLorem.checked,
      htmlWrap: chkHtml.checked,
      htmlTag: selectTag.value,
    });
  }, 300);
}

// --- Generation ---
export function getOptions(): GenerateOptions {
  return {
    unit: currentUnit,
    count: parseInt(countInput.value, 10) || 1,
    startWithLorem: chkLorem.checked,
    htmlWrap: chkHtml.checked,
    htmlTag: selectTag.value,
  };
}

export function regenerate(): void {
  const options = getOptions();
  const text = generate(options);
  preview.value = text;

  const wc = countWords(text);
  wordCount.textContent = `${wc}w`;
  if (options.htmlWrap) wordCount.textContent += ` · ${text.length}ch`;

  scheduleSave();
  if (autoCopy) copyToClipboard();
}

// --- Tabs ---
export function setActiveTab(unit: GenerateOptions['unit']): void {
  currentUnit = unit;
  tabs.forEach((tab) => {
    const isActive = tab.dataset.unit === unit;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
  const limit = LIMITS[unit];
  let val = parseInt(countInput.value, 10) || limit.min;
  countInput.value = String(Math.max(limit.min, Math.min(limit.max, val)));
  countInput.max = String(limit.max);
  regenerate();
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const unit = tab.dataset.unit as GenerateOptions['unit'];
    if (unit) setActiveTab(unit);
  });
});

// --- Count controls ---
function clampCount(): void {
  const limit = LIMITS[currentUnit];
  let val = parseInt(countInput.value, 10);
  if (isNaN(val)) val = limit.min;
  countInput.value = String(Math.max(limit.min, Math.min(limit.max, val)));
}

$('btn-dec').addEventListener('click', () => {
  countInput.value = String(Math.max(LIMITS[currentUnit].min, (parseInt(countInput.value, 10) || 1) - 1));
  regenerate();
});
$('btn-inc').addEventListener('click', () => {
  countInput.value = String(Math.min(LIMITS[currentUnit].max, (parseInt(countInput.value, 10) || 1) + 1));
  regenerate();
});
countInput.addEventListener('input', () => { clampCount(); regenerate(); });
countInput.addEventListener('blur', () => { clampCount(); regenerate(); });

// --- Checkboxes ---
chkLorem.addEventListener('change', regenerate);
chkHtml.addEventListener('change', () => {
  htmlTagRow.classList.toggle('hidden', !chkHtml.checked);
  regenerate();
});
selectTag.addEventListener('change', regenerate);

// --- Copy to clipboard ---
async function copyToClipboard(): Promise<void> {
  const text = preview.value;
  if (!text) return;
  try { await navigator.clipboard.writeText(text); }
  catch { preview.select(); document.execCommand('copy'); }
  showCopied();
}

function showCopied(): void {
  btnCopy.classList.add('copied');
  const t = btnCopy.querySelector('.btn-copy-text');
  if (t) t.textContent = '✓ Copied!';
  statusMsg.textContent = 'Copied! ✓';
  statusMsg.classList.add('visible');
  if (copyTimeout) clearTimeout(copyTimeout);
  copyTimeout = setTimeout(() => {
    btnCopy.classList.remove('copied');
    if (t) t.textContent = 'Copy to Clipboard';
    statusMsg.classList.remove('visible');
  }, 2000);
}

btnCopy.addEventListener('click', copyToClipboard);

// --- Footer links ---
$('link-rate').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'https://chromewebstore.google.com/detail/mhbdpolifdmedilbifmekdiafpfdmckc/reviews' });
});
$('link-coffee').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'https://alexbatok.github.io/lorem-ipsum/#donate' });
});

// --- Init ---
async function init(): Promise<void> {
  const s = await loadSettings();
  initSettings(s);
  chkLorem.checked = s.startWithLorem;
  chkHtml.checked = s.htmlWrap;
  htmlTagRow.classList.toggle('hidden', !s.htmlWrap);
  selectTag.value = s.htmlTag;
  countInput.value = String(s.count);
  setActiveTab(s.unit);
}

init().catch((err) => console.error('[Smart Lipsum] Init failed:', err));
