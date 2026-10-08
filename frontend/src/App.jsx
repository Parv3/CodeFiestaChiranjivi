import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// Brand colors and tokens from gigwallet
const colors = {
  bg: '#F5F4F0',
  surface: '#FFFFFF',
  ink: '#1C1B19',
  muted: '#6B675F',
  line: '#E3E0D8',
  lineStrong: '#CFCBC1',
  brand: '#1B4D3E',
  onBrand: '#FFFFFF',
  ok: '#1B6B4F',
  okTint: '#E4EEE9',
  bad: '#B3261E',
  badTint: '#FBEDEB',
  avatar: '#ECEAE4',
  star: '#E8B100',
};

// Five-point star SVG path
const STAR_POINTS = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 === 0 ? 14 : 5.9;
  const a = -Math.PI / 2 + (i * Math.PI) / 5;
  return `${(24 + r * Math.cos(a)).toFixed(2)},${(25 + r * Math.sin(a)).toFixed(2)}`;
}).join(' ');

function StarMark({ size = 28, bare = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-label="GigWallet logo" style={{ display: 'block', flexShrink: 0 }}>
      {!bare && <rect width="48" height="48" rx="11" fill={colors.brand} />}
      <polygon points={STAR_POINTS} fill={colors.star} />
    </svg>
  );
}

function Brand({ suffix, size = 28 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <StarMark size={size} />
      <span style={{ fontWeight: 600, fontSize: '15px', color: colors.ink }}>GigWallet</span>
      {suffix ? <span style={{ fontSize: '13px', color: colors.muted }}>{suffix}</span> : null}
    </div>
  );
}

// Minimal vector icons matching gigwallet/apps/wallet/src/components/Icon.tsx
const ICONS = {
  wallet: 'M3 7h18v12H3zM3 7l3-3h12v3M16 13h2',
  inbox: 'M3 13l3-8h12l3 8v6H3zM3 13h5l1 2h6l1-2h5',
  share: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2z',
  me: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
  check: 'M5 12l5 5 9-10',
  x: 'M6 6l12 12M18 6L6 18',
  chevron: 'M9 6l6 6-6 6',
  copy: 'M8 4v12a2 2 0 002 2h8a2 2 0 002-2V8l-6-6H10a2 2 0 00-2 2z M4 8v12a2 2 0 002 2h10',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'
};

function Icon({ name, size = 22, color = colors.ink, stroke = 1.75 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', flexShrink: 0 }}
    >
      <path d={ICONS[name] || ICONS.wallet} />
    </svg>
  );
}

function Status({ kind, label, size = 'sm' }) {
  const c = kind === 'ok' ? colors.ok : colors.bad;
  const isLg = size === 'lg';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: isLg ? '8px' : '4px' }}>
      <Icon name={kind === 'ok' ? 'check' : 'x'} size={isLg ? 22 : 14} color={c} stroke={isLg ? 2.5 : 3} />
      <span style={{
        fontWeight: isLg ? 700 : 600,
        fontSize: isLg ? '20px' : '13px',
        color: c,
        lineHeight: isLg ? '26px' : '19px'
      }}>
        {label}
      </span>
    </div>
  );
}

function Dot({ on }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '6px',
        height: '6px',
        borderRadius: '3px',
        backgroundColor: on ? colors.ok : colors.muted,
        flexShrink: 0
      }}
    />
  );
}

function Panel({ children, style }) {
  return (
    <div style={{
      backgroundColor: colors.surface,
      border: `1px solid ${colors.line}`,
      borderRadius: '12px',
      overflow: 'hidden',
      ...style
    }}>
      {children}
    </div>
  );
}

function PanelRow({ children, borderBottom = true, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        borderBottom: borderBottom ? `1px solid ${colors.line}` : 'none',
        display: 'flex',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    >
      {children}
    </div>
  );
}

function Button({ label, onClick, variant = 'primary', disabled = false, fullWidth = true }) {
  const isSec = variant === 'secondary';
  const isDanger = variant === 'danger';

  let bg = colors.brand;
  let fg = colors.onBrand;
  let border = 'none';

  if (isSec) {
    bg = colors.surface;
    fg = colors.ink;
    border = `1px solid ${colors.lineStrong}`;
  } else if (isDanger) {
    bg = colors.bad;
    fg = '#FFFFFF';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: fullWidth ? '100%' : 'auto',
        height: isSec ? '48px' : '52px',
        backgroundColor: bg,
        color: fg,
        border,
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '15px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
        transition: 'all 0.1s ease',
        boxShadow: isSec ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
      }}
    >
      {label}
    </button>
  );
}

function shortDid(did) {
  if (!did) return '';
  if (did.length <= 24) return did;
  return `${did.slice(0, 16)}...${did.slice(-8)}`;
}

// Initial worker data matching gigwallet mock service
const INITIAL_SNAPSHOT = {
  holderName: 'Ramesh Kumar',
  did: 'did:key:z6MkrWorkerPublicKeyHexExampleW4pQ',
  revocationCheckedAt: '2 hours ago',
  reputation: {
    rating: 4.91,
    outOf: 5,
    totalTasks: 4660,
    safetyIncidents: 0,
    tier: 'Gold'
  },
  credentials: [
    {
      id: 'swiggy',
      initial: 'S',
      title: 'Swiggy delivery partner',
      subtitle: '4.92 rating · 3,240 deliveries',
      status: 'valid'
    },
    {
      id: 'uber',
      initial: 'U',
      title: 'Uber driver',
      subtitle: '4.88 rating · 1,420 trips',
      status: 'valid'
    },
    {
      id: 'nsdc',
      initial: 'N',
      title: 'Two-Wheeler Operations, Level 2',
      subtitle: 'Skill India (NSDC) · Distinction',
      status: 'valid'
    }
  ]
};

export default function App() {
  const [tab, setTab] = useState('wallet'); // 'wallet' | 'inbox' | 'share' | 'me' | 'verify'
  const [verifyScenario, setVerifyScenario] = useState('verified'); // 'verified' | 'rejected'
  const [picked, setPicked] = useState(['swiggy', 'uber', 'nsdc']);
  const [countdown, setCountdown] = useState(58);
  const [copied, setCopied] = useState(false);
  const [decided, setDecided] = useState(false);
  const [revokedCreds, setRevokedCreds] = useState(new Set());

  // 60-second QR countdown loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 60 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const togglePick = (id) => {
    setPicked((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  };

  const copyDid = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(INITIAL_SNAPSHOT.did);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleRevokeUber = () => {
    setRevokedCreds((prev) => {
      const next = new Set(prev);
      if (next.has('uber')) {
        next.delete('uber');
      } else {
        next.add('uber');
      }
      return next;
    });
  };

  const isUberRevoked = revokedCreds.has('uber');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Centered Phone Shell Container */}
      <div style={{
        width: '100%',
        maxWidth: tab === 'verify' ? '820px' : '480px',
        minHeight: '100vh',
        backgroundColor: colors.bg,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        
        {/* Main Scrollable Body */}
        <div style={{
          flex: 1,
          padding: '24px 20px',
          paddingBottom: tab === 'verify' ? '40px' : '100px'
        }}>
          {tab === 'wallet' && renderWalletScreen()}
          {tab === 'share' && renderShareScreen()}
          {tab === 'inbox' && renderInboxScreen()}
          {tab === 'me' && renderMeScreen()}
          {tab === 'verify' && renderVerifyScreen()}
        </div>

        {/* Pinned Bottom Navigation Tab Bar (hidden on standalone verifier inspect mode) */}
        {tab !== 'verify' && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 100
          }}>
            <nav style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: colors.surface,
              borderTop: `1px solid ${colors.line}`,
              display: 'flex',
              pointerEvents: 'auto',
              height: '64px',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)'
            }}>
              {[
                { id: 'wallet', label: 'Wallet', icon: 'wallet' },
                { id: 'inbox', label: 'Inbox', icon: 'inbox' },
                { id: 'share', label: 'Share', icon: 'share' },
                { id: 'me', label: 'Me', icon: 'me' }
              ].map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    aria-label={t.label}
                    style={{
                      flex: 1,
                      border: 'none',
                      backgroundColor: 'transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      color: active ? colors.brand : colors.muted
                    }}
                  >
                    <Icon name={t.icon} size={20} color={active ? colors.brand : colors.muted} stroke={active ? 2.2 : 1.75} />
                    <span style={{ fontSize: '12px', fontWeight: active ? 600 : 500 }}>{t.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </div>
  );

  /* TAB 1: WALLET HOME */
  function renderWalletScreen() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Brand />

        {/* Holder Identity */}
        <div style={{ marginTop: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: colors.ink, margin: 0 }}>
            {INITIAL_SNAPSHOT.holderName}
          </h1>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
            color: colors.muted,
            marginTop: '2px'
          }}>
            {shortDid(INITIAL_SNAPSHOT.did)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
            <Dot on={true} />
            <span style={{ fontSize: '13px', color: colors.muted }}>
              Online. Wallet is up to date.
            </span>
          </div>
        </div>

        {/* Combined Rating & Standing */}
        <div style={{ marginTop: '24px' }}>
          <span style={{ fontSize: '13px', color: colors.muted }}>Combined rating</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
            <span style={{ fontSize: '48px', fontWeight: 600, lineHeight: 1.1, color: colors.ink }}>
              {INITIAL_SNAPSHOT.reputation.rating.toFixed(2)}
            </span>
            <span style={{ fontSize: '13px', color: colors.muted }}>
              out of {INITIAL_SNAPSHOT.reputation.outOf}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: colors.muted, marginTop: '2px' }}>
            {INITIAL_SNAPSHOT.reputation.totalTasks.toLocaleString('en-IN')} completed tasks · no safety incidents
          </div>

          <div style={{
            marginTop: '14px',
            padding: '12px 14px',
            borderRadius: '10px',
            backgroundColor: colors.okTint
          }}>
            <span style={{ fontSize: '14px', lineHeight: '20px', color: colors.ok, fontWeight: 500 }}>
              You qualify for {INITIAL_SNAPSHOT.reputation.tier} tier at platforms that accept this wallet.
            </span>
          </div>
        </div>

        {/* Work History Panel */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, marginBottom: '8px' }}>
            Work history
          </div>
          <Panel>
            {INITIAL_SNAPSHOT.credentials.map((c, i) => {
              const isRevoked = c.id === 'uber' && isUberRevoked;
              return (
                <PanelRow
                  key={c.id}
                  borderBottom={i < INITIAL_SNAPSHOT.credentials.length - 1}
                  style={{ gap: '12px', minHeight: '64px' }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '18px',
                    backgroundColor: colors.avatar,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: colors.ink,
                    flexShrink: 0
                  }}>
                    {c.initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '13px', color: colors.muted }}>
                      {c.subtitle}
                    </div>
                  </div>
                  <Status kind={isRevoked ? 'bad' : 'ok'} label={isRevoked ? 'Revoked' : 'Verified'} />
                </PanelRow>
              );
            })}
          </Panel>
          <div style={{ fontSize: '13px', color: colors.muted, marginTop: '10px' }}>
            Revocation last checked {INITIAL_SNAPSHOT.revocationCheckedAt}
          </div>
        </div>

        {/* Primary CTA */}
        <div style={{ marginTop: '24px' }}>
          <Button label="Share my reputation" onClick={() => setTab('share')} />
        </div>
      </div>
    );
  }

  /* TAB 2: SHARE REPUTATION WITH DYNAMIC QR */
  function renderShareScreen() {
    const valid = INITIAL_SNAPSHOT.credentials;
    const qrPayload = `GW1:SAMPLE-${picked.join('-').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: colors.ink, margin: 0 }}>
          Share my reputation
        </h1>
        <p style={{ color: colors.muted, marginTop: '4px', fontSize: '14px' }}>
          Hold your phone up to the new platform's scanner.
        </p>

        {/* QR Code Container */}
        <div style={{
          marginTop: '16px',
          backgroundColor: colors.surface,
          border: `1px solid ${colors.line}`,
          borderRadius: '12px',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            padding: '12px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <QRCodeSVG
              value={qrPayload}
              size={210}
              level="M"
              fgColor="#111111"
              bgColor="#FFFFFF"
            />
          </div>
          <div style={{ fontSize: '14px', color: colors.muted }}>
            Code refreshes in{' '}
            <span style={{ fontWeight: 600, color: colors.ink }}>
              0:{countdown < 10 ? `0${countdown}` : countdown}
            </span>
          </div>
        </div>

        {/* Included Credentials Checklist */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, marginBottom: '8px' }}>
            Included
          </div>
          <Panel>
            {valid.map((c, i) => {
              const on = picked.includes(c.id);
              return (
                <PanelRow
                  key={c.id}
                  onClick={() => togglePick(c.id)}
                  borderBottom={i < valid.length - 1}
                  style={{ gap: '12px', minHeight: '52px' }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: on ? colors.brand : colors.surface,
                    border: on ? 'none' : `1.5px solid ${colors.lineStrong}`,
                    flexShrink: 0
                  }}>
                    {on && <Icon name="check" size={13} color="#FFFFFF" stroke={3} />}
                  </div>
                  <span style={{ fontSize: '15px', color: colors.ink }}>{c.title}</span>
                </PanelRow>
              );
            })}
          </Panel>
          <div style={{ fontSize: '13px', color: colors.muted, marginTop: '10px' }}>
            Shares your name, ratings, task counts and certificate. Nothing else.
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Button
            label="Refresh code"
            variant="secondary"
            onClick={() => setCountdown(60)}
          />
          <Button
            label="Simulate Platform Verifier Scan"
            onClick={() => {
              setVerifyScenario('verified');
              setTab('verify');
            }}
          />
        </div>
      </div>
    );
  }

  /* TAB 3: INBOX */
  function renderInboxScreen() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: colors.ink, margin: 0 }}>
          Inbox
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '32px 0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, margin: 0 }}>
            Nothing waiting
          </h2>
          <p style={{ fontSize: '14px', color: colors.muted, margin: 0 }}>
            When Swiggy, Uber or a skills authority sends you a credential, it will appear here for you to accept.
          </p>
        </div>
      </div>
    );
  }

  /* TAB 4: ME */
  function renderMeScreen() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: colors.ink, margin: 0 }}>
          Me
        </h1>

        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, marginBottom: '8px' }}>
            Your ID
          </div>
          <Panel>
            <PanelRow style={{ gap: '12px', minHeight: '56px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>
                  {INITIAL_SNAPSHOT.holderName}
                </div>
                <div style={{ fontSize: '13px', color: colors.muted, fontFamily: 'monospace' }}>
                  {shortDid(INITIAL_SNAPSHOT.did)}
                </div>
              </div>
            </PanelRow>
            <PanelRow
              onClick={copyDid}
              borderBottom={false}
              style={{ gap: '12px', minHeight: '56px', cursor: 'pointer' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>
                  {copied ? 'Copied to clipboard' : 'Copy my ID'}
                </div>
                <div style={{ fontSize: '13px', color: colors.muted }}>
                  Share this only with people you trust
                </div>
              </div>
              <Icon name="copy" size={18} color={colors.muted} />
            </PanelRow>
          </Panel>
        </div>

        {/* Verifier Preview Simulation */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, marginBottom: '8px' }}>
            Verifier preview
          </div>
          <Panel>
            <PanelRow
              onClick={() => {
                setVerifyScenario('verified');
                setTab('verify');
              }}
              style={{ gap: '12px', minHeight: '56px', cursor: 'pointer' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>
                  Verified result
                </div>
                <div style={{ fontSize: '13px', color: colors.muted }}>
                  What a new platform sees
                </div>
              </div>
              <Icon name="chevron" size={18} color={colors.muted} />
            </PanelRow>
            <PanelRow
              onClick={() => {
                setVerifyScenario('rejected');
                setTab('verify');
              }}
              borderBottom={false}
              style={{ gap: '12px', minHeight: '56px', cursor: 'pointer' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>
                  Rejected result
                </div>
                <div style={{ fontSize: '13px', color: colors.muted }}>
                  When a credential was altered or forged
                </div>
              </div>
              <Icon name="chevron" size={18} color={colors.muted} />
            </PanelRow>
          </Panel>
        </div>

        {/* Security Revocation Edge Case Test */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, marginBottom: '8px' }}>
            Issuance & Revocation Simulator
          </div>
          <Panel>
            <PanelRow borderBottom={false} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
              <div style={{ fontSize: '13px', color: colors.muted }}>
                Simulate an issuer (Uber) policy violation strike that revokes worker standing on-chain:
              </div>
              <Button
                label={isUberRevoked ? 'Restore Uber Credential' : 'Revoke Uber Credential (Simulate Strike)'}
                variant={isUberRevoked ? 'primary' : 'danger'}
                onClick={toggleRevokeUber}
              />
            </PanelRow>
          </Panel>
        </div>

        {/* App Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
          <StarMark size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>GigWallet</div>
            <div style={{ fontSize: '13px', color: colors.muted }}>
              Version 0.1.0. Your credentials stay on this phone.
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* SCREEN 5: VERIFIER RESULT (RESPONSIVE INSPECTION) */
  function renderVerifyScreen() {
    const isOk = verifyScenario === 'verified' && !isUberRevoked;

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Verifier Navigation Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: `1px solid ${colors.line}`,
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setTab('wallet')}
              aria-label="Back to wallet"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: `1px solid ${colors.line}`,
                backgroundColor: colors.surface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{ transform: 'rotate(180deg)' }}>
                <Icon name="chevron" size={16} />
              </div>
            </button>
            <Brand suffix="Verifier" />
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.brand }}>
            Zomato Partner Onboarding
          </div>
        </div>

        {/* Scenario Toggle */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          backgroundColor: colors.surface,
          padding: '4px',
          borderRadius: '10px',
          border: `1px solid ${colors.line}`
        }}>
          <button
            onClick={() => setVerifyScenario('verified')}
            style={{
              flex: 1,
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: verifyScenario === 'verified' ? colors.brand : 'transparent',
              color: verifyScenario === 'verified' ? colors.onBrand : colors.muted,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Authentic Presentation
          </button>
          <button
            onClick={() => setVerifyScenario('rejected')}
            style={{
              flex: 1,
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: verifyScenario === 'rejected' ? colors.bad : 'transparent',
              color: verifyScenario === 'rejected' ? '#FFFFFF' : colors.muted,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Tampered Presentation
          </button>
        </div>

        {/* Verification Summary Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 640 ? '280px 1fr' : '1fr',
          gap: '24px',
          alignItems: 'flex-start'
        }}>
          {/* Left Column: Verdict & Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Status
              kind={isOk ? 'ok' : 'bad'}
              label={isOk ? 'Verified' : 'Not verified'}
              size="lg"
            />
            <div style={{ fontSize: '13px', color: colors.muted, marginTop: '4px' }}>
              {isOk
                ? 'All four checks passed in 1.4 seconds.'
                : isUberRevoked
                ? 'One credential was revoked by the issuing authority.'
                : 'One credential was changed after the issuer signed it.'}
            </div>

            <div style={{ fontSize: '13px', color: colors.muted, marginTop: '24px' }}>Combined rating</div>
            <div style={{ fontSize: '44px', fontWeight: 600, color: colors.ink, lineHeight: 1.1 }}>
              {isOk ? '4.91' : '-'}
            </div>
            <div style={{ fontSize: '13px', color: colors.muted }}>
              {isOk ? 'out of 5 · 4,660 completed tasks · no safety incidents' : 'Cannot be calculated from an invalid record'}
            </div>

            <div style={{ fontSize: '13px', color: colors.muted, marginTop: '20px' }}>Recommended tier</div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink }}>
              {isOk ? 'Gold Partner' : 'Standard (no verified history)'}
            </div>

            <div style={{ marginTop: '20px' }}>
              {decided ? (
                <div style={{
                  padding: '12px',
                  backgroundColor: colors.okTint,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Status kind="ok" label="Marked for fast-track onboarding" />
                </div>
              ) : (
                <Button
                  label={isOk ? 'Fast-track as Gold Partner' : 'Reject and scan again'}
                  variant={isOk ? 'primary' : 'danger'}
                  onClick={() => (isOk ? setDecided(true) : setTab('wallet'))}
                />
              )}
            </div>

            <div style={{ fontSize: '12px', color: colors.muted, marginTop: '12px', lineHeight: 1.4 }}>
              Without this wallet, the worker would start at Standard tier with no history.
            </div>
          </div>

          {/* Right Column: Cryptographic Checks & Credentials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, marginBottom: '8px' }}>
                Cryptographic Checks
              </div>
              <Panel>
                {[
                  {
                    id: 'pres',
                    title: 'Presentation signature',
                    detail: 'The worker holds the Ed25519 private key for this identity.',
                    passed: true
                  },
                  {
                    id: 'iss',
                    title: 'Issuer signatures',
                    detail: isOk ? 'All 3 credentials signed by known platform DIDs.' : '1 credential signature failed verification.',
                    passed: isOk
                  },
                  {
                    id: 'val',
                    title: 'Dates and expiry',
                    detail: 'All within valid issuance timestamps.',
                    passed: true
                  },
                  {
                    id: 'rev',
                    title: 'Revocation status',
                    detail: !isUberRevoked ? 'None revoked. Central registry checked.' : 'Uber credential marked as REVOKED.',
                    passed: !isUberRevoked
                  }
                ].map((c, i) => (
                  <PanelRow
                    key={c.id}
                    borderBottom={i < 3}
                    style={{
                      justifyContent: 'space-between',
                      backgroundColor: !c.passed ? colors.badTint : 'transparent',
                      minHeight: '54px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: colors.ink }}>{c.title}</div>
                      <div style={{ fontSize: '12px', color: colors.muted }}>{c.detail}</div>
                    </div>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '13px',
                      color: c.passed ? colors.ok : colors.bad
                    }}>
                      {c.passed ? 'Passed' : 'Failed'}
                    </span>
                  </PanelRow>
                ))}
              </Panel>
            </div>

            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, marginBottom: '8px' }}>
                Credentials Presented
              </div>
              <Panel>
                {[
                  {
                    id: 'swiggy',
                    title: 'Swiggy · 3,240 deliveries',
                    detail: 'Rating 4.92 · Top Tier Partner',
                    valid: true
                  },
                  {
                    id: 'uber',
                    title: 'Uber · 1,420 trips',
                    detail: !isOk
                      ? 'Rating shown 5.00. Uber signed 4.88.'
                      : isUberRevoked
                      ? 'Status: Revoked by platform policy'
                      : 'Rating 4.88 · 0 safety incidents',
                    valid: isOk && !isUberRevoked
                  },
                  {
                    id: 'nsdc',
                    title: 'Skill India (NSDC)',
                    detail: 'Two-Wheeler Operations, Level 2',
                    valid: true
                  }
                ].map((c, i) => (
                  <PanelRow
                    key={c.id}
                    borderBottom={i < 2}
                    style={{
                      justifyContent: 'space-between',
                      backgroundColor: !c.valid ? colors.badTint : 'transparent',
                      minHeight: '54px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: colors.ink }}>{c.title}</div>
                      <div style={{ fontSize: '12px', color: colors.muted }}>{c.detail}</div>
                    </div>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '13px',
                      color: c.valid ? colors.ok : colors.bad
                    }}>
                      {c.valid ? 'Valid' : 'Altered'}
                    </span>
                  </PanelRow>
                ))}
              </Panel>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
