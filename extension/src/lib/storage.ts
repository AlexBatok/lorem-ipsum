import type { GenerateOptions } from './lorem';

export interface Preset {
  label: string;
  unit: GenerateOptions['unit'];
  count: number;
  startWithLorem: boolean;
  htmlWrap: boolean;
  htmlTag: string;
}

export interface Settings {
  unit: GenerateOptions['unit'];
  count: number;
  startWithLorem: boolean;
  htmlWrap: boolean;
  htmlTag: string;
  theme: 'auto' | 'light' | 'dark';
  autoCopy: boolean;
  presets: Preset[];
}

export const DEFAULTS: Settings = {
  unit: 'paragraphs',
  count: 3,
  startWithLorem: true,
  htmlWrap: false,
  htmlTag: 'p',
  theme: 'auto',
  autoCopy: false,
  presets: [
    { label: '1¶', unit: 'paragraphs', count: 1, startWithLorem: true, htmlWrap: false, htmlTag: 'p' },
    { label: '3¶', unit: 'paragraphs', count: 3, startWithLorem: true, htmlWrap: false, htmlTag: 'p' },
    { label: '50w', unit: 'words', count: 50, startWithLorem: true, htmlWrap: false, htmlTag: 'p' },
  ],
};

export async function loadSettings(): Promise<Settings> {
  const data = await chrome.storage.sync.get(DEFAULTS);
  return data as Settings;
}

export async function saveSettings(partial: Partial<Settings>): Promise<void> {
  await chrome.storage.sync.set(partial);
}

export async function resetSettings(): Promise<void> {
  await chrome.storage.sync.clear();
  await chrome.storage.sync.set(DEFAULTS);
}
