import type { Preset } from './types';

export const PRESETS: Preset[] = [
  {
    id: 'klassisk',
    name: 'Klassisk',
    sub: 'Varm & traditionell',
    fontsUrl:
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap',
    vars: {
      '--cream': '#F8F5EF',
      '--ink': '#1E1B18',
      '--ink-soft': '#4A4540',
      '--gold': '#A8845A',
      '--gold-lt': '#C9A97A',
      '--rule': '#D8CFC4',
      '--bg-outer': '#E0DCD4',
      '--font-head': "'Cormorant Garamond', Georgia, serif",
      '--font-body': "'EB Garamond', Georgia, serif",
    },
    swatch: ['#F8F5EF', '#1E1B18', '#A8845A'],
  },
  {
    id: 'tidning',
    name: 'Tidning',
    sub: 'Redaktionell',
    fontsUrl:
      'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Serif+4:opsz,wght@8..60,300;8..60,400&display=swap',
    vars: {
      '--cream': '#FFFDF8',
      '--ink': '#111111',
      '--ink-soft': '#555555',
      '--gold': '#8B0000',
      '--gold-lt': '#CC2222',
      '--rule': '#CCCCCC',
      '--bg-outer': '#CCCCCC',
      '--font-head': "'Playfair Display', Georgia, serif",
      '--font-body': "'Source Serif 4', Georgia, serif",
    },
    swatch: ['#FFFDF8', '#111111', '#8B0000'],
  },
  {
    id: 'nordisk',
    name: 'Nordisk',
    sub: 'Kylig & minimal',
    fontsUrl:
      'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=PT+Serif:ital,wght@0,400;1,400&display=swap',
    vars: {
      '--cream': '#F0F4F5',
      '--ink': '#1B2D35',
      '--ink-soft': '#4A6572',
      '--gold': '#3E7D96',
      '--gold-lt': '#6AAFC4',
      '--rule': '#C0D4DC',
      '--bg-outer': '#C8D8DF',
      '--font-head': "'Libre Baskerville', Georgia, serif",
      '--font-body': "'PT Serif', Georgia, serif",
    },
    swatch: ['#F0F4F5', '#1B2D35', '#3E7D96'],
  },
  {
    id: 'mork',
    name: 'Mörk',
    sub: 'Nattlig & elegant',
    fontsUrl:
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap',
    vars: {
      '--cream': '#1E1B2E',
      '--ink': '#E8E4DC',
      '--ink-soft': '#A09898',
      '--gold': '#D4A853',
      '--gold-lt': '#E8C97A',
      '--rule': '#3D3555',
      '--bg-outer': '#0F0D1A',
      '--font-head': "'Cormorant Garamond', Georgia, serif",
      '--font-body': "'EB Garamond', Georgia, serif",
    },
    swatch: ['#1E1B2E', '#E8E4DC', '#D4A853'],
  },
  {
    id: 'pastoral',
    name: 'Pastoral',
    sub: 'Naturlig & varm',
    fontsUrl:
      'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=Crimson+Pro:ital,wght@0,300;0,400;1,300;1,400&display=swap',
    vars: {
      '--cream': '#F5EDD6',
      '--ink': '#2D3B1F',
      '--ink-soft': '#5B6E42',
      '--gold': '#8B7040',
      '--gold-lt': '#AA9060',
      '--rule': '#D4C5A0',
      '--bg-outer': '#DDD0AA',
      '--font-head': "'Lora', Georgia, serif",
      '--font-body': "'Crimson Pro', Georgia, serif",
    },
    swatch: ['#F5EDD6', '#2D3B1F', '#8B7040'],
  },
];

export function presetCSS(p: Preset): string {
  const vars = Object.entries(p.vars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(' ');
  return `@import url('${p.fontsUrl}'); :root { ${vars} }`;
}
