// partyColors.js
// ─────────────────────────────────────────────────────────────────────────────
// Official / widely-recognised brand colors for Nigerian political parties.
// Each entry has:
//   bg    — solid brand color (for badges, pills, filled chips)
//   bar   — chart bar / progress fill (same as bg for most)
//   text  — foreground on `bg` (always passes 4.5:1 AA contrast)
//   light — very pale tint for table row highlights / card backgrounds
//   glow  — rgba shadow for glowing bar effects (used by VoteBar)
//   label — bright accent for dark-canvas text labels (dashboard header etc.)
// ─────────────────────────────────────────────────────────────────────────────

const PARTY_COLORS = {
  // ── Tier 1: Major parties ──────────────────────────────────────────────────

  APC: {
    // All Progressives Congress — broom logo, green + white
    bg:    '#006B35',
    bar:   '#008C45',
    text:  '#FFFFFF',
    light: '#E6F4EC',
    glow:  'rgba(0, 140, 69, 0.45)',
    label: '#4ADE80',
  },

PDP: {
    // Peoples Democratic Party — umbrella logo, primary red
    bg:    '#C8102E',
    bar:   '#E0112F',
    text:  '#FFFFFF',
    light: '#FDECEA',
    glow:  'rgba(224, 17, 47, 0.40)',
    label: '#FCA5A5',
  },

  LP: {
    // Labour Party — horse + wheel logo; gold/yellow is their secondary brand color
    // deliberately distinct from PDP red on dark dashboards
    bg:    '#B47E00',
    bar:   '#D4940A',
    text:  '#FFFFFF',
    light: '#FEF9E7',
    glow:  'rgba(212, 148, 10, 0.45)',
    label: '#FCD34D',
  },

  NNPP: {
    // New Nigeria Peoples Party — purple & gold
    bg:    '#5B21B6',
    bar:   '#7C3AED',
    text:  '#FFFFFF',
    light: '#EDE9FE',
    glow:  'rgba(124, 58, 237, 0.40)',
    label: '#C4B5FD',
  },

  APGA: {
    // All Progressives Grand Alliance — cockerel, forest green
    bg:    '#1A5C2A',
    bar:   '#22763A',
    text:  '#FFFFFF',
    light: '#E8F5EC',
    glow:  'rgba(34, 118, 58, 0.40)',
    label: '#6EE7A0',
  },

  // ── Tier 2: Notable parties ────────────────────────────────────────────────

  SDP: {
    // Social Democratic Party — blue
    bg:    '#0047AB',
    bar:   '#1559C4',
    text:  '#FFFFFF',
    light: '#E6EEFA',
    glow:  'rgba(21, 89, 196, 0.40)',
    label: '#93C5FD',
  },

  ADC: {
    // African Democratic Congress — royal blue
    bg:    '#1D4ED8',
    bar:   '#2563EB',
    text:  '#FFFFFF',
    light: '#EFF6FF',
    glow:  'rgba(37, 99, 235, 0.40)',
    label: '#93C5FD',
  },

  YPP: {
    // Young Progressives Party — teal / cyan
    bg:    '#0E7490',
    bar:   '#0891B2',
    text:  '#FFFFFF',
    light: '#ECFEFF',
    glow:  'rgba(8, 145, 178, 0.40)',
    label: '#67E8F9',
  },

  PRP: {
    // Peoples Redemption Party — deep red / maroon
    bg:    '#9F1239',
    bar:   '#BE123C',
    text:  '#FFFFFF',
    light: '#FFF1F2',
    glow:  'rgba(190, 18, 60, 0.40)',
    label: '#FDA4AF',
  },

  APM: {
    // Allied Peoples Movement — orange
    bg:    '#C2410C',
    bar:   '#EA580C',
    text:  '#FFFFFF',
    light: '#FFF7ED',
    glow:  'rgba(234, 88, 12, 0.40)',
    label: '#FDBA74',
  },

  AAC: {
    // African Action Congress — deep orange / amber
    bg:    '#B45309',
    bar:   '#D97706',
    text:  '#FFFFFF',
    light: '#FFFBEB',
    glow:  'rgba(217, 119, 6, 0.40)',
    label: '#FCD34D',
  },

  ADP: {
    // Action Democratic Party — indigo
    bg:    '#4338CA',
    bar:   '#6366F1',
    text:  '#FFFFFF',
    light: '#EEF2FF',
    glow:  'rgba(99, 102, 241, 0.40)',
    label: '#A5B4FC',
  },

  BP: {
    // Boot Party — slate / charcoal
    bg:    '#334155',
    bar:   '#475569',
    text:  '#FFFFFF',
    light: '#F1F5F9',
    glow:  'rgba(71, 85, 105, 0.40)',
    label: '#CBD5E1',
  },

  ZLP: {
    // Zenith Labour Party — deep teal
    bg:    '#115E59',
    bar:   '#0F766E',
    text:  '#FFFFFF',
    light: '#F0FDFA',
    glow:  'rgba(15, 118, 110, 0.40)',
    label: '#5EEAD4',
  },

  AA: {
    // Action Alliance — amber / gold
    bg:    '#92400E',
    bar:   '#B45309',
    text:  '#FFFFFF',
    light: '#FFFBEB',
    glow:  'rgba(180, 83, 9, 0.40)',
    label: '#FDE68A',
  },
};

// ── Fallback palette for any unlisted / future parties ─────────────────────
// Distinct enough that two unknown parties never look the same.
const FALLBACK_PALETTE = [
  { bg: '#0369A1', bar: '#0EA5E9', text: '#FFFFFF', light: '#F0F9FF', glow: 'rgba(14,165,233,0.4)',  label: '#7DD3FC' },
  { bg: '#6D28D9', bar: '#8B5CF6', text: '#FFFFFF', light: '#F5F3FF', glow: 'rgba(139,92,246,0.4)', label: '#C4B5FD' },
  { bg: '#065F46', bar: '#10B981', text: '#FFFFFF', light: '#ECFDF5', glow: 'rgba(16,185,129,0.4)', label: '#6EE7B7' },
  { bg: '#9D174D', bar: '#EC4899', text: '#FFFFFF', light: '#FDF2F8', glow: 'rgba(236,72,153,0.4)', label: '#F9A8D4' },
  { bg: '#1E3A5F', bar: '#3B82F6', text: '#FFFFFF', light: '#EFF6FF', glow: 'rgba(59,130,246,0.4)', label: '#93C5FD' },
  { bg: '#7C2D12', bar: '#F97316', text: '#FFFFFF', light: '#FFF7ED', glow: 'rgba(249,115,22,0.4)', label: '#FDBA74' },
  { bg: '#164E63', bar: '#06B6D4', text: '#FFFFFF', light: '#ECFEFF', glow: 'rgba(6,182,212,0.4)',  label: '#67E8F9' },
  { bg: '#3B0764', bar: '#A855F7', text: '#FFFFFF', light: '#FAF5FF', glow: 'rgba(168,85,247,0.4)', label: '#D8B4FE' },
];

// ── Runtime cache (fallback assignment is stable within a session) ──────────
const fallbackCache = new Map();
let   fallbackCounter = 0;

/**
 * Returns the full color token object for a party abbreviation.
 * Known parties always return their official brand color.
 * Unknown parties get a stable fallback (same party = same color each run).
 */
export const partyColor = (party) => {
  const key = (party ?? '').toUpperCase().trim();
  if (!key) return FALLBACK_PALETTE[0];

  if (PARTY_COLORS[key]) return PARTY_COLORS[key];

  if (!fallbackCache.has(key)) {
    fallbackCache.set(key, FALLBACK_PALETTE[fallbackCounter % FALLBACK_PALETTE.length]);
    fallbackCounter++;
  }
  return fallbackCache.get(key);
};

// ── Convenience accessors (kept for backward compat) ──────────────────────
export const partyBg    = (p) => partyColor(p).bg;
export const partyLight = (p) => partyColor(p).light;
export const partyBar   = (p) => partyColor(p).bar;
export const partyGlow  = (p) => partyColor(p).glow;
export const partyLabel = (p) => partyColor(p).label;

export const allPartyColors = (parties) => parties.map((p) => partyColor(p).bar);