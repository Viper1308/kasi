/* ══════════════ THEMES — dark palettes, picked in settings ══════════════ */
const Themes = (() => {
  // Each theme overrides a handful of root vars. Kept small on purpose.
  const THEMES = {
    nexus: {
      name: 'Nexus Violet', mood: 'near-black, violet command deck',
      vars: {
        '--room': '#0b0a11', '--wall': '#0e0c15', '--screen': '#150f20', '--screen-bg': '#0e0c15',
        '--panel': '#150f20', '--panel-2': '#1c1530', '--line': '#2a2240',
        '--ink': '#f3f1f9', '--dim': '#a49bc4', '--faint': '#655a85',
        '--amber': '#8b6df0', '--cyan': '#5fb4e0', '--rose': '#e0708a', '--violet': '#8b6df0',
        '--desk-top': '#221c33', '--desk': '#1a1626', '--desk-dark': '#0e0c15'
      },
      accent2: '#5fb4e0'
    },
    hud: {
      name: 'HUD Neon', mood: 'near-black, cyan/blue command-deck',
      vars: {
        '--room': '#05080c', '--wall': '#070b10', '--screen': '#070b10', '--screen-bg': '#04070a',
        '--panel': '#0a1119', '--panel-2': '#0e1721', '--line': '#1c3446',
        '--ink': '#dff4ff', '--dim': '#7fa8bc', '--faint': '#3f5c6c',
        '--amber': '#3fe0ff', '--cyan': '#5b8cff', '--rose': '#ff5f7a', '--violet': '#7fd6e0',
        '--desk-top': '#1c3446', '--desk': '#0e1721', '--desk-dark': '#070b10'
      },
      accent2: '#5b8cff'
    },
    midnight: {
      name: 'Slate Mint', mood: 'near-black, cool mint accent',
      vars: {
        '--room': '#0c0c0e', '--wall': '#111113', '--screen': '#151517', '--screen-bg': '#0a0a0c',
        '--panel': '#151517', '--panel-2': '#1b1b1f', '--line': '#26262b',
        '--ink': '#eceef0', '--dim': '#9a9ca3', '--faint': '#5c5e66',
        '--amber': '#7dd3a8', '--cyan': '#5fb4e0', '--rose': '#e0708a', '--violet': '#9b8cf0',
        '--desk-top': '#26262b', '--desk': '#1b1b1f', '--desk-dark': '#111113'
      },
      accent2: '#5fb4e0'
    },
    forest: {
      name: 'Graphite Sage', mood: 'near-black, muted green accent',
      vars: {
        '--room': '#0b0d0c', '--wall': '#101312', '--screen': '#141a17', '--screen-bg': '#090b0a',
        '--panel': '#141a17', '--panel-2': '#1a211d', '--line': '#26302a',
        '--ink': '#e9ede9', '--dim': '#98a49c', '--faint': '#5a675e',
        '--amber': '#8fc98f', '--cyan': '#63c9b0', '--rose': '#e0917a', '--violet': '#94b894',
        '--desk-top': '#26302a', '--desk': '#1a211d', '--desk-dark': '#101312'
      },
      accent2: '#63c9b0'
    },
    ocean: {
      name: 'Graphite Blue', mood: 'near-black, cool blue accent',
      vars: {
        '--room': '#0a0c0f', '--wall': '#0f1319', '--screen': '#131a22', '--screen-bg': '#080b0e',
        '--panel': '#131a22', '--panel-2': '#182130', '--line': '#243144',
        '--ink': '#e6ecf2', '--dim': '#8fa2b8', '--faint': '#556577',
        '--amber': '#5fa8e0', '--cyan': '#4fc9e0', '--rose': '#e07a9a', '--violet': '#8ba8f0',
        '--desk-top': '#243144', '--desk': '#182130', '--desk-dark': '#0f1319'
      },
      accent2: '#4fc9e0'
    },
    plum: {
      name: 'Graphite Violet', mood: 'near-black, violet accent',
      vars: {
        '--room': '#0c0b0f', '--wall': '#121019', '--screen': '#171420', '--screen-bg': '#0a090e',
        '--panel': '#171420', '--panel-2': '#1e1a2b', '--line': '#2d2740',
        '--ink': '#ebe8f0', '--dim': '#a096b0', '--faint': '#605570',
        '--amber': '#b89cf5', '--cyan': '#7fd6e0', '--rose': '#e07ab8', '--violet': '#a58cf0',
        '--desk-top': '#2d2740', '--desk': '#1e1a2b', '--desk-dark': '#121019'
      },
      accent2: '#e07ab8'
    },
    ember: {
      name: 'Graphite Amber', mood: 'near-black, warm amber accent',
      vars: {
        '--room': '#0d0c0b', '--wall': '#131110', '--screen': '#18150f', '--screen-bg': '#0a0908',
        '--panel': '#18150f', '--panel-2': '#211c14', '--line': '#332b1e',
        '--ink': '#f0ebe2', '--dim': '#b0a291', '--faint': '#6e6252',
        '--amber': '#e0a34b', '--cyan': '#6fc9b0', '--rose': '#e0756a', '--violet': '#c9a98a',
        '--desk-top': '#332b1e', '--desk': '#211c14', '--desk-dark': '#131110'
      },
      accent2: '#e0756a'
    },
    slate: {
      name: 'Pure Graphite', mood: 'near-black, monochrome', 
      vars: {
        '--room': '#0a0a0b', '--wall': '#0f0f11', '--screen': '#141416', '--screen-bg': '#08080a',
        '--panel': '#141416', '--panel-2': '#1a1a1d', '--line': '#28282c',
        '--ink': '#e8e8ea', '--dim': '#9b9ba0', '--faint': '#5c5c62',
        '--amber': '#c4c8cc', '--cyan': '#8fa8b4', '--rose': '#c98a94', '--violet': '#9ba0c4',
        '--desk-top': '#28282c', '--desk': '#1a1a1d', '--desk-dark': '#0f0f11'
      },
      accent2: '#8fa8b4'
    }
  };

  /* ---- colour maths, used to derive a full palette from a few picked colours ---- */
  function hexToRgb(hex) {
    hex = String(hex).replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex([r, g, b]) {
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  }
  function rgbToHsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > .5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  }
  function hslToRgb([h, s, l]) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < .5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3);
    }
    return [r * 255, g * 255, b * 255];
  }
  const lighten = (hex, amt) => { const hsl = rgbToHsl(hexToRgb(hex)); hsl[2] = Math.min(100, Math.max(0, hsl[2] + amt)); return rgbToHex(hslToRgb(hsl)); };
  const darken = (hex, amt) => lighten(hex, -amt);
  const rotate = (hex, deg) => { const hsl = rgbToHsl(hexToRgb(hex)); hsl[0] = (hsl[0] + deg + 360) % 360; return rgbToHex(hslToRgb(hsl)); };
  const mix = (hexA, hexB, t) => { const a = hexToRgb(hexA), b = hexToRgb(hexB); return rgbToHex([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]); };

  const DEFAULT_CUSTOM_BASE = { bg: '#171320', panel: '#1d1a29', primary: '#e9a13b', secondary: '#5fd3c4', ink: '#e9e5da' };

  function buildCustom(base) {
    const b = { ...DEFAULT_CUSTOM_BASE, ...base };
    const dark = rgbToHsl(hexToRgb(b.bg))[2] < 50;
    const faint = mix(b.bg, b.ink, dark ? .32 : .45);
    const dim = mix(b.bg, b.ink, dark ? .58 : .68);
    const vars = {
      '--room': b.bg, '--wall': lighten(b.bg, 7), '--screen': mix(b.bg, b.panel, .5), '--screen-bg': darken(b.bg, 3),
      '--panel': b.panel, '--panel-2': lighten(b.panel, 6), '--line': lighten(b.panel, 16),
      '--ink': b.ink, '--dim': dim, '--faint': faint,
      '--amber': b.primary, '--cyan': b.secondary, '--rose': rotate(b.primary, -42), '--violet': rotate(b.secondary, 38),
      '--desk-top': lighten(b.panel, 10), '--desk': b.panel, '--desk-dark': darken(b.panel, 8)
    };
    return {
      name: 'Custom', mood: 'built by you', vars,
      accent2: b.secondary
    };
  }

  function applyCustom(base) {
    Store.set('ui.customBase', base);
    THEMES.custom = buildCustom(base);
    apply('custom');
  }
  const getCustomBase = () => Store.get('ui.customBase', null);

  let currentKey = Store.get('ui.theme', 'nexus');

  function apply(key) {
    if (key === 'custom') THEMES.custom = buildCustom(Store.get('ui.customBase', null) || DEFAULT_CUSTOM_BASE);
    const t = THEMES[key] || THEMES.hud;
    currentKey = key;
    const root = document.documentElement;
    Object.entries(t.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.style.setProperty('--amber-glow', hexA(t.vars['--amber'], .15));
    root.style.setProperty('--accent2', t.accent2 || t.vars['--cyan']);
    Store.set('ui.theme', key);
    document.body.dataset.theme = key;
  }
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function list() {
    const out = Object.entries(THEMES).filter(([k]) => k !== 'custom').map(([k, t]) => ({ key: k, ...t }));
    const base = getCustomBase();
    if (base) out.push({ key: 'custom', ...buildCustom(base) });
    return out;
  }
  function current() { return currentKey; }

  return { apply, list, current, THEMES, applyCustom, getCustomBase, defaultCustomBase: DEFAULT_CUSTOM_BASE };
})();
