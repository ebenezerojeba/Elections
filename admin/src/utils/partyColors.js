// Deterministic color assignment per party name.
// Same party always gets the same color regardless of render order.
const PALETTE = [
  { bg: '#0D0D0D', text: '#ffffff', light: '#f5f5f5', bar: '#0D0D0D' },  // ink
  { bg: '#00C896', text: '#ffffff', light: '#e6faf5', bar: '#00C896' },  // vote green
  { bg: '#F5A623', text: '#ffffff', light: '#fef8ec', bar: '#F5A623' },  // gold
  { bg: '#FF4D4F', text: '#ffffff', light: '#fff1f1', bar: '#FF4D4F' },  // alert red
  { bg: '#6366F1', text: '#ffffff', light: '#eef2ff', bar: '#6366F1' },  // indigo
  { bg: '#EC4899', text: '#ffffff', light: '#fdf2f8', bar: '#EC4899' },  // pink
  { bg: '#14B8A6', text: '#ffffff', light: '#f0fdfa', bar: '#14B8A6' },  // teal
  { bg: '#F97316', text: '#ffffff', light: '#fff7ed', bar: '#F97316' },  // orange
];

const cache = new Map();
let   counter = 0;

export const partyColor = (party) => {
  const key = party?.toUpperCase() || '?';
  if (!cache.has(key)) {
    cache.set(key, PALETTE[counter % PALETTE.length]);
    counter++;
  }
  return cache.get(key);
};

export const partyBg    = (p) => partyColor(p).bg;
export const partyLight = (p) => partyColor(p).light;
export const partyBar   = (p) => partyColor(p).bar;

export const allPartyColors = (parties) =>
  parties.map((p) => partyColor(p).bar);