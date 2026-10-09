import React, { useState, useEffect, useMemo, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';

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
  zomato: '#E23744',
  zomatoTint: '#FDF0F0'
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
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  bell: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
  shareIos: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13',
  qr: 'M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM19 15h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z',
  camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
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

function Button({ label, onClick, variant = 'primary', disabled = false, fullWidth = true, size = 'md' }) {
  const isSec = variant === 'secondary';
  const isDanger = variant === 'danger';
  const isZomato = variant === 'zomato';

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
  } else if (isZomato) {
    bg = colors.zomato;
    fg = '#FFFFFF';
  }

  const height = size === 'sm' ? '38px' : isSec ? '48px' : '52px';
  const fontSize = size === 'sm' ? '13px' : '15px';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: fullWidth ? '100%' : 'auto',
        height,
        backgroundColor: bg,
        color: fg,
        border,
        borderRadius: '12px',
        fontWeight: 600,
        fontSize,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: size === 'sm' ? '0 14px' : '0 20px',
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

/**
 * Direct Live Camera & Image File QR Scanner using Html5Qrcode
 */
function CameraScanner({ onScanSuccess, onScanError }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [scanStatus, setScanStatus] = useState('Initializing camera viewfinder...');
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const scannerId = 'camera-video-scanner';

    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(scannerId);
        html5QrCodeRef.current = html5QrCode;

        const config = {
          fps: 20,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            return {
              width: Math.floor(minEdge * 0.75),
              height: Math.floor(minEdge * 0.75)
            };
          },
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (mounted && onScanSuccess) {
              onScanSuccess(decodedText);
            }
          },
          (err) => {
            if (mounted && onScanError) onScanError(err);
          }
        );

        if (mounted) {
          setCameraActive(true);
          setScanStatus('Camera active. Point at worker QR code.');
        }
      } catch (err) {
        console.warn('Camera stream failed or permission denied:', err);
        if (mounted) {
          setCameraActive(false);
          setScanStatus(
            err.name === 'NotAllowedError'
              ? 'Camera permission denied. Allow camera or upload a QR image below.'
              : 'Camera unavailable on this device. You can upload a photo or use the simulator.'
          );
        }
      }
    };

    const timer = setTimeout(startScanner, 150);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().then(() => {
              html5QrCodeRef.current.clear();
            }).catch(() => {});
          } else {
            html5QrCodeRef.current.clear();
          }
        } catch (_) {}
      }
    };
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('camera-file-scanner');
      const result = await html5QrCode.scanFile(file, true);
      if (onScanSuccess) {
        onScanSuccess(result);
      }
      html5QrCode.clear();
    } catch (err) {
      alert('Could not detect a QR code in the uploaded image. Please try another photo.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      {/* Viewfinder Frame */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '260px',
        backgroundColor: '#0A0A0A',
        borderRadius: '14px',
        overflow: 'hidden',
        border: `2px solid ${colors.brand}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div id="camera-video-scanner" style={{ width: '100%', height: '100%' }} />
        <div id="camera-file-scanner" style={{ display: 'none' }} />

        {/* Framing Guides Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '200px',
            height: '200px',
            border: `2.5px solid ${colors.ok}`,
            borderRadius: '16px',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)'
          }} />
        </div>
      </div>

      <div style={{
        fontSize: '12px',
        color: cameraActive ? colors.ok : colors.muted,
        textAlign: 'center',
        lineHeight: 1.4
      }}>
        {scanStatus}
      </div>

      {/* Upload QR Image Fallback Button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: colors.surface,
            border: `1px solid ${colors.lineStrong}`,
            color: colors.ink,
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Icon name="camera" size={16} color={colors.ink} />
          <span>Upload QR Image / Photo</span>
        </button>
      </div>
    </div>
  );
}

// Initial worker data matching gigwallet mock service
// Master Mock Credentials according to W3C Verifiable Credentials Standard
const CREDENTIAL_STORE = {
  swiggy: {
    id: 'urn:uuid:swiggy-vc-2026-99120',
    type: ['VerifiableCredential', 'GigDeliveryCredential'],
    issuer: 'did:key:z6MkuwSwiggyDeliveryIssuerDid2026',
    issuerName: 'Swiggy Delivery Partner Platform',
    issuanceDate: '2026-03-01T10:00:00Z',
    expirationDate: '2027-03-01T10:00:00Z',
    credentialSubject: {
      id: 'did:key:z6MkrWorkerRamesh2026Ed25519PublicAddress',
      platform: 'Swiggy',
      lifetimeDeliveries: 3240,
      averageRating: 4.92,
      onTimeDeliveryRate: '98.4%',
      tenureMonths: 26,
      standing: 'Top Tier Partner',
      badge: 'Gold Delivery Specialist'
    },
    proof: {
      type: 'Ed25519Signature2020',
      created: '2026-03-01T10:00:00Z',
      verificationMethod: 'did:key:z6MkuwSwiggyDeliveryIssuerDid2026#key-1',
      proofPurpose: 'assertionMethod',
      jws: 'eyJhbGciOiJFZERTQSI...SwiggyEd25519ValidSig'
    }
  },
  uber: {
    id: 'urn:uuid:uber-vc-2026-88410',
    type: ['VerifiableCredential', 'RideshareMobilityCredential'],
    issuer: 'did:key:z6MkuwUberDriverMobilityIssuerDid2026',
    issuerName: 'Uber Mobility Partner Fleet',
    issuanceDate: '2026-02-15T09:30:00Z',
    expirationDate: '2027-02-15T09:30:00Z',
    credentialSubject: {
      id: 'did:key:z6MkrWorkerRamesh2026Ed25519PublicAddress',
      platform: 'Uber',
      completedTrips: 1420,
      averageRating: 4.88,
      safetyIncidentCount: 0,
      tenureMonths: 14,
      standing: 'Diamond Driver',
      badge: 'Premier Safe Driver'
    },
    proof: {
      type: 'Ed25519Signature2020',
      created: '2026-02-15T09:30:00Z',
      verificationMethod: 'did:key:z6MkuwUberDriverMobilityIssuerDid2026#key-1',
      proofPurpose: 'assertionMethod',
      jws: 'eyJhbGciOiJFZERTQSI...UberEd25519ValidSig'
    }
  },
  nsdc: {
    id: 'urn:uuid:nsdc-vc-2026-77291',
    type: ['VerifiableCredential', 'GovernmentSkillCertification'],
    issuer: 'did:key:z6MkuwSkillIndiaGovtAuthorityDid2026',
    issuerName: 'National Skill Development Corporation (NSDC)',
    issuanceDate: '2025-11-20T14:15:00Z',
    expirationDate: '2028-11-20T14:15:00Z',
    credentialSubject: {
      id: 'did:key:z6MkrWorkerRamesh2026Ed25519PublicAddress',
      certifyingBody: 'National Skill Development Corporation',
      qualification: 'Commercial Two-Wheeler Operations and Road Safety Level 2',
      grade: 'Distinction',
      verificationStatus: 'Government Verified',
      certificateId: 'NSDC-2026-DL-77291'
    },
    proof: {
      type: 'Ed25519Signature2020',
      created: '2025-11-20T14:15:00Z',
      verificationMethod: 'did:key:z6MkuwSkillIndiaGovtAuthorityDid2026#key-1',
      proofPurpose: 'assertionMethod',
      jws: 'eyJhbGciOiJFZERTQSI...SkillIndiaGovtEd25519ValidSig'
    }
  }
};

/**
 * Compact, cryptographically signed Presentation payload that fits comfortably in standard QR limits (< 900 chars).
 */
/**
 * Ultra-compact Verifiable Presentation format (< 120 chars)
 * Designed for instantaneous detection by any phone camera or webcam lens.
 */
function createVerifiablePresentation(selectedKeys, isTampered = false) {
  const flags = selectedKeys.join(',');
  const tamperedFlag = isTampered ? '1' : '0';
  const nonce = Date.now().toString(36).slice(-6).toUpperCase();
  // Format: GW-VP:v1:<holderDidShort>:<selectedCreds>:<tampered>:<nonce>:<sig>
  const sig = isTampered ? 'ERR_SIG_FAIL' : 'OK_ED25519_VALID';
  return `GW-VP:v1:Ramesh:${flags}:${tamperedFlag}:${nonce}:${sig}`;
}

/**
 * Parses either the compact URI string (GW-VP:...) or raw JSON payload
 */
function parsePresentationPayload(rawString) {
  if (rawString.startsWith('GW-VP:v1:')) {
    const parts = rawString.split(':');
    const holder = parts[2] || 'Ramesh Kumar';
    const creds = (parts[3] || 'swiggy,uber,nsdc').split(',');
    const isTampered = parts[4] === '1';
    const nonce = parts[5] || 'VP-OK';
    return {
      holderName: holder === 'Ramesh' ? 'Ramesh Kumar' : holder,
      nonce: nonce,
      hasTamper: isTampered,
      credentials: creds
    };
  }

  // Fallback for JSON
  const parsed = JSON.parse(rawString);
  const hasTamper = parsed.proof?.sig === 'CORRUPT_VP_SIG' ||
    parsed.vcs?.some(v => v.sig === 'INVALID_TAMPERED');
  return {
    holderName: parsed.holderName || 'Ramesh Kumar',
    nonce: parsed.nonce || 'VP-VALID',
    hasTamper,
    credentials: parsed.vcs?.map(v => v.type) || ['swiggy', 'uber', 'nsdc']
  };
}

const INITIAL_SNAPSHOT = {
  holderName: 'Ramesh Kumar',
  did: 'did:key:z6MkrWorkerRamesh2026Ed25519PublicAddress',
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

  // Presentation QR Code Modal
  const [showQrModal, setShowQrModal] = useState(false);

  // QR Scanner Modal on Verifier Desk
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerMode, setScannerMode] = useState('camera'); // 'camera' | 'paste'
  const [scannerRawInput, setScannerRawInput] = useState('');
  const [scannerScanError, setScannerScanError] = useState('');
  const [lastScannedPayload, setLastScannedPayload] = useState(null);

  // PWA Install Prompt & Modal State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Zomato Inbox Verification Request State
  const [zomatoVerified, setZomatoVerified] = useState(false);

  // Capture PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const triggerPwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallModal(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallModal(true);
    }
  };

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

        {/* PWA Install Instructions Modal Popup */}
        {showInstallModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(28, 27, 25, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999
          }}
          onClick={() => setShowInstallModal(false)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '380px',
                backgroundColor: colors.surface,
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                border: `1px solid ${colors.line}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Brand size={32} />
                <button
                  onClick={() => setShowInstallModal(false)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.muted
                  }}
                >
                  <Icon name="x" size={18} color={colors.muted} />
                </button>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, margin: '0 0 4px' }}>
                  Install GigWallet App
                </h3>
                <p style={{ fontSize: '13px', color: colors.muted, margin: 0, lineHeight: 1.4 }}>
                  Install to remove the browser address bar, run fullscreen, and access your verifiable credentials offline.
                </p>
              </div>

              <div style={{
                backgroundColor: colors.bg,
                padding: '14px',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '12px',
                    backgroundColor: colors.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: colors.brand,
                    flexShrink: 0,
                    border: `1px solid ${colors.line}`
                  }}>
                    1
                  </div>
                  <div style={{ fontSize: '12px', color: colors.ink, lineHeight: 1.4 }}>
                    Tap the browser menu <strong>(⋮)</strong> or iOS Share icon <Icon name="shareIos" size={14} color={colors.ink} stroke={2} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '12px',
                    backgroundColor: colors.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: colors.brand,
                    flexShrink: 0,
                    border: `1px solid ${colors.line}`
                  }}>
                    2
                  </div>
                  <div style={{ fontSize: '12px', color: colors.ink, lineHeight: 1.4 }}>
                    Select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '12px',
                    backgroundColor: colors.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: colors.brand,
                    flexShrink: 0,
                    border: `1px solid ${colors.line}`
                  }}>
                    3
                  </div>
                  <div style={{ fontSize: '12px', color: colors.ink, lineHeight: 1.4 }}>
                    Launch from your Home Screen for a clean, distraction-free app experience.
                  </div>
                </div>
              </div>

              <Button
                label="Got it"
                onClick={() => setShowInstallModal(false)}
              />
            </div>
          </div>
        )}

        {/* FULLSCREEN / POPUP PRESENTATION QR CODE MODAL */}
        {showQrModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(28, 27, 25, 0.65)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 9999
            }}
            onClick={() => setShowQrModal(false)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: colors.surface,
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
                border: `1px solid ${colors.line}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                alignItems: 'center',
                textAlign: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                <Brand size={26} suffix="QR Present" />
                <button
                  onClick={() => setShowQrModal(false)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: colors.muted
                  }}
                >
                  <Icon name="x" size={20} color={colors.muted} />
                </button>
              </div>

              <div>
                <h3 style={{ fontSize: '19px', fontWeight: 700, color: colors.ink, margin: '0 0 4px' }}>
                  Verifiable Presentation
                </h3>
                <p style={{ fontSize: '13px', color: colors.muted, margin: 0 }}>
                  Show this signed cryptographic QR to the onboarding verifier desk.
                </p>
              </div>

              {/* High Contrast QR Code with Quiet Zone */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '16px',
                  borderRadius: '14px',
                  border: `2px solid ${colors.lineStrong}`,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <QRCodeSVG
                  value={createVerifiablePresentation(picked, verifyScenario === 'rejected')}
                  size={240}
                  level="L"
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.muted }}>
                <Dot on={true} />
                <span>Expires in <strong style={{ color: colors.ink }}>0:{countdown < 10 ? `0${countdown}` : countdown}</strong> (auto-rotates nonce)</span>
              </div>

              <div style={{
                width: '100%',
                backgroundColor: colors.bg,
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                color: colors.muted,
                textAlign: 'left'
              }}>
                <div style={{ fontWeight: 600, color: colors.ink, marginBottom: '2px' }}>Included Credentials:</div>
                {picked.map(p => (
                  <span key={p} style={{
                    display: 'inline-block',
                    marginRight: '6px',
                    padding: '2px 8px',
                    backgroundColor: colors.surface,
                    borderRadius: '4px',
                    border: `1px solid ${colors.line}`,
                    fontWeight: 500,
                    fontSize: '11px',
                    color: colors.brand
                  }}>
                    {p.toUpperCase()}
                  </span>
                ))}
              </div>

              <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                <Button
                  label="Refresh"
                  variant="secondary"
                  onClick={() => setCountdown(60)}
                />
                <Button
                  label="Open Verifier Desk"
                  onClick={() => {
                    setShowQrModal(false);
                    setTab('verify');
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* VERIFIER QR SCANNER MODAL */}
        {showScannerModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(28, 27, 25, 0.65)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 9999
            }}
            onClick={() => setShowScannerModal(false)}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '480px',
                backgroundColor: colors.surface,
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
                border: `1px solid ${colors.line}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="camera" size={20} color={colors.brand} />
                  <span style={{ fontWeight: 700, fontSize: '16px', color: colors.ink }}>Scan Worker QR Code</span>
                </div>
                <button
                  onClick={() => setShowScannerModal(false)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: colors.muted
                  }}
                >
                  <Icon name="x" size={20} color={colors.muted} />
                </button>
              </div>

              <p style={{ fontSize: '13px', color: colors.muted, margin: 0, lineHeight: 1.4 }}>
                Point the platform camera at the worker's GigWallet QR code or paste the raw Verifiable Presentation payload below.
              </p>

              {/* Scanner Mode Toggle: Camera vs Manual/Simulator */}
              <div style={{
                display: 'flex',
                gap: '6px',
                backgroundColor: colors.bg,
                padding: '4px',
                borderRadius: '8px'
              }}>
                <button
                  onClick={() => setScannerMode('camera')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: scannerMode === 'camera' ? colors.surface : 'transparent',
                    color: scannerMode === 'camera' ? colors.brand : colors.muted,
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: scannerMode === 'camera' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  Live Camera Scanner
                </button>
                <button
                  onClick={() => setScannerMode('paste')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: scannerMode === 'paste' ? colors.surface : 'transparent',
                    color: scannerMode === 'paste' ? colors.brand : colors.muted,
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: scannerMode === 'paste' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  Simulator / Paste Payload
                </button>
              </div>

              {/* LIVE CAMERA SCANNER VIEW */}
              {scannerMode === 'camera' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    backgroundColor: '#000000',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: `2px solid ${colors.brand}`
                  }}>
                    <CameraScanner
                      onScanSuccess={(decodedText) => {
                        try {
                          const result = parsePresentationPayload(decodedText);
                          setLastScannedPayload(result);
                          setVerifyScenario(result.hasTamper ? 'rejected' : 'verified');
                          setShowScannerModal(false);
                        } catch (err) {
                          setScannerRawInput(decodedText);
                          setScannerMode('paste');
                          setScannerScanError('Payload detected but could not be parsed: ' + err.message);
                        }
                      }}
                      onScanError={() => {}}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: colors.muted, textAlign: 'center' }}>
                    Point camera directly at the QR code displayed on the worker phone or screen
                  </span>
                </div>
              ) : (
                /* SIMULATOR & PASTE VIEW */
                <>
                  <div style={{
                    backgroundColor: colors.bg,
                    padding: '12px',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: colors.muted }}>Instant Scanner Simulator:</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          const payload = createVerifiablePresentation(['swiggy', 'uber', 'nsdc'], false);
                          setScannerRawInput(payload);
                          setLastScannedPayload(parsePresentationPayload(payload));
                          setVerifyScenario('verified');
                          setShowScannerModal(false);
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: colors.okTint,
                          border: `1px solid ${colors.ok}`,
                          color: colors.ok,
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Simulate Valid Scan
                      </button>
                      <button
                        onClick={() => {
                          const payload = createVerifiablePresentation(['swiggy', 'uber', 'nsdc'], true);
                          setScannerRawInput(payload);
                          setLastScannedPayload(parsePresentationPayload(payload));
                          setVerifyScenario('rejected');
                          setShowScannerModal(false);
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: colors.badTint,
                          border: `1px solid ${colors.bad}`,
                          color: colors.bad,
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Simulate Tampered Scan
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: colors.ink }}>
                      Raw QR Payload:
                    </label>
                    <textarea
                      value={scannerRawInput}
                      onChange={(e) => {
                        setScannerRawInput(e.target.value);
                        setScannerScanError('');
                      }}
                      placeholder="Paste VP URI string or JSON payload..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: `1px solid ${colors.line}`,
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '11px',
                        color: colors.ink,
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                    {scannerScanError && (
                      <span style={{ fontSize: '12px', color: colors.bad, fontWeight: 500 }}>
                        {scannerScanError}
                      </span>
                    )}
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  label="Close"
                  variant="secondary"
                  onClick={() => setShowScannerModal(false)}
                />
                {scannerMode === 'paste' && (
                  <Button
                    label="Verify Payload"
                    onClick={() => {
                      try {
                        if (!scannerRawInput.trim()) {
                          setScannerScanError('Please paste or scan a QR payload first.');
                          return;
                        }
                        const result = parsePresentationPayload(scannerRawInput.trim());
                        setLastScannedPayload(result);
                        setVerifyScenario(result.hasTamper ? 'rejected' : 'verified');
                        setShowScannerModal(false);
                      } catch (err) {
                        setScannerScanError('Invalid payload format: ' + err.message);
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
        
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
                { id: 'inbox', label: 'Inbox', icon: 'inbox', badge: !zomatoVerified },
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
                      color: active ? colors.brand : colors.muted,
                      position: 'relative'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <Icon name={t.icon} size={20} color={active ? colors.brand : colors.muted} stroke={active ? 2.2 : 1.75} />
                      {t.badge && (
                        <span style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-6px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: colors.zomato
                        }} />
                      )}
                    </div>
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
        {/* Header with Brand Logo & PWA Install Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Brand />
          {!isInstalled && (
            <button
              onClick={triggerPwaInstall}
              title="Install App as PWA"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: colors.surface,
                border: `1px solid ${colors.line}`,
                color: colors.brand,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
            >
              <Icon name="download" size={14} color={colors.brand} stroke={2.2} />
              <span>Install PWA</span>
            </button>
          )}
        </div>

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

        {/* Primary CTAs */}
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Button
            label="Present QR Code"
            onClick={() => setShowQrModal(true)}
          />
          <Button
            label="Share my reputation (Customize)"
            variant="secondary"
            onClick={() => setTab('share')}
          />
        </div>
      </div>
    );
  }

  /* TAB 2: SHARE REPUTATION WITH DYNAMIC QR */
  function renderShareScreen() {
    const valid = INITIAL_SNAPSHOT.credentials;
    const vpPayload = createVerifiablePresentation(picked, verifyScenario === 'rejected');

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
            padding: '14px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: `1px solid ${colors.lineStrong}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <QRCodeSVG
              value={vpPayload}
              size={210}
              level="L"
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
            label="Fullscreen Presenter QR"
            onClick={() => setShowQrModal(true)}
          />
          <Button
            label="Refresh code"
            variant="secondary"
            onClick={() => setCountdown(60)}
          />
          <Button
            label="Scan on Verifier Desk"
            variant="secondary"
            onClick={() => {
              setVerifyScenario('verified');
              setTab('verify');
            }}
          />
        </div>
      </div>
    );
  }

  /* TAB 3: INBOX WITH ZOMATO VERIFICATION REQUEST */
  function renderInboxScreen() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: colors.ink, margin: 0 }}>
          Inbox
        </h1>

        {/* Zomato Incoming Request Card */}
        <div style={{ marginTop: '16px' }}>
          <Panel>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: colors.zomato,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '18px'
                  }}>
                    Z
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>
                      Zomato Partner Onboarding
                    </div>
                    <div style={{ fontSize: '12px', color: colors.muted }}>
                      Verification Request · 5 mins ago
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: zomatoVerified ? colors.okTint : colors.zomatoTint,
                  color: zomatoVerified ? colors.ok : colors.zomato
                }}>
                  {zomatoVerified ? 'Verified' : 'Action Required'}
                </span>
              </div>

              <div style={{ fontSize: '14px', color: colors.ink, lineHeight: 1.5 }}>
                {zomatoVerified
                  ? 'Your reputation credentials have been successfully verified! You are fast-tracked into Zomato Gold Fleet with zero probation.'
                  : 'Zomato is requesting verification of your delivery track record and government skill certificate to fast-track your partner onboarding.'}
              </div>

              <div style={{
                backgroundColor: colors.bg,
                padding: '10px 12px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ fontSize: '12px', color: colors.muted, fontWeight: 500 }}>Requested Credentials:</div>
                <div style={{ fontSize: '12px', color: colors.ink, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Dot on={true} /> Swiggy Delivery Reputation (3,240 deliveries)
                </div>
                <div style={{ fontSize: '12px', color: colors.ink, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Dot on={true} /> NSDC Two-Wheeler Level 2 Certificate
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <Button
                  label={zomatoVerified ? "View Verification Report" : "Verify for Zomato"}
                  variant={zomatoVerified ? "secondary" : "zomato"}
                  size="sm"
                  onClick={() => {
                    setVerifyScenario('verified');
                    setZomatoVerified(true);
                    setTab('verify');
                  }}
                />
              </div>
            </div>
          </Panel>
        </div>

        {/* Additional empty state explanation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '24px 0' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: colors.muted, margin: 0 }}>
            No other pending requests
          </h2>
          <p style={{ fontSize: '13px', color: colors.muted, margin: 0 }}>
            Incoming credential transfers and platform verification audits will show up here.
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
              onClick={() => setTab('inbox')}
              aria-label="Back to inbox"
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
          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.zomato, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.zomato }} />
            Zomato Onboarding
          </div>
        </div>

        {/* Scan QR Button & Verification Controls */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setScannerScanError('');
                setShowScannerModal(true);
              }}
              style={{
                flex: 1,
                height: '44px',
                borderRadius: '10px',
                backgroundColor: colors.brand,
                color: colors.onBrand,
                border: 'none',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
              }}
            >
              <Icon name="camera" size={18} color="#FFFFFF" />
              <span>Scan Worker QR / Camera</span>
            </button>
            <button
              onClick={() => {
                // Instantly re-verify current wallet selection
                const payload = createVerifiablePresentation(picked, false);
                setLastScannedPayload(JSON.parse(payload));
                setVerifyScenario('verified');
              }}
              title="Quick scan from current device wallet"
              style={{
                padding: '0 16px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: colors.surface,
                color: colors.brand,
                border: `1.5px solid ${colors.brand}`,
                fontWeight: 600,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              Scan Active Wallet
            </button>
          </div>

          {lastScannedPayload && (
            <div style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.line}`,
              borderRadius: '8px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px'
            }}>
              <span style={{ color: colors.muted }}>
                Scanned Holder: <strong style={{ color: colors.ink }}>{lastScannedPayload.holderName || 'Ramesh Kumar'}</strong>
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                color: colors.brand,
                backgroundColor: colors.bg,
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                Nonce: {lastScannedPayload.nonce || 'VP-VALID'}
              </span>
            </div>
          )}
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
                ? 'All four cryptographic checks passed in 1.4 seconds.'
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
                  <Status kind="ok" label="Fast-track onboarding approved!" />
                </div>
              ) : (
                <Button
                  label={isOk ? 'Fast-track as Zomato Gold Partner' : 'Reject and scan again'}
                  variant={isOk ? 'primary' : 'danger'}
                  onClick={() => (isOk ? setDecided(true) : setTab('wallet'))}
                />
              )}
            </div>

            <div style={{ fontSize: '12px', color: colors.muted, marginTop: '12px', lineHeight: 1.4 }}>
              Without this wallet, the worker would start at Standard probationary tier with 0 reputation.
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
