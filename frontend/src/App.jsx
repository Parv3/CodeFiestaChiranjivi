import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  Smartphone,
  Building2,
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Star,
  Layers,
  Check,
  Eye,
  FileCode,
  Copy,
  Users,
  Clock,
  Wifi,
  BatteryCharging,
  Globe,
  Award,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Lock,
  RefreshCw
} from 'lucide-react';

// Indian Gig Worker Personas
const PERSONAS = {
  ramesh: {
    id: 'ramesh',
    name: 'Ramesh Kumar',
    nameHi: 'रमेश कुमार',
    role: 'Delivery & Mobility Partner',
    roleHi: 'डिलीवरी और मोबिलिटी पार्टनर',
    city: 'Bengaluru, KA',
    did: 'did:key:z6MkrWorkerRamesh2026Ed25519Address',
    avatar: 'RK',
    joinedYear: '2023',
    credentials: [
      {
        id: 'urn:uuid:swiggy-rep-982134',
        type: ['VerifiableCredential', 'DeliveryReputationCredential'],
        platformId: 'swiggy',
        platformName: 'Swiggy Delivery Partner',
        partnerId: 'SWG-BLR-9821',
        brandColor: '#fc8019',
        badgeTitle: 'Top Tier Partner',
        badgeTitleHi: 'शीर्ष स्तरीय पार्टनर',
        issuanceDate: '15 Mar 2026',
        credentialSubject: {
          platform: 'Swiggy',
          lifetimeDeliveries: 3240,
          averageRating: 4.92,
          onTimeDeliveryRate: '98.4%',
          tenureMonths: 26,
          standing: 'Top Tier Partner'
        },
        proof: {
          type: 'Ed25519Signature2020',
          created: '2026-03-15T10:00:00Z',
          verificationMethod: 'did:key:z6MkuwSwiggyDeliveryIssuerDid2026#key-1',
          proofValue: 'z3mX9kSwiggyTamperproofEd25519ProofValueDemo987'
        }
      },
      {
        id: 'urn:uuid:uber-rep-551029',
        type: ['VerifiableCredential', 'MobilityReputationCredential'],
        platformId: 'uber',
        platformName: 'Uber Driver Fleet',
        partnerId: 'UBR-KA-5510',
        brandColor: '#000000',
        badgeTitle: 'Diamond Pro Driver',
        badgeTitleHi: 'डायमंड प्रो ड्राइवर',
        issuanceDate: '20 Mar 2026',
        credentialSubject: {
          platform: 'Uber',
          completedTrips: 1420,
          averageRating: 4.88,
          safetyIncidentCount: 0,
          tenureMonths: 14,
          standing: 'Diamond Driver'
        },
        proof: {
          type: 'Ed25519Signature2020',
          created: '2026-03-20T14:30:00Z',
          verificationMethod: 'did:key:z6MkuwUberDriverMobilityIssuerDid2026#key-1',
          proofValue: 'z7pB2qUberMobilityTamperproofProofValueDemo441'
        }
      },
      {
        id: 'urn:uuid:nsdc-cert-118274',
        type: ['VerifiableCredential', 'SkillCertificationCredential'],
        platformId: 'nsdc',
        platformName: 'Skill India / NSDC',
        partnerId: 'NSDC-IND-7729',
        brandColor: '#2563eb',
        badgeTitle: 'Govt Certified Rider (L2)',
        badgeTitleHi: 'सरकारी प्रमाणित राइडर',
        issuanceDate: '10 Jan 2026',
        credentialSubject: {
          certifyingBody: 'National Skill Development Corporation',
          qualification: 'Commercial Two-Wheeler Operations Level 2',
          grade: 'Distinction',
          verificationStatus: 'Government Verified'
        },
        proof: {
          type: 'Ed25519Signature2020',
          created: '2026-01-10T09:00:00Z',
          verificationMethod: 'did:key:z6MkuwSkillIndiaGovtAuthorityDid2026#key-1',
          proofValue: 'z9kL4rGovtSkillIndiaTamperproofProofValueDemo2026'
        }
      }
    ]
  },
  anita: {
    id: 'anita',
    name: 'Anita Sharma',
    nameHi: 'अनिता शर्मा',
    role: 'Delivery Associate',
    roleHi: 'डिलीवरी एसोसिएट',
    city: 'New Delhi, DL',
    did: 'did:key:z6MkrWorkerAnitaJunior2026Address',
    avatar: 'AS',
    joinedYear: '2026',
    credentials: [
      {
        id: 'urn:uuid:swiggy-rep-110294',
        type: ['VerifiableCredential', 'DeliveryReputationCredential'],
        platformId: 'swiggy',
        platformName: 'Swiggy Delivery Partner',
        partnerId: 'SWG-DEL-1102',
        brandColor: '#fc8019',
        badgeTitle: 'Probationary Partner',
        badgeTitleHi: 'प्रशिक्षु पार्टनर',
        issuanceDate: '01 Mar 2026',
        credentialSubject: {
          platform: 'Swiggy',
          lifetimeDeliveries: 160,
          averageRating: 4.74,
          onTimeDeliveryRate: '92.0%',
          tenureMonths: 2,
          standing: 'Probationary Partner'
        },
        proof: {
          type: 'Ed25519Signature2020',
          created: '2026-03-01T10:00:00Z',
          verificationMethod: 'did:key:z6MkuwSwiggyDeliveryIssuerDid2026#key-1',
          proofValue: 'z4mAnitaSwiggySignature992'
        }
      }
    ]
  }
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('demo');
  const [currentPersonaId, setCurrentPersonaId] = useState('ramesh');
  const [selectedForDisclosure, setSelectedForDisclosure] = useState(
    new Set(['urn:uuid:swiggy-rep-982134', 'urn:uuid:uber-rep-551029', 'urn:uuid:nsdc-cert-118274'])
  );
  const [revokedIds, setRevokedIds] = useState(new Set());
  const [tamperMode, setTamperMode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [inspectedCred, setInspectedCred] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrSecondsLeft, setQrSecondsLeft] = useState(45);
  const [copiedProof, setCopiedProof] = useState(false);

  const persona = PERSONAS[currentPersonaId] || PERSONAS.ramesh;
  const userCredentials = persona.credentials;
  const disclosedCredentials = userCredentials.filter(c => selectedForDisclosure.has(c.id));

  // Accessibility (UI/UX Pro Max Priority 1): Keyboard Escape listener to close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setQrModalOpen(false);
        setInspectedCred(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Countdown timer for QR expiration simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setQrSecondsLeft(prev => (prev <= 1 ? 45 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute composite metrics
  const totalTasks = disclosedCredentials.reduce((sum, c) => {
    return sum + (c.credentialSubject.lifetimeDeliveries || 0) + (c.credentialSubject.completedTrips || 0);
  }, 0);

  const ratingCreds = disclosedCredentials.filter(c => c.credentialSubject.averageRating);
  const avgRating = ratingCreds.length > 0
    ? (ratingCreds.reduce((sum, c) => sum + c.credentialSubject.averageRating, 0) / ratingCreds.length).toFixed(2)
    : '0.00';

  const toggleDisclosure = (id) => {
    setSelectedForDisclosure(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const buildPresentationPayload = () => {
    let credsToPresent = JSON.parse(JSON.stringify(disclosedCredentials));
    if (tamperMode && credsToPresent.length > 0) {
      credsToPresent[0].credentialSubject.averageRating = 5.0;
      credsToPresent[0].credentialSubject.tampered = true;
    }

    return {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      holder: persona.did,
      verifiableCredential: credsToPresent,
      proof: {
        type: 'Ed25519Signature2020',
        created: new Date().toISOString(),
        verificationMethod: `${persona.did}#key-1`,
        proofValue: 'zHolderSignedVPProof' + Date.now()
      }
    };
  };

  const handleVerify = () => {
    setVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      if (tamperMode) {
        setVerificationResult({
          valid: false,
          error: 'Signature Mismatch: Swiggy Credential payload was modified without valid issuer private key.',
          checks: [
            { name: 'Holder Presentation Signature (did:key)', pass: true },
            { name: 'Swiggy Delivery Credential Proof', pass: false, error: 'Signature Mismatch (Data Tampered)' },
            { name: 'Revocation Registry Check', pass: true }
          ]
        });
        setVerifying(false);
        return;
      }

      const revokedItem = disclosedCredentials.find(c => revokedIds.has(c.id));
      if (revokedItem) {
        setVerificationResult({
          valid: false,
          error: `Revocation Flag: Credential from ${revokedItem.platformName} was revoked on the central registry.`,
          checks: [
            { name: 'Holder Presentation Signature', pass: true },
            { name: 'Issuer Signature Validity', pass: true },
            { name: 'Revocation Registry Check', pass: false, error: 'Status: REVOKED by Platform Issuer' }
          ]
        });
        setVerifying(false);
        return;
      }

      const isGold = totalTasks >= 2000 && Number(avgRating) >= 4.85;
      const isSilver = totalTasks >= 100;

      setVerificationResult({
        valid: true,
        holderName: persona.name,
        holderDid: persona.did,
        totalTasks: totalTasks,
        compositeRating: avgRating,
        tier: isGold ? 'Gold Tier Partner (Fast-Tracked)' : isSilver ? 'Silver Tier (Standard Onboarding)' : 'Probationary Tier',
        depositWaived: isGold ? '₹5,000 Waived' : '₹2,500 Standard',
        probationWaived: isGold,
        checks: [
          { name: `Holder Presentation Signature (${persona.did.slice(0, 14)}...)`, pass: true },
          ...disclosedCredentials.map(c => ({
            name: `${c.platformName} (Ed25519)`,
            pass: true
          })),
          { name: 'Revocation Registry Check (Active status)', pass: true }
        ]
      });
      setVerifying(false);
    }, 800);
  };

  const toggleRevoke = (id) => {
    setRevokedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyProofToClipboard = () => {
    if (inspectedCred) {
      navigator.clipboard.writeText(JSON.stringify(inspectedCred, null, 2));
      setCopiedProof(true);
      setTimeout(() => setCopiedProof(false), 2000);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)', paddingBottom: '60px' }}>
      {/* Top Application Header */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '12px 20px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo & Platform Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '18px'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '17px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>GigPass</span>
                <span style={{ fontSize: '11px', background: 'rgba(37,99,235,0.15)', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(37,99,235,0.3)' }}>
                  W3C VC &bull; PWA
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                {lang === 'hi' ? 'गिग वर्कर प्रतिष्ठा वॉलेट' : 'Decentralized Worker Reputation Wallet'}
              </p>
            </div>
          </div>

          {/* Right Controls: Persona Switcher, Language & Tab Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              aria-label="Toggle language between English and Hindi"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              <Globe size={14} /> {lang === 'en' ? 'हिन्दी' : 'English'}
            </button>

            {/* Persona Switcher Dropdown */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.05)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}>
              <Users size={14} color="var(--text-muted)" />
              <select
                aria-label="Select worker persona for demonstration"
                value={currentPersonaId}
                onChange={(e) => {
                  setCurrentPersonaId(e.target.value);
                  setVerificationResult(null);
                  if (e.target.value === 'ramesh') {
                    setSelectedForDisclosure(new Set(['urn:uuid:swiggy-rep-982134', 'urn:uuid:uber-rep-551029', 'urn:uuid:nsdc-cert-118274']));
                  } else {
                    setSelectedForDisclosure(new Set(['urn:uuid:swiggy-rep-110294']));
                  }
                }}
                style={{
                  background: 'transparent',
                  color: '#fff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ramesh" style={{ background: '#10131d' }}>Ramesh (Gold Pro &bull; 4.9★)</option>
                <option value="anita" style={{ background: '#10131d' }}>Anita (Junior &bull; 160 Orders)</option>
              </select>
            </div>

            {/* Mode Switcher */}
            <nav aria-label="Main view switcher" style={{ display: 'flex', gap: '4px', background: 'var(--bg-app)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              {[
                { id: 'demo', label: 'Split Demo', icon: Layers },
                { id: 'wallet', label: 'Mobile PWA', icon: Smartphone },
                { id: 'verifier', label: 'Verifier Desk', icon: ScanLine },
                { id: 'issuers', label: 'Issuers', icon: Building2 }
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    aria-label={`Switch to ${tab.label} view`}
                    aria-pressed={active}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: active ? '#2563eb' : 'transparent',
                      color: active ? '#fff' : 'var(--text-muted)'
                    }}
                  >
                    <Icon size={14} /> {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main App Content Area */}
      <main style={{ maxWidth: '1280px', margin: '24px auto 0', padding: '0 20px' }}>
        {/* VIEW 1: DUAL SCREEN HACKATHON DEMO */}
        {activeTab === 'demo' && (
          <div>
            {/* Operational Banner */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '12px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {lang === 'hi'
                    ? 'लाइव पोर्टेबल प्रतिष्ठा प्रदर्शन: वर्कर का फोन (बाएं) और प्लेटफॉर्म ऑनबोर्डिंग डेस्क (दाएं)'
                    : 'Live Portable Reputation Demo: Worker PWA (Left) & Platform Onboarding Desk (Right)'}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                W3C DID: did:key Ed25519
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(330px, 420px) 1fr', gap: '28px', alignItems: 'start' }}>
              <div>{renderPhonePWA()}</div>
              <div>{renderVerifierDesk()}</div>
            </div>
          </div>
        )}

        {/* VIEW 2: STANDALONE MOBILE PWA VIEW */}
        {activeTab === 'wallet' && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
              {renderPhonePWA()}
            </div>
          </div>
        )}

        {/* VIEW 3: VERIFIER DESK */}
        {activeTab === 'verifier' && renderVerifierDesk()}

        {/* VIEW 4: MOCK ISSUER PLATFORMS */}
        {activeTab === 'issuers' && renderIssuerPortals()}
      </main>

      {/* MODAL 1: FULLSCREEN PRESENTATION QR MODAL */}
      {qrModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          onClick={() => setQrModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div
            className="modal-animate"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: '20px',
              maxWidth: '380px',
              width: '100%',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <h3 id="qr-modal-title" style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>
              {lang === 'hi' ? 'ऑनबोर्डिंग सत्यापन QR कोड' : 'Onboarding Presentation QR'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 18px' }}>
              {lang === 'hi'
                ? 'नया नियोक्ता इस QR कोड को स्कैन करके प्रतिष्ठा सत्यापित कर सकता है'
                : 'Present this QR code to the onboarding desk at Zomato / Porter'}
            </p>

            <div style={{
              background: '#fff',
              padding: '16px',
              borderRadius: '16px',
              display: 'inline-block',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              marginBottom: '16px'
            }}>
              <QRCodeSVG
                value={JSON.stringify(buildPresentationPayload())}
                size={210}
                level="L"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-success)', fontWeight: 600 }}>
              <Clock size={14} />
              <span>{lang === 'hi' ? `सुरक्षा टाइमर: ${qrSecondsLeft}s में ताज़ा` : `Refreshes in ${qrSecondsLeft}s for security`}</span>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '12px 0 20px' }}>
              Includes {disclosedCredentials.length} cryptographically signed credentials. Press Esc to close.
            </p>

            <button
              onClick={() => setQrModalOpen(false)}
              aria-label="Close QR presentation modal"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: '#2563eb',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700
              }}
            >
              {lang === 'hi' ? 'बंद करें' : 'Close QR Code'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: RAW W3C PROOF INSPECTOR (UI/UX Pro Max Priority 1 & 8) */}
      {inspectedCred && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="proof-modal-title"
          onClick={() => setInspectedCred(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div
            className="modal-animate"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCode size={20} color="#2563eb" />
                <h3 id="proof-modal-title" style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#fff' }}>
                  W3C Verifiable Credential Structure
                </h3>
              </div>
              <button
                onClick={() => setInspectedCred(null)}
                aria-label="Close proof inspection dialog"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '22px',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                &times;
              </button>
            </div>

            <div style={{
              background: 'var(--bg-surface-sunken)',
              padding: '16px',
              borderRadius: '10px',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#38bdf8',
              overflowX: 'auto',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px'
            }}>
              <pre>{JSON.stringify(inspectedCred, null, 2)}</pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={copyProofToClipboard}
                aria-label="Copy canonical JSON to clipboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                {copiedProof ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                {copiedProof ? 'Copied to Clipboard!' : 'Copy Raw JSON'}
              </button>

              <button
                onClick={() => setInspectedCred(null)}
                aria-label="Close dialog"
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#2563eb',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* SUB-RENDERER: PHONE PWA SHELL (UI/UX Pro Max Priority 2 & 5) */
  function renderPhonePWA() {
    return (
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: '32px',
        border: '6px solid #202434',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        overflow: 'hidden'
      }}>
        {/* Realistic Mobile Status Bar */}
        <div style={{
          height: '28px',
          background: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-muted)'
        }}>
          <span>12:45 IST</span>
          <div style={{ width: '60px', height: '4px', background: '#202434', borderRadius: '4px' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wifi size={12} />
            <BatteryCharging size={12} />
          </div>
        </div>

        {/* Phone Body */}
        <div style={{ padding: '16px' }}>
          {/* Worker Identity Card */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '15px',
                  color: '#fff'
                }}>
                  {persona.avatar}
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#fff' }}>
                    {lang === 'hi' ? persona.nameHi : persona.name}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '1px 0 0' }}>
                    {lang === 'hi' ? persona.roleHi : persona.role} &bull; {persona.city}
                  </p>
                </div>
              </div>

              <span style={{
                background: 'rgba(16,185,129,0.1)',
                color: 'var(--color-success)',
                border: '1px solid rgba(16,185,129,0.25)',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                DID ACTIVE
              </span>
            </div>

            {/* Core Metrics Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              background: 'var(--bg-surface-sunken)',
              padding: '10px',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {lang === 'hi' ? 'रेटिंग' : 'Rating'}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                  <Star size={12} fill="#fbbf24" /> {avgRating}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {lang === 'hi' ? 'कुल कार्य' : 'Total Tasks'}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>
                  {totalTasks.toLocaleString()}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {lang === 'hi' ? 'प्रमाणित' : 'Passes'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-success)', marginTop: '2px' }}>
                  {disclosedCredentials.length} VCs
                </div>
              </div>
            </div>
          </div>

          {/* Selective Disclosure Credentials List */}
          <div style={{ textAlign: 'left', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {lang === 'hi' ? 'सत्यापित साख पत्र (प्रकटीकरण चुनें)' : 'Verified Credentials (Select to Disclose)'}
              </span>
              <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>
                {disclosedCredentials.length} / {userCredentials.length} Selected
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {userCredentials.map(c => {
                const isSelected = selectedForDisclosure.has(c.id);
                const isRevoked = revokedIds.has(c.id);
                return (
                  <div
                    key={c.id}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: isRevoked ? '2px solid var(--color-danger)' : isSelected ? '1px solid rgba(37,99,235,0.4)' : '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '12px',
                      opacity: isSelected ? 1 : 0.5,
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Accessible Touch Checkbox (UI/UX Pro Max Priority 1 & 2) */}
                        <button
                          onClick={() => toggleDisclosure(c.id)}
                          aria-label={`Toggle selective disclosure for ${c.platformName}`}
                          aria-checked={isSelected}
                          style={{
                            width: '28px',
                            height: '28px',
                            minHeight: '28px',
                            borderRadius: '6px',
                            border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.3)',
                            background: isSelected ? '#2563eb' : 'transparent',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          {isSelected && <Check size={16} />}
                        </button>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.brandColor }}></span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                              {c.platformName}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            ID: {c.partnerId} &bull; {lang === 'hi' ? c.badgeTitleHi : c.badgeTitle}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setInspectedCred(c)}
                        aria-label={`Inspect cryptographic proof for ${c.platformName}`}
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          color: 'var(--text-secondary)',
                          fontSize: '11px',
                          padding: '6px 10px',
                          minHeight: '32px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Proof
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '38px' }}>
                      {c.credentialSubject.lifetimeDeliveries && <span><strong>{c.credentialSubject.lifetimeDeliveries}</strong> Orders</span>}
                      {c.credentialSubject.completedTrips && <span><strong>{c.credentialSubject.completedTrips}</strong> Trips</span>}
                      {c.credentialSubject.averageRating && <span><strong>{c.credentialSubject.averageRating}★</strong> Rating</span>}
                      {c.credentialSubject.grade && <span>Grade: <strong>{c.credentialSubject.grade}</strong></span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Present QR Button */}
          <button
            onClick={() => setQrModalOpen(true)}
            aria-label="Generate and display presentation QR code"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: '#2563eb',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
              cursor: 'pointer'
            }}
          >
            <QrCode size={18} />
            {lang === 'hi' ? 'सत्यापन के लिए QR दिखाएं' : 'Present Reputation QR Code'}
          </button>
        </div>
      </div>
    );
  }

  /* SUB-RENDERER: ONBOARDING VERIFIER DESK */
  function renderVerifierDesk() {
    return (
      <div style={{
        background: 'var(--bg-surface)',
        borderRadius: '20px',
        border: '1px solid var(--border-subtle)',
        padding: '24px',
        textAlign: 'left'
      }}>
        {/* Terminal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="#2563eb" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#fff' }}>
                Zomato / Porter Fleet Onboarding Terminal
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Enterprise W3C Decentralized Credential Scanner
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Tamper Simulation Toggle */}
            <button
              onClick={() => {
                setTamperMode(!tamperMode);
                setVerificationResult(null);
              }}
              aria-label="Simulate forged or altered credential payload"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: tamperMode ? 'var(--color-danger)' : 'var(--border-subtle)',
                background: tamperMode ? 'rgba(239,68,68,0.15)' : 'transparent',
                color: tamperMode ? '#fca5a5' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <AlertTriangle size={14} />
              {tamperMode ? 'Tamper Active (Altered 5.0★)' : 'Simulate Forgery'}
            </button>

            {/* Scan / Verify Button */}
            <button
              onClick={handleVerify}
              disabled={verifying}
              aria-label="Verify presented credential signatures and status"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'var(--color-success)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <ScanLine size={16} />
              {verifying ? 'Verifying...' : 'Scan & Verify QR'}
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {verifying && (
          <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: '36px 0' }}>
            <div className="spin-slow" style={{
              display: 'inline-block',
              width: '32px',
              height: '32px',
              border: '3px solid rgba(37,99,235,0.2)',
              borderTopColor: '#2563eb',
              borderRadius: '50%'
            }} />
            <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
              Executing Ed25519 cryptographic proof verification...
            </p>
          </div>
        )}

        {/* Verification Result Display */}
        {verificationResult && (
          <div role="region" aria-live="polite">
            {/* SUCCESS STATE */}
            {verificationResult.valid ? (
              <div>
                <div style={{
                  background: 'rgba(16,185,129,0.06)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: '14px',
                  padding: '18px',
                  marginBottom: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={24} color="var(--color-success)" />
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--color-success)' }}>
                          Verified Gig Worker Identity
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                          Candidate: {verificationResult.holderName} &bull; {verificationResult.holderDid.slice(0, 18)}...
                        </p>
                      </div>
                    </div>

                    <span style={{
                      background: 'var(--color-success)',
                      color: '#064e3b',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '12px'
                    }}>
                      PASSED (ALL PROOFS)
                    </span>
                  </div>

                  {/* Trust Scorecard */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    background: 'var(--bg-surface-sunken)',
                    padding: '12px',
                    borderRadius: '10px',
                    marginBottom: '14px'
                  }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOTAL TASKS</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                        {verificationResult.totalTasks.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '10px', color: '#34d399' }}>Verified Delivery Volume</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CROSS-PLATFORM RATING</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#fbbf24' }}>
                        {verificationResult.compositeRating} &#9733;
                      </div>
                      <div style={{ fontSize: '10px', color: '#34d399' }}>Top Tier Bracket</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SECURITY DEPOSIT</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#60a5fa', marginTop: '3px' }}>
                        {verificationResult.depositWaived}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Based on Past Track Record</div>
                    </div>
                  </div>

                  {/* Decision Box */}
                  <div style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid rgba(37,99,235,0.3)',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#93c5fd', fontWeight: 800, textTransform: 'uppercase' }}>
                        ONBOARDING STATUS
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                        {verificationResult.tier}
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#93c5fd', background: 'rgba(37,99,235,0.2)', padding: '5px 10px', borderRadius: '6px', fontWeight: 700 }}>
                      {verificationResult.probationWaived ? 'Probation Waived & Priority Dispatch' : 'Standard 30-Day Evaluation'}
                    </span>
                  </div>
                </div>

                {/* Audit trail */}
                <h5 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Cryptographic Verification Trail
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {verificationResult.checks.map((chk, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '6px',
                      fontSize: '11px'
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{chk.name}</span>
                      <span style={{ color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* FAILURE STATE */
              <div style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '14px',
                padding: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <XCircle size={26} color="var(--color-danger)" />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--color-danger)' }}>
                      Verification Rejected: Cryptographic Integrity Failure
                    </h4>
                    <p style={{ fontSize: '12px', color: '#fca5a5', margin: '3px 0 0' }}>
                      {verificationResult.error}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                  {verificationResult.checks.map((chk, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-surface-sunken)',
                      borderRadius: '6px',
                      fontSize: '11px'
                    }}>
                      <span style={{ color: chk.pass ? 'var(--text-secondary)' : '#fca5a5' }}>{chk.name}</span>
                      <span style={{ color: chk.pass ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                        {chk.pass ? 'Verified' : (chk.error || 'Failed')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!verificationResult && !verifying && (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-dim)' }}>
            <ScanLine size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ fontSize: '13px' }}>Click "Scan & Verify QR" to inspect the presentation payload.</p>
          </div>
        )}
      </div>
    );
  }

  /* SUB-RENDERER: MOCK ISSUER PORTALS */
  function renderIssuerPortals() {
    return (
      <div>
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: '#fff' }}>
            Platform Issuance Portals
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Platforms sign and issue verifiable credentials to workers. They can also revoke credentials on the central registry.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {/* Swiggy */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--brand-swiggy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>
                S
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#fff' }}>Swiggy Delivery Partner</h4>
                <span style={{ fontSize: '10px', color: 'var(--brand-swiggy)', fontFamily: 'monospace' }}>did:key:z6MkuwSwiggy...</span>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Issues verifiable food & grocery delivery performance records (3,240 deliveries, 4.92★ rating).
            </p>
            <div style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 600 }}>Active in Wallet</div>
          </div>

          {/* Uber */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#000', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>
                U
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#fff' }}>Uber Mobility Fleet</h4>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>did:key:z6MkuwUber...</span>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Issues rideshare records (1,420 trips, 4.88★, Diamond standing). Test revocation below:
            </p>
            <button
              onClick={() => toggleRevoke('urn:uuid:uber-rep-551029')}
              aria-label="Toggle Uber credential revocation status"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: revokedIds.has('urn:uuid:uber-rep-551029') ? 'var(--color-danger)' : 'var(--text-dim)',
                background: revokedIds.has('urn:uuid:uber-rep-551029') ? 'var(--color-danger)' : 'rgba(255,255,255,0.04)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {revokedIds.has('urn:uuid:uber-rep-551029') ? 'Revoked (Click to Restore)' : 'Revoke Credential (Simulate Policy Strike)'}
            </button>
          </div>

          {/* NSDC Skill India */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--brand-nsdc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>
                SI
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#fff' }}>NSDC / Skill India</h4>
                <span style={{ fontSize: '10px', color: '#60a5fa', fontFamily: 'monospace' }}>did:key:z6MkuwSkillIndia...</span>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Issues government skill competency certification (Two-Wheeler Operations Level 2, Distinction).
            </p>
            <div style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 600 }}>Government Verified</div>
          </div>
        </div>
      </div>
    );
  }
}
