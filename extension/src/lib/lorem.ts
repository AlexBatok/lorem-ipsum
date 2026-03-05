const LOREM_OPENER = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

const WORDS: string[] = [
  'a', 'ab', 'ac', 'accumsan', 'ad', 'adipiscing', 'aenean', 'aliquam',
  'aliquet', 'amet', 'ante', 'aptent', 'arcu', 'at', 'auctor', 'augue',
  'bibendum', 'blandit', 'commodo', 'condimentum', 'congue', 'consectetur',
  'consequat', 'conubia', 'convallis', 'cras', 'cubilia', 'cum', 'curabitur',
  'curae', 'cursus', 'dapibus', 'diam', 'dictum', 'dictumst', 'dignissim',
  'dis', 'dolor', 'donec', 'dui', 'duis', 'egestas', 'eget', 'eleifend',
  'elementum', 'elit', 'enim', 'erat', 'eros', 'est', 'et', 'etiam', 'eu',
  'euismod', 'facilisi', 'facilisis', 'fames', 'faucibus', 'felis',
  'fermentum', 'feugiat', 'fringilla', 'fusce', 'gravida', 'habitant',
  'habitasse', 'hac', 'hendrerit', 'himenaeos', 'iaculis', 'id', 'imperdiet',
  'in', 'inceptos', 'integer', 'interdum', 'ipsum', 'justo', 'lacinia',
  'lacus', 'laoreet', 'lectus', 'leo', 'libero', 'ligula', 'litora',
  'lobortis', 'lorem', 'luctus', 'maecenas', 'magna', 'magnis', 'malesuada',
  'massa', 'mattis', 'mauris', 'maximus', 'metus', 'mi', 'molestie',
  'mollis', 'montes', 'morbi', 'nam', 'nascetur', 'natoque', 'nec',
  'neque', 'netus', 'nibh', 'nisi', 'nisl', 'non', 'nostra', 'nulla',
  'nullam', 'nunc', 'odio', 'orci', 'ornare', 'parturient', 'pellentesque',
  'penatibus', 'per', 'pharetra', 'phasellus', 'placerat', 'platea',
  'porta', 'porttitor', 'posuere', 'potenti', 'praesent', 'pretium',
  'primis', 'proin', 'pulvinar', 'purus', 'quam', 'quis', 'quisque',
  'rhoncus', 'ridiculus', 'risus', 'rutrum', 'sagittis', 'sapien',
  'scelerisque', 'sed', 'sem', 'semper', 'senectus', 'sit', 'sociis',
  'sociosqu', 'sodales', 'sollicitudin', 'suscipit', 'suspendisse',
  'taciti', 'tellus', 'tempor', 'tempus', 'tincidunt', 'torquent',
  'tortor', 'tristique', 'turpis', 'ullamcorper', 'ultrices', 'ultricies',
  'urna', 'ut', 'varius', 'vehicula', 'vel', 'velit', 'venenatis',
  'vestibulum', 'vitae', 'vivamus', 'viverra', 'volutpat', 'vulputate',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function makeSentence(wordCount: number): string {
  const parts: string[] = [];
  for (let i = 0; i < wordCount; i++) parts.push(pickWord());
  parts[0] = capitalize(parts[0]);
  if (wordCount > 6) {
    parts[randomInt(2, Math.min(5, wordCount - 2))] += ',';
  }
  return parts.join(' ') + '.';
}

export interface GenerateOptions {
  unit: 'paragraphs' | 'sentences' | 'words';
  count: number;
  startWithLorem: boolean;
  htmlWrap: boolean;
  htmlTag: string;
}

export function generateWords(count: number, startWithLorem: boolean): string {
  if (count <= 0) return '';
  const result: string[] = [];
  if (startWithLorem) {
    const openerWords = LOREM_OPENER.replace('.', '').split(' ');
    result.push(...openerWords.slice(0, Math.min(count, openerWords.length)));
  }
  while (result.length < count) result.push(pickWord());
  result[0] = capitalize(result[0]);
  return result.slice(0, count).join(' ') + '.';
}

function makeSentenceList(count: number, startWithLorem: boolean): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(i === 0 && startWithLorem ? LOREM_OPENER : makeSentence(randomInt(8, 15)));
  }
  return out;
}

function makeParagraph(startWithLorem: boolean): string {
  return makeSentenceList(randomInt(4, 8), startWithLorem).join(' ');
}

export function generateSentences(count: number, startWithLorem: boolean): string {
  if (count <= 0) return '';
  return makeSentenceList(count, startWithLorem).join(' ');
}

export function generateParagraphs(count: number, startWithLorem: boolean): string {
  if (count <= 0) return '';
  const paragraphs: string[] = [];
  for (let i = 0; i < count; i++) paragraphs.push(makeParagraph(i === 0 && startWithLorem));
  return paragraphs.join('\n\n');
}

const ALLOWED_TAGS = new Set(['p', 'li', 'h1', 'h2', 'h3']);

export function wrapHtml(blocks: string[], tag: string): string {
  if (!ALLOWED_TAGS.has(tag)) tag = 'p';
  const wrapped = blocks.map((block) => `<${tag}>${block}</${tag}>`);

  if (tag === 'li') {
    return '<ul>\n  ' + wrapped.join('\n  ') + '\n</ul>';
  }

  return wrapped.join('\n');
}

function generateSentenceBlocks(
  count: number,
  startWithLorem: boolean
): string[] {
  const blocks: string[] = [];
  for (let i = 0; i < count; i++) {
    if (i === 0 && startWithLorem) {
      blocks.push(LOREM_OPENER);
    } else {
      blocks.push(makeSentence(randomInt(8, 15)));
    }
  }
  return blocks;
}

export function generate(options: GenerateOptions): string {
  const { unit, count, startWithLorem, htmlWrap, htmlTag } = options;

  if (htmlWrap) {
    let blocks: string[];
    switch (unit) {
      case 'paragraphs': {
        const raw = generateParagraphs(count, startWithLorem);
        blocks = raw.split('\n\n');
        break;
      }
      case 'sentences':
        blocks = generateSentenceBlocks(count, startWithLorem);
        break;
      case 'words':
        blocks = [generateWords(count, startWithLorem)];
        break;
    }
    return wrapHtml(blocks, htmlTag);
  }

  switch (unit) {
    case 'paragraphs':
      return generateParagraphs(count, startWithLorem);
    case 'sentences':
      return generateSentences(count, startWithLorem);
    case 'words':
      return generateWords(count, startWithLorem);
  }
}

export function countWords(text: string): number {
  const plain = text.replace(/<[^>]*>/g, ' ');
  const words = plain.trim().split(/\s+/);
  return words[0] === '' ? 0 : words.length;
}
