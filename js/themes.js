/* ══════════════ THEMES — dark palettes, picked in settings ══════════════ */
const Themes = (() => {
  // Each theme overrides a handful of root vars. Kept small on purpose.
  const THEMES = {
    midnight: {
      name: 'Midnight Amber', mood: 'warm lamp, cold room',
      vars: {
        '--room': '#1a1520', '--wall': '#2a2233', '--screen': '#121a23', '--screen-bg': '#0c1018',
        '--panel': '#18222d', '--panel-2': '#1e2a37', '--line': '#2a3846',
        '--ink': '#e9e5da', '--dim': '#8a99a9', '--faint': '#5b6875',
        '--amber': '#e9a13b', '--cyan': '#5fd3c4', '--rose': '#e0708a', '--violet': '#9b8cf0',
        '--desk-top': '#5a4230', '--desk': '#3d2e1e', '--desk-dark': '#2b1d12'
      },
      sky: 'linear-gradient(180deg,#1a1520 0%,#241a2e 40%,#3a2740 100%)',
      accent2: '#c77dbb'
    },
    forest: {
      name: 'Deep Forest', mood: 'green dusk, moss and pine',
      vars: {
        '--room': '#0f1712', '--wall': '#16241a', '--screen': '#0f1a15', '--screen-bg': '#0a120d',
        '--panel': '#14231b', '--panel-2': '#1a2e23', '--line': '#274034',
        '--ink': '#e6ebe2', '--dim': '#8aa598', '--faint': '#557060',
        '--amber': '#d4a95a', '--cyan': '#63d19e', '--rose': '#e08a7a', '--violet': '#8fb890',
        '--desk-top': '#4a4028', '--desk': '#332c1a', '--desk-dark': '#221d10'
      },
      sky: 'linear-gradient(180deg,#0f1712 0%,#16241a 45%,#243a28 100%)',
      accent2: '#7fbf8a'
    },
    ocean: {
      name: 'Abyssal Blue', mood: 'deep water, bioluminescence',
      vars: {
        '--room': '#0c141f', '--wall': '#13202f', '--screen': '#0d1826', '--screen-bg': '#08111c',
        '--panel': '#122032', '--panel-2': '#17293e', '--line': '#22394f',
        '--ink': '#e2eaf2', '--dim': '#84a0bc', '--faint': '#51687a',
        '--amber': '#5fb4d4', '--cyan': '#4fe0d0', '--rose': '#e07a9a', '--violet': '#8ba8f0',
        '--desk-top': '#2e4258', '--desk': '#1e2e3e', '--desk-dark': '#141f2b'
      },
      sky: 'linear-gradient(180deg,#0c141f 0%,#13202f 45%,#1c3348 100%)',
      accent2: '#5fb4d4'
    },
    plum: {
      name: 'Velvet Plum', mood: 'purple neon, late night',
      vars: {
        '--room': '#160f1c', '--wall': '#231733', '--screen': '#150f1e', '--screen-bg': '#0f0916',
        '--panel': '#1c1428', '--panel-2': '#261a35', '--line': '#382a48',
        '--ink': '#ece5f0', '--dim': '#a394b5', '--faint': '#6b5a7d',
        '--amber': '#e0a0d8', '--cyan': '#7fd6e0', '--rose': '#f07aa8', '--violet': '#b89cf5',
        '--desk-top': '#4a3450', '--desk': '#332338', '--desk-dark': '#221726'
      },
      sky: 'linear-gradient(180deg,#160f1c 0%,#231733 45%,#3a2450 100%)',
      accent2: '#c77dcf'
    },
    ember: {
      name: 'Ember Rust', mood: 'firelight on old brick',
      vars: {
        '--room': '#1a1210', '--wall': '#2a1c16', '--screen': '#191210', '--screen-bg': '#120b09',
        '--panel': '#231713', '--panel-2': '#301e18', '--line': '#432b22',
        '--ink': '#f0e6dd', '--dim': '#b59a8a', '--faint': '#7d5f50',
        '--amber': '#f08a4b', '--cyan': '#6fc9b0', '--rose': '#e86a6a', '--violet': '#c99a8a',
        '--desk-top': '#5a3820', '--desk': '#3d2614', '--desk-dark': '#2b1a0e'
      },
      sky: 'linear-gradient(180deg,#1a1210 0%,#2a1c16 45%,#42281c 100%)',
      accent2: '#e0703b'
    },
    slate: {
      name: 'Graphite Mono', mood: 'quiet, ink and paper',
      vars: {
        '--room': '#141619', '--wall': '#1e2126', '--screen': '#16191d', '--screen-bg': '#101215',
        '--panel': '#1b1f24', '--panel-2': '#242930', '--line': '#333942',
        '--ink': '#e8eaed', '--dim': '#98a0aa', '--faint': '#616872',
        '--amber': '#c4b590', '--cyan': '#7fc4c0', '--rose': '#d08a94', '--violet': '#9ba8c4',
        '--desk-top': '#454b52', '--desk': '#2e3339', '--desk-dark': '#20242a'
      },
      sky: 'linear-gradient(180deg,#141619 0%,#1e2126 45%,#2a2f36 100%)',
      accent2: '#a0a8b4'
    }
  };

  let currentKey = Store.get('ui.theme', 'midnight');

  function apply(key) {
    const t = THEMES[key] || THEMES.midnight;
    currentKey = key;
    const root = document.documentElement;
    Object.entries(t.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.style.setProperty('--amber-glow', hexA(t.vars['--amber'], .15));
    root.style.setProperty('--sky', t.sky);
    root.style.setProperty('--accent2', t.accent2 || t.vars['--cyan']);
    Store.set('ui.theme', key);
    document.body.dataset.theme = key;
  }
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function list() { return Object.entries(THEMES).map(([k, t]) => ({ key: k, ...t })); }
  function current() { return currentKey; }

  return { apply, list, current, THEMES };
})();
