
// app-screens.jsx — All screen components for InformaTheme main app
// Shared by all 3 visual variants

const { useState, useEffect, useRef } = React;

// ── ICONS (inline SVG helpers) ────────────────────────────────
const Icon = ({ d, size = 20, stroke = 'currentColor', fill = 'none', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const Icons = {
  home:     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  palette:  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z",
  widget:   "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
  image:    "M21 19a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h3l2-3h4l2 3h3a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8z",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  user:     "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  plus:     "M12 5v14M5 12h14",
  check:    "M20 6L9 17l-5-5",
  chevron:  "M9 18l6-6-6-6",
  back:     "M19 12H5M12 19l-7-7 7-7",
  bell:     "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  lock:     "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  heart:    "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  cloud:    "M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z",
  menu:     "M3 12h18M3 6h18M3 18h18",
  x:        "M18 6L6 18M6 6l12 12",
  sprout:   "M12 22v-7 M9 9a3 3 0 106 0c0-3-2-6-6-8-1 3-1 6 0 8z",
  gift:     "M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  zap:      "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};

// ── SHARED COMPONENTS ──────────────────────────────────────────

function AppStatusBar({ theme }) {
  const now = new Date();
  const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  return (
    <div style={{
      height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', flexShrink: 0,
      background: theme.statusBg || 'transparent',
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: theme.text, fontFamily: 'Space Mono, monospace' }}>{t}</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {/* signal */}
        <svg width="16" height="12" viewBox="0 0 16 12">
          {[0,1,2,3].map(i => (
            <rect key={i} x={i*4} y={12-(i+1)*3} width="3" height={(i+1)*3} rx="1"
              fill={theme.text} opacity={i < 3 ? 1 : 0.3} />
          ))}
        </svg>
        {/* wifi */}
        <svg width="16" height="12" viewBox="0 0 24 18" fill="none">
          <path d="M1 6C5.5 1.5 18.5 1.5 23 6" stroke={theme.text} strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
          <path d="M4.5 10C7.5 7 16.5 7 19.5 10" stroke={theme.text} strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
          <path d="M8.5 14C10 12.5 14 12.5 15.5 14" stroke={theme.text} strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="12" cy="17.5" r="1.5" fill={theme.text}/>
        </svg>
        {/* battery */}
        <svg width="22" height="12" viewBox="0 0 22 12">
          <rect x="0.5" y="0.5" width="18" height="11" rx="2" stroke={theme.text} strokeWidth="1.2" fill="none"/>
          <rect x="2" y="2" width="13" height="8" rx="1" fill={theme.accent}/>
          <rect x="19" y="3.5" width="2.5" height="5" rx="1" fill={theme.text} opacity="0.5"/>
        </svg>
      </div>
    </div>
  );
}

function TopBar({ title, onMenu, onBack, theme, rightEl }) {
  return (
    <div style={{
      height: 52, display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: 10, flexShrink: 0,
      borderBottom: `1px solid ${theme.border}`,
      background: theme.surface,
    }}>
      <button onClick={onBack || onMenu} style={{
        width: 36, height: 36, borderRadius: 10, border: 'none',
        background: theme.bgHover, color: theme.text2,
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}>
        <Icon d={onBack ? Icons.back : Icons.menu} size={18} stroke={theme.text2} />
      </button>
      <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: theme.text }}>{title}</span>
      {rightEl}
    </div>
  );
}

// ── ONBOARDING ─────────────────────────────────────────────────
const ONBOARDING_STEPS = [
  {
    icon: Icons.lock,
    iconColor: '#4ade80',
    title: 'Your Life, Always Visible',
    body: 'InformaTheme places your most precious milestones — birthdays, anniversaries, firsts — right on your lockscreen.',
    cta: 'Get Started',
  },
  {
    icon: Icons.sprout,
    iconColor: '#34d399',
    title: 'Add Your Anchor Dates',
    body: "Tell us what matters: a child's birthday, a wedding date, a personal goal. We'll track every day since.",
    cta: 'Continue',
  },
  {
    icon: Icons.palette,
    iconColor: '#a78bfa',
    title: 'Pick Your Theme',
    body: 'Choose from nature-inspired lockscreen themes or design your own with custom colors, fonts, and widgets.',
    cta: 'Continue',
  },
  {
    icon: Icons.shield,
    iconColor: '#fb923c',
    title: 'Grant Permissions',
    body: "To show your overlay on the lockscreen, we need two Android permissions. We'll walk you through each one.",
    cta: 'Grant Permissions',
    isPermissions: true,
  },
];

function OnboardingScreen({ theme, onDone }) {
  const [step, setStep] = useState(0);
  const [permStep, setPermStep] = useState(0);
  const s = ONBOARDING_STEPS[step];

  const perms = [
    { name: 'Display over other apps', desc: 'Allows the overlay to appear on your lockscreen', granted: permStep > 0 },
    { name: 'Full Screen Intent', desc: 'Lets the overlay show without unlocking', granted: permStep > 1 },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: theme.bg, overflow: 'hidden' }}>
      <AppStatusBar theme={theme} />

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '12px 0 0' }}>
        {ONBOARDING_STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 7, height: 7, borderRadius: 4,
            background: i === step ? theme.accent : i < step ? theme.accent + '60' : theme.border,
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Hero area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 32px' }}>
        {/* Icon bubble */}
        <div style={{
          width: 96, height: 96, borderRadius: 28, marginBottom: 32,
          background: s.iconColor + '18',
          border: `2px solid ${s.iconColor}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={s.icon} size={44} stroke={s.iconColor} strokeWidth={1.5} />
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: theme.text, textAlign: 'center', lineHeight: 1.25, marginBottom: 14 }}>
          {s.title}
        </h1>
        <p style={{ fontSize: 14, color: theme.text2, textAlign: 'center', lineHeight: 1.65, marginBottom: 32 }}>
          {s.body}
        </p>

        {/* Permissions step */}
        {s.isPermissions && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {perms.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: theme.card, borderRadius: 14, padding: '14px 16px',
                border: `1px solid ${p.granted ? theme.accent + '50' : theme.border}`,
                transition: 'border-color 0.3s',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: p.granted ? theme.accent + '20' : theme.bgHover,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon d={p.granted ? Icons.check : Icons.lock} size={16}
                    stroke={p.granted ? theme.accent : theme.text3} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: theme.text3, marginTop: 1 }}>{p.desc}</div>
                </div>
                {!p.granted && (
                  <button onClick={() => setPermStep(i + 1)} style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none',
                    background: theme.accent, color: '#000', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>Grant</button>
                )}
                {p.granted && (
                  <span style={{ fontSize: 11, color: theme.accent, fontWeight: 700 }}>✓ Done</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 24px 40px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => { if (step < ONBOARDING_STEPS.length - 1) setStep(step + 1); else onDone?.(); }} style={{
          width: '100%', padding: '16px', borderRadius: 16, border: 'none',
          background: theme.accent, color: '#000', fontSize: 16, fontWeight: 800,
          cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 0.2,
        }}>{s.cta}</button>
        {step < ONBOARDING_STEPS.length - 1 && (
          <button onClick={() => onDone?.()} style={{
            width: '100%', padding: '12px', borderRadius: 16, border: 'none',
            background: 'none', color: theme.text3, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Skip for now</button>
        )}
      </div>
    </div>
  );
}

// ── HOME / DASHBOARD ───────────────────────────────────────────
function HomeScreen({ theme, onNav }) {
  const dates = [
    { label: "Luka's Birthday", icon: Icons.sprout, color: '#4ade80', days: 28, since: 1435, age: '3y 11m 2d' },
    { label: "Wedding Anniversary", icon: Icons.heart, color: '#f472b6', days: 360, since: 2190, age: '6y 0m 5d' },
    { label: "First Steps", icon: Icons.star, color: '#fbbf24', days: null, since: 1011, age: null },
  ];

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: theme.bg, overflowY: 'auto' }}>
      <AppStatusBar theme={theme} />

      {/* Header */}
      <div style={{ padding: '8px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: theme.text3, fontWeight: 500 }}>{greeting} 👋</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, lineHeight: 1.2 }}>Your Timeline</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onNav('settings')} style={{
            width: 38, height: 38, borderRadius: 12, border: `1px solid ${theme.border}`,
            background: theme.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <Icon d={Icons.bell} size={17} stroke={theme.text2} />
          </button>
          <div style={{
            width: 38, height: 38, borderRadius: 12, background: theme.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 800, color: '#000',
          }}>J</div>
        </div>
      </div>

      {/* Active theme card */}
      <div style={{ margin: '0 16px 16px' }}>
        <div style={{
          borderRadius: 20, overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(135deg, #1a2e1a 0%, #0d1a0d 100%)',
          padding: '18px 18px 16px',
          border: `1px solid rgba(74,222,128,0.2)`,
        }}>
          {/* BG texture */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234ade80' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 10, color: '#4ade80', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Active Theme</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>Dark Forest</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Last updated today</div>
              </div>
              <button onClick={() => onNav('themes')} style={{
                padding: '8px 16px', borderRadius: 10, border: 'none',
                background: '#4ade80', color: '#000', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>Edit</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {['#4ade80','#22c55e','#16a34a','#15803d'].map(c => (
                <div key={c} style={{ width: 20, height: 20, borderRadius: 6, background: c }} />
              ))}
              <div style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'Space Mono, monospace' }}>6 widgets active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Anchor Dates */}
      <div style={{ padding: '0 20px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>Anchor Dates</span>
        <button onClick={() => onNav('dates')} style={{ fontSize: 12, color: theme.accent, background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>See all</button>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {dates.map((d, i) => (
          <div key={i} style={{
            background: theme.card, borderRadius: 16, padding: '14px 16px',
            border: `1px solid ${theme.border}`,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 13, background: d.color + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon d={d.icon} size={20} stroke={d.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{d.label}</div>
              <div style={{ fontSize: 11, color: theme.text3, marginTop: 2 }}>
                {d.since} days ago{d.age ? ` · ${d.age}` : ''}
              </div>
            </div>
            {d.days && (
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: d.color, fontFamily: 'Space Mono, monospace' }}>{d.days}</div>
                <div style={{ fontSize: 9, color: theme.text3, textTransform: 'uppercase', letterSpacing: 0.5 }}>days left</div>
              </div>
            )}
          </div>
        ))}

        {/* Add new */}
        <button onClick={() => onNav('dates')} style={{
          background: 'none', border: `2px dashed ${theme.border}`, borderRadius: 16,
          padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          color: theme.text3, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
        }}>
          <Icon d={Icons.plus} size={16} stroke={theme.text3} />
          Add anchor date
        </button>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '0 20px', marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>Quick Actions</span>
      </div>
      <div style={{ padding: '0 16px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'Themes', icon: Icons.palette, color: '#a78bfa', nav: 'themes' },
          { label: 'Widgets', icon: Icons.widget, color: '#38bdf8', nav: 'widgets' },
          { label: 'Wallpapers', icon: Icons.image, color: '#fb923c', nav: 'wallpapers' },
          { label: 'Settings', icon: Icons.settings, color: '#94a3b8', nav: 'settings' },
        ].map(q => (
          <button key={q.label} onClick={() => onNav(q.nav)} style={{
            background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16,
            padding: '16px 16px', display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: q.color + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon d={q.icon} size={18} stroke={q.color} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{q.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── ANCHOR DATES ───────────────────────────────────────────────
function DatesScreen({ theme, onBack }) {
  const [adding, setAdding] = useState(false);
  const [entries, setEntries] = useState([
    { id: 1, label: "Luka's Birthday", date: '2021-05-16', icon: Icons.sprout, color: '#4ade80', type: 'birthday' },
    { id: 2, label: "Wedding Anniversary", date: '2018-09-22', icon: Icons.heart, color: '#f472b6', type: 'anniversary' },
    { id: 3, label: "First Steps", date: '2022-02-01', icon: Icons.star, color: '#fbbf24', type: 'milestone' },
  ]);

  const daysSince = (d) => Math.floor((new Date() - new Date(d)) / 86400000);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: theme.bg }}>
      <AppStatusBar theme={theme} />
      <TopBar title="Anchor Dates" onBack={onBack} theme={theme} rightEl={
        <button onClick={() => setAdding(true)} style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icon d={Icons.plus} size={18} stroke="#000" />
        </button>
      } />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Type filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['All','Birthday','Anniversary','Milestone'].map((f, i) => (
            <button key={f} style={{
              padding: '6px 14px', borderRadius: 99, border: `1px solid ${i === 0 ? theme.accent : theme.border}`,
              background: i === 0 ? theme.accent + '18' : 'none',
              color: i === 0 ? theme.accent : theme.text2,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>{f}</button>
          ))}
        </div>

        {entries.map(e => {
          const since = daysSince(e.date);
          const years = Math.floor(since / 365);
          const months = Math.floor((since % 365) / 30);
          const days = since % 30;
          return (
            <div key={e.id} style={{
              background: theme.card, borderRadius: 18, padding: '16px',
              border: `1px solid ${theme.border}`, marginBottom: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14, background: e.color + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon d={e.icon} size={22} stroke={e.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{e.label}</div>
                  <div style={{ fontSize: 11, color: theme.text3, marginTop: 2 }}>Since {e.date}</div>
                </div>
                <button style={{ background: 'none', border: 'none', color: theme.text3, cursor: 'pointer', fontSize: 18 }}>⋯</button>
              </div>
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                {[
                  { val: since, label: 'Total Days' },
                  { val: years, label: 'Years' },
                  { val: months, label: 'Months' },
                  { val: days, label: 'Days' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: theme.bgHover, borderRadius: 10, padding: '10px 8px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: e.color, fontFamily: 'Space Mono, monospace' }}>{s.val}</div>
                    <div style={{ fontSize: 9, color: theme.text3, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Add sheet */}
        {adding && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 100,
          }} onClick={() => setAdding(false)}>
            <div style={{
              background: theme.surface, borderRadius: '24px 24px 0 0', padding: '24px 20px 40px',
              width: '100%',
            }} onClick={e => e.stopPropagation()}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: theme.border, margin: '0 auto 20px' }}></div>
              <div style={{ fontSize: 18, fontWeight: 800, color: theme.text, marginBottom: 18 }}>New Anchor Date</div>
              {['Label', 'Date', 'Type'].map(f => (
                <div key={f} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: theme.text3, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f}</div>
                  <div style={{
                    padding: '12px 14px', background: theme.bgHover, borderRadius: 12,
                    border: `1px solid ${theme.border}`, color: theme.text2, fontSize: 14,
                  }}>{f === 'Date' ? 'Select date…' : f === 'Type' ? 'Birthday ▾' : "e.g. Luka's Birthday"}</div>
                </div>
              ))}
              <button onClick={() => setAdding(false)} style={{
                width: '100%', padding: '15px', borderRadius: 14, border: 'none',
                background: theme.accent, color: '#000', fontSize: 15, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>Save Date</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── WIDGETS SCREEN ─────────────────────────────────────────────
function WidgetsScreen({ theme, onBack }) {
  const [widgets, setWidgets] = useState([
    { id: 'clock', name: 'Digital Clock', desc: 'Large stencil-style time display', enabled: true, icon: Icons.zap, color: '#4ade80' },
    { id: 'milestone', name: 'Milestone Tracker', desc: 'Live age calculation', enabled: true, icon: Icons.sprout, color: '#34d399' },
    { id: 'anniversary', name: 'Anniversary Ring', desc: 'Circular progress for events', enabled: true, icon: Icons.heart, color: '#f472b6' },
    { id: 'growth', name: 'Growth Ring', desc: 'Personal milestone progress', enabled: true, icon: Icons.star, color: '#fbbf24' },
    { id: 'weather', name: 'Weather Pill', desc: 'Temperature and location', enabled: true, icon: Icons.cloud, color: '#38bdf8' },
    { id: 'battery', name: 'Battery Bar', desc: 'Animated charging indicator', enabled: false, icon: Icons.zap, color: '#fb923c' },
    { id: 'goal', name: 'Daily Goal', desc: 'Your motivation message', enabled: true, icon: Icons.shield, color: '#a78bfa' },
    { id: 'event', name: 'Event Countdown', desc: 'Days until next special date', enabled: false, icon: Icons.gift, color: '#f87171' },
  ]);

  const toggle = (id) => setWidgets(ws => ws.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  const active = widgets.filter(w => w.enabled).length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: theme.bg }}>
      <AppStatusBar theme={theme} />
      <TopBar title="Widgets" onBack={onBack} theme={theme} />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Summary */}
        <div style={{ margin: '12px 16px', background: theme.card, borderRadius: 16, padding: '14px 16px', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: theme.accent + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20 }}>📱</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{active} widgets active</div>
            <div style={{ fontSize: 12, color: theme.text3, marginTop: 1 }}>Tap to toggle on your lockscreen</div>
          </div>
        </div>

        <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {widgets.map(w => (
            <div key={w.id} style={{
              background: theme.card, borderRadius: 16, padding: '14px 16px',
              border: `1px solid ${w.enabled ? w.color + '30' : theme.border}`,
              display: 'flex', alignItems: 'center', gap: 14,
              opacity: w.enabled ? 1 : 0.6, transition: 'all 0.2s',
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: w.color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon d={w.icon} size={20} stroke={w.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{w.name}</div>
                <div style={{ fontSize: 11, color: theme.text3, marginTop: 1 }}>{w.desc}</div>
              </div>
              {/* Toggle */}
              <div onClick={() => toggle(w.id)} style={{
                width: 44, height: 26, borderRadius: 13, cursor: 'pointer', flexShrink: 0,
                background: w.enabled ? theme.accent : theme.bgHover,
                border: `1px solid ${w.enabled ? theme.accent : theme.border}`,
                position: 'relative', transition: 'all 0.2s',
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 10, background: 'white',
                  position: 'absolute', top: 2, transition: 'left 0.2s',
                  left: w.enabled ? 21 : 2,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── WALLPAPERS SCREEN ──────────────────────────────────────────
const WALLPAPERS = [
  { id: 'fd', name: 'Dark Forest', colors: ['#1a2e1a','#0d1a0d'], active: true },
  { id: 'fm', name: 'Misty Forest', colors: ['#c8d5c8','#506840'], active: false },
  { id: 'ns', name: 'Night Sky', colors: ['#0a0a1a','#1a0a2a'], active: false },
  { id: 'gh', name: 'Golden Hour', colors: ['#3d2010','#200808'], active: false },
  { id: 'od', name: 'Ocean Deep', colors: ['#082040','#020810'], active: false },
  { id: 'ar', name: 'Arctic', colors: ['#e8f0f8','#607080'], active: false },
];

function WallpapersScreen({ theme, onBack }) {
  const [active, setActive] = useState('fd');
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: theme.bg }}>
      <AppStatusBar theme={theme} />
      <TopBar title="Wallpapers" onBack={onBack} theme={theme} rightEl={
        <button style={{
          padding: '7px 14px', borderRadius: 10, border: 'none',
          background: theme.bgHover, color: theme.text2, fontSize: 12, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>Upload</button>
      } />
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 32px' }}>
        {/* Upload prompt */}
        <div style={{
          border: `2px dashed ${theme.border}`, borderRadius: 18, padding: '24px 20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          marginBottom: 20, cursor: 'pointer',
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: theme.bgHover, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={Icons.image} size={22} stroke={theme.text3} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>Upload Custom Photo</div>
          <div style={{ fontSize: 12, color: theme.text3, textAlign: 'center' }}>From gallery or camera · JPEG, PNG up to 20MB</div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: theme.text3, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Built-in Themes</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {WALLPAPERS.map(w => (
            <div key={w.id} onClick={() => setActive(w.id)} style={{
              borderRadius: 16, overflow: 'hidden', cursor: 'pointer', position: 'relative',
              border: `2px solid ${active === w.id ? theme.accent : 'transparent'}`,
              transition: 'border-color 0.2s',
            }}>
              <div style={{
                aspectRatio: '9/14',
                background: `linear-gradient(170deg, ${w.colors[0]}, ${w.colors[1]})`,
                display: 'flex', alignItems: 'flex-end',
              }}>
                <div style={{
                  width: '100%', padding: '8px 10px',
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{w.name}</div>
                </div>
              </div>
              {active === w.id && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 22, height: 22, borderRadius: 11, background: theme.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon d={Icons.check} size={12} stroke="#000" strokeWidth={2.5} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS ───────────────────────────────────────────────────
function SettingsScreen({ theme, onBack }) {
  const sections = [
    {
      title: 'Account',
      items: [
        { icon: Icons.user, label: 'Profile', desc: 'John & Family', color: '#60a5fa' },
        { icon: Icons.cloud, label: 'Cloud Sync', desc: 'Last synced 2 min ago', color: '#34d399' },
        { icon: Icons.heart, label: 'Profiles', desc: '2 family profiles', color: '#f472b6' },
      ]
    },
    {
      title: 'Permissions',
      items: [
        { icon: Icons.lock, label: 'Display Over Apps', desc: 'Granted ✓', color: '#4ade80' },
        { icon: Icons.shield, label: 'Full Screen Intent', desc: 'Granted ✓', color: '#4ade80' },
        { icon: Icons.bell, label: 'Notifications', desc: 'Allowed', color: '#fbbf24' },
      ]
    },
    {
      title: 'App',
      items: [
        { icon: Icons.zap, label: 'Auto-Start', desc: 'On device boot', color: '#fb923c' },
        { icon: Icons.star, label: 'Rate InformaTheme', desc: 'Share your experience', color: '#fbbf24' },
        { icon: Icons.settings, label: 'About', desc: 'v1.0.0 · Build 42', color: '#94a3b8' },
      ]
    },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: theme.bg }}>
      <AppStatusBar theme={theme} />
      <TopBar title="Settings" onBack={onBack} theme={theme} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
        {sections.map(sec => (
          <div key={sec.title} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.text3, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4 }}>{sec.title}</div>
            <div style={{ background: theme.card, borderRadius: 18, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
              {sec.items.map((item, i) => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  borderTop: i > 0 ? `1px solid ${theme.border}` : 'none',
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: item.color + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon d={item.icon} size={17} stroke={item.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: theme.text3, marginTop: 1 }}>{item.desc}</div>
                  </div>
                  <Icon d={Icons.chevron} size={16} stroke={theme.text3} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DRAWER ─────────────────────────────────────────────────────
function Drawer({ open, theme, currentScreen, onNav, onClose }) {
  const items = [
    { id: 'home', label: 'Home', icon: Icons.home },
    { id: 'dates', label: 'Anchor Dates', icon: Icons.calendar },
    { id: 'themes', label: 'Themes', icon: Icons.palette },
    { id: 'widgets', label: 'Widgets', icon: Icons.widget },
    { id: 'wallpapers', label: 'Wallpapers', icon: Icons.image },
    { id: 'settings', label: 'Settings', icon: Icons.settings },
  ];
  return (
    <>
      {/* Scrim */}
      {open && <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} />}
      {/* Drawer panel */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '78%',
        background: theme.surface, zIndex: 51,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column', boxShadow: open ? '8px 0 32px rgba(0,0,0,0.4)' : 'none',
      }}>
        {/* Header */}
        <div style={{ padding: '52px 20px 20px', borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, background: theme.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800, color: '#000',
            }}>J</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>John's Family</div>
              <div style={{ fontSize: 11, color: theme.text3 }}>john@example.com</div>
            </div>
          </div>
        </div>
        {/* Nav items */}
        <div style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {items.map(item => (
            <button key={item.id} onClick={() => { onNav(item.id); onClose(); }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 14px', borderRadius: 14, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left', marginBottom: 2,
              background: currentScreen === item.id ? theme.accent + '15' : 'none',
              color: currentScreen === item.id ? theme.accent : theme.text2,
            }}>
              <Icon d={item.icon} size={20} stroke={currentScreen === item.id ? theme.accent : theme.text2} />
              <span style={{ fontSize: 14, fontWeight: currentScreen === item.id ? 700 : 500 }}>{item.label}</span>
            </button>
          ))}
        </div>
        {/* Bottom */}
        <div style={{ padding: '16px 20px 32px', borderTop: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 11, color: theme.text3 }}>InformaTheme v1.0 · Build 42</div>
        </div>
      </div>
    </>
  );
}

// ── APP SHELL ──────────────────────────────────────────────────
function AppShell({ appTheme, startScreen = 'onboarding' }) {
  const [screen, setScreen] = useState(startScreen);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [doneOnboarding, setDoneOnboarding] = useState(startScreen !== 'onboarding');

  const nav = (s) => { setScreen(s); setDrawerOpen(false); };

  const renderScreen = () => {
    if (screen === 'onboarding') return <OnboardingScreen theme={appTheme} onDone={() => { setDoneOnboarding(true); nav('home'); }} />;
    if (screen === 'home') return <HomeScreen theme={appTheme} onNav={nav} />;
    if (screen === 'dates') return <DatesScreen theme={appTheme} onBack={() => nav('home')} />;
    if (screen === 'widgets') return <WidgetsScreen theme={appTheme} onBack={() => nav('home')} />;
    if (screen === 'wallpapers') return <WallpapersScreen theme={appTheme} onBack={() => nav('home')} />;
    if (screen === 'settings') return <SettingsScreen theme={appTheme} onBack={() => nav('home')} />;
    if (screen === 'themes') return <HomeScreen theme={appTheme} onNav={nav} />;
    return null;
  };

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: appTheme.bg, overflow: 'hidden', position: 'relative',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {renderScreen()}
      {doneOnboarding && (
        <Drawer open={drawerOpen} theme={appTheme} currentScreen={screen}
          onNav={nav} onClose={() => setDrawerOpen(false)} />
      )}
    </div>
  );
}

Object.assign(window, { AppShell, Icon, Icons });
