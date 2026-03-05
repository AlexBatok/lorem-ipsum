import { generate, type GenerateOptions } from './lib/lorem';
import { DEFAULTS, loadSettings } from './lib/storage';

// --- Context Menu ---
const MENU_ITEMS = [
  { id: 'p-1', label: '1 Paragraph', unit: 'paragraphs', count: 1 },
  { id: 'p-2', label: '2 Paragraphs', unit: 'paragraphs', count: 2 },
  { id: 'p-3', label: '3 Paragraphs', unit: 'paragraphs', count: 3 },
  { id: 'p-5', label: '5 Paragraphs', unit: 'paragraphs', count: 5 },
  { id: 'sep', label: '', unit: '', count: 0 },
  { id: 'w-10', label: '10 Words', unit: 'words', count: 10 },
  { id: 'w-50', label: '50 Words', unit: 'words', count: 50 },
  { id: 'w-100', label: '100 Words', unit: 'words', count: 100 },
  { id: 'w-500', label: '500 Words', unit: 'words', count: 500 },
] as const;

function createContextMenus(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'lorem-parent',
      title: 'Smart Lipsum',
      contexts: ['editable'],
    });
    for (const item of MENU_ITEMS) {
      if (item.id === 'sep') {
        chrome.contextMenus.create({
          id: 'lorem-sep', type: 'separator',
          parentId: 'lorem-parent', contexts: ['editable'],
        });
      } else {
        chrome.contextMenus.create({
          id: `lorem-${item.id}`, title: item.label,
          parentId: 'lorem-parent', contexts: ['editable'],
        });
      }
    }
  });
}

// --- Badge ---
function flashBadge(text: string, color: string, ms = 2000): void {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), ms);
}

/** Injected into the page to insert text at cursor. */
function insertText(text: string): void {
  const el = document.activeElement;
  if (!el) return;
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    el.setRangeText(text, start, end, 'end');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  if (el instanceof HTMLElement && el.isContentEditable) {
    document.execCommand('insertText', false, text);
  }
}

/** Copy text to clipboard via an offscreen-style injection. */
async function copyViaTab(text: string, tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (t: string) => navigator.clipboard.writeText(t),
    args: [text],
  });
}

// --- Generate and insert ---
async function generateAndInsert(
  unit: GenerateOptions['unit'],
  count: number,
  tabId?: number,
): Promise<void> {
  const data = await loadSettings();
  const text = generate({
    unit, count,
    startWithLorem: data.startWithLorem,
    htmlWrap: false,
    htmlTag: 'p',
  });

  if (tabId != null) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: insertText,
        args: [text],
      });
      flashBadge('✓', '#34c759');
      return;
    } catch {
      // Can't inject — try clipboard fallback
      try {
        await copyViaTab(text, tabId);
        flashBadge('✓', '#34c759');
        return;
      } catch {
        // Tab not scriptable at all
      }
    }
  }
  flashBadge('!', '#ff3b30', 3000);
}

// --- Event listeners ---
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(null, (data) => {
    if (!data.unit) chrome.storage.sync.set(DEFAULTS);
  });
  createContextMenus();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const menuId = info.menuItemId as string;
  if (!menuId.startsWith('lorem-')) return;
  const itemId = menuId.replace('lorem-', '');
  const item = MENU_ITEMS.find((m) => m.id === itemId);
  if (!item || item.id === 'sep') return;
  generateAndInsert(item.unit as GenerateOptions['unit'], item.count, tab?.id);
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'generate-lorem') return;
  const data = await loadSettings();
  const text = generate({
    unit: data.unit, count: data.count,
    startWithLorem: data.startWithLorem,
    htmlWrap: data.htmlWrap, htmlTag: data.htmlTag,
  });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id != null) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: insertText,
        args: [text],
      });
      flashBadge('✓', '#34c759');
      return;
    } catch {
      try {
        await copyViaTab(text, tab.id);
        flashBadge('✓', '#34c759');
        return;
      } catch {
        // Not scriptable
      }
    }
  }
  flashBadge('!', '#ff3b30', 3000);
});
