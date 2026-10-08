import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  Award,
  Smartphone,
  Building2,
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  QrCode,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock,
  UserCheck,
  Star,
  Layers,
  ArrowRight
} from 'lucide-react';

const API_BASE = 'http://localhost:4000/api';

// Initial pre-configured credentials for smooth out-of-the-box demo
const DEFAULT_CREDENTIALS = [
  {
    id: 'urn:uuid:swiggy-rep-982134',
    type: ['VerifiableCredential', 'DeliveryReputationCredential'],
    issuer: 'did:key:z6MkuwSwiggyDeliveryIssuerDid2026',
    issuerName: 'Swiggy Delivery Partner Platform',
    issuanceDate: '2026-03-15T10:00:00Z',
    theme: {
      bg: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
      accent: '#fb923c',
      label: 'Food Delivery Partner'
    },
    credentialSubject: {
      workerName: 'Ramesh Kumar',
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
      proofPurpose: 'assertionMethod',
      proofValue: 'z3mX9kSwiggyTamperproofEd25519ProofValueDemo987'
    }
  },
  {
    id: 'urn:uuid:uber-rep-551029',
    type: ['VerifiableCredential', 'MobilityReputationCredential'],
    issuer: 'did:key:z6MkuwUberDriverMobilityIssuerDid2026',
    issuerName: 'Uber Mobility Partner Fleet',
    issuanceDate: '2026-03-20T14:30:00Z',
    theme: {
      bg: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
      accent: '#a1a1aa',
      label: 'Rideshare Mobility Partner'
    },
    credentialSubject: {
      workerName: 'Ramesh Kumar',
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
      proofPurpose: 'assertionMethod',
      proofValue: 'z7pB2qUberMobilityTamperproofProofValueDemo441'
    }
  },
  {
    id: 'urn:uuid:nsdc-cert-118274',
    type: ['VerifiableCredential', 'SkillCertificationCredential'],
    issuer: 'did:key:z6MkuwSkillIndiaGovtAuthorityDid2026',
    issuerName: 'National Skill Development Corporation (NSDC)',
    issuanceDate: '2026-01-10T09:00:00Z',
    theme: {
      bg: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
      accent: '#60a5fa',
      label: 'Government Skill Certificate'
    },
    credentialSubject: {
      workerName: 'Ramesh Kumar',
      certifyingBody: 'National Skill Development Corporation',
      qualification: 'Commercial Two-Wheeler Operations and Road Safety Level 2',
      grade: 'Distinction',
      verificationStatus: 'Government Verified'
    },
    proof: {
      type: 'Ed25519Signature2020',
      created: '2026-01-10T09:00:00Z',
      verificationMethod: 'did:key:z6MkuwSkillIndiaGovtAuthorityDid2026#key-1',
      proofPurpose: 'assertionMethod',
      proofValue: 'z9kL4rGovtSkillIndiaTamperproofProofValueDemo2026'
    }
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('demo');
  const [credentials, setCredentials] = useState(DEFAULT_CREDENTIALS);
  const [revokedIds, setRevokedIds] = useState(new Set());
  const [tamperMode, setTamperMode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  // Computed composite metrics
  const totalTasks = credentials.reduce((sum, c) => {
    return sum + (c.credentialSubject.lifetimeDeliveries || 0) + (c.credentialSubject.completedTrips || 0);
  }, 0);

  const avgRating = (
    credentials.reduce((sum, c) => sum + (c.credentialSubject.averageRating || 0), 0) /
    (credentials.filter(c => c.credentialSubject.averageRating).length || 1)
  ).toFixed(2);

  // Generate Verifiable Presentation payload
  const buildPresentationPayload = () => {
    let credsToPresent = JSON.parse(JSON.stringify(credentials));
    if (tamperMode && credsToPresent.length > 0) {
      // Simulate tampering by altering the first credential's rating without re-signing
      credsToPresent[0].credentialSubject.averageRating = 5.0;
      credsToPresent[0].credentialSubject.tampered = true;
    }

    return {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      holder: 'did:key:z6MkrWorkerRamesh2026Ed25519Address',
      verifiableCredential: credsToPresent,
      proof: {
        type: 'Ed25519Signature2020',
        created: new Date().toISOString(),
        verificationMethod: 'did:key:z6MkrWorkerRamesh2026Ed25519Address#key-1',
        proofValue: 'zWorkerDynamicSignatureValue' + Date.now()
      }
    };
  };

  const handleVerify = () => {
    setVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      // Verification logic against cryptographic rules and revocation list
      if (tamperMode) {
        setVerificationResult({
          valid: false,
          error: 'Cryptographic Signature Mismatch: Swiggy Credential payload altered without valid private key signature.',
          checks: [
            { name: 'Holder Presentation Signature', pass: true },
            { name: 'Swiggy Delivery Credential Proof', pass: false, error: 'Signature invalid (tampered)' },
            { name: 'Uber Mobility Credential Proof', pass: true },
            { name: 'NSDC Skill India Credential Proof', pass: true },
            { name: 'Revocation Registry Status', pass: true }
          ]
        });
        setVerifying(false);
        return;
      }

      // Check if any credential is in revoked set
      const revokedCred = credentials.find(c => revokedIds.has(c.id));
      if (revokedCred) {
        setVerificationResult({
          valid: false,
          error: `Revocation Flag: Credential from ${revokedCred.issuerName} has been revoked by issuer on central registry.`,
          checks: [
            { name: 'Holder Presentation Signature', pass: true },
            { name: 'Swiggy Delivery Credential Proof', pass: true },
            { name: 'Uber Mobility Credential Proof', pass: !revokedIds.has('urn:uuid:uber-rep-551029') },
            { name: 'NSDC Skill India Credential Proof', pass: true },
            { name: 'Revocation Registry Status', pass: false, error: 'Revoked by Platform Issuer' }
          ]
        });
        setVerifying(false);
        return;
      }

      // Clean successful verification
      setVerificationResult({
        valid: true,
        holderName: 'Ramesh Kumar',
        totalTasks: totalTasks,
        compositeRating: avgRating,
        standing: 'Gold Tier Partner (Fast-Tracked)',
        checks: [
          { name: 'Holder Presentation Signature (did:key)', pass: true },
          { name: 'Swiggy Delivery Credential (Ed25519)', pass: true },
          { name: 'Uber Mobility Credential (Ed25519)', pass: true },
          { name: 'NSDC Skill India Credential (Ed25519)', pass: true },
          { name: 'Revocation Registry (Active status)', pass: true }
        ]
      });
      setVerifying(false);
    }, 900);
  };

  const toggleRevoke = (id) => {
    setRevokedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b10', color: '#f8fafc', paddingBottom: '40px' }}>
      {/* Top Navbar */}
      <header style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(18,20,30,0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#fff', textAlign: 'left' }}>GigPass</h1>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, textAlign: 'left' }}>
                Portable Worker Reputation & Credential Wallet
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '12px' }}>
            {[
              { id: 'demo', label: 'Split-Screen Demo', icon: Layers },
              { id: 'wallet', label: 'Worker Wallet', icon: Smartphone },
              { id: 'issuers', label: 'Mock Issuers', icon: Building2 },
              { id: 'verifier', label: 'Platform Verifier', icon: ScanLine }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: isActive ? '#6366f1' : 'transparent',
                    color: isActive ? '#fff' : '#94a3b8',
                    transition: 'all 0.15s'
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', margin: '32px auto 0', padding: '0 24px' }}>
        {/* VIEW 1: SPLIT SCREEN DEMO */}
        {activeTab === 'demo' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '20px',
                fontSize: '13px',
                color: '#a5b4fc',
                marginBottom: '12px'
              }}>
                <Sparkles size={14} /> Live Cross-Platform Decentralized Reputation Flow
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>
                From Trapped Reputation to Instant Onboarding
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '720px', margin: '0 auto' }}>
                Worker Ramesh presents his cross-platform portfolio via dynamic QR code. The new platform scans, verifies W3C cryptographic proofs, and fast-tracks him to Gold Tier in under two seconds.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '32px', alignItems: 'start' }}>
              {/* Left Column: Worker Mobile App View */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Worker Phone Screen
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>W3C Verifiable Presentation</span>
                </div>
                {renderWalletPhone()}
              </div>

              {/* Right Column: Platform Verifier View */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    New Platform Onboarding Desk (e.g. Zomato / Porter)
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Ed25519 Signature Verifier</span>
                </div>
                {renderVerifierPortal()}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: FULL WALLET VIEW */}
        {activeTab === 'wallet' && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>
              {renderWalletPhone()}
            </div>
          </div>
        )}

        {/* VIEW 3: MOCK ISSUERS VIEW */}
        {activeTab === 'issuers' && renderIssuersPage()}

        {/* VIEW 4: PLATFORM VERIFIER VIEW */}
        {activeTab === 'verifier' && renderVerifierPortal()}
      </main>
    </div>
  );

  /* SUB-RENDERER: WORKER MOBILE WALLET PHONE */
  function renderWalletPhone() {
    return (
      <div style={{
        background: '#12141e',
        borderRadius: '36px',
        border: '8px solid #232738',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        {/* Notch / Speaker */}
        <div style={{ height: '24px', background: '#12141e', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '4px', background: '#232738', borderRadius: '4px' }} />
        </div>

        {/* Phone Content */}
        <div style={{ padding: '20px 20px 28px' }}>
          {/* Worker Identity Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '20px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '18px',
                color: '#fff'
              }}>
                RK
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#fff' }}>Ramesh Kumar</h3>
                <p style={{ fontSize: '11px', color: '#a5b4fc', margin: '2px 0 0', fontFamily: 'monospace' }}>
                  did:key:z6MkrWorkerRamesh2026...
                </p>
              </div>
            </div>

            {/* Composite Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              background: 'rgba(0,0,0,0.3)',
              padding: '10px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>RATING</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <Star size={13} fill="#fbbf24" /> {avgRating}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>TASKS</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{totalTasks.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>STATUS</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>Top Tier</div>
              </div>
            </div>
          </div>

          {/* Credentials Stack */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>Verified Credentials ({credentials.length})</span>
              <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> W3C Signed
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {credentials.map(c => {
                const isRevoked = revokedIds.has(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCard(selectedCard === c.id ? null : c.id)}
                    style={{
                      background: c.theme.bg,
                      borderRadius: '14px',
                      padding: '14px',
                      cursor: 'pointer',
                      border: isRevoked ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                      position: 'relative',
                      textAlign: 'left'
                    }}
                  >
                    {isRevoked && (
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        REVOKED
                      </span>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
                          {c.theme.label}
                        </span>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '2px 0 0', color: '#fff' }}>
                          {c.issuerName}
                        </h4>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.9)' }}>
                      {c.credentialSubject.lifetimeDeliveries && (
                        <span><strong>{c.credentialSubject.lifetimeDeliveries}</strong> Deliveries</span>
                      )}
                      {c.credentialSubject.completedTrips && (
                        <span><strong>{c.credentialSubject.completedTrips}</strong> Trips</span>
                      )}
                      {c.credentialSubject.averageRating && (
                        <span><strong>{c.credentialSubject.averageRating}★</strong> Rating</span>
                      )}
                      {c.credentialSubject.grade && (
                        <span>Grade: <strong>{c.credentialSubject.grade}</strong></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Presentation QR Code Box */}
          <div style={{
            background: '#1a1d2d',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
              <QrCode size={16} color="#6366f1" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>Dynamic Presentation QR</span>
            </div>

            <div style={{
              background: '#fff',
              padding: '12px',
              borderRadius: '12px',
              display: 'inline-block',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
            }}>
              <QRCodeSVG
                value={JSON.stringify(buildPresentationPayload())}
                size={160}
                level="L"
              />
            </div>

            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '10px 0 0' }}>
              Presents all {credentials.length} credentials with an Ed25519 holder signature.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* SUB-RENDERER: PLATFORM VERIFIER ONBOARDING PORTAL */
  function renderVerifierPortal() {
    return (
      <div style={{
        background: '#12141e',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '24px',
        textAlign: 'left'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#fff' }}>
              Zomato / Porter Partner Onboarding
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
              Automated W3C Verifiable Credential Verification Terminal
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Tamper Simulation Toggle */}
            <button
              onClick={() => {
                setTamperMode(!tamperMode);
                setVerificationResult(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: tamperMode ? '#ef4444' : 'rgba(255,255,255,0.15)',
                background: tamperMode ? 'rgba(239,68,68,0.15)' : 'transparent',
                color: tamperMode ? '#fca5a5' : '#94a3b8',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <AlertTriangle size={14} />
              {tamperMode ? 'Tamper Active (Forged 5.0★)' : 'Simulate Tamper'}
            </button>

            {/* Scan / Verify Button */}
            <button
              onClick={handleVerify}
              disabled={verifying}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
              }}
            >
              <ScanLine size={16} />
              {verifying ? 'Scanning & Verifying...' : 'Scan & Verify QR'}
            </button>
          </div>
        </div>

        {/* Verification Pipeline Checks */}
        {verifying && (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <div style={{
              display: 'inline-block',
              width: '36px',
              height: '36px',
              border: '3px solid rgba(99,102,241,0.2)',
              borderTopColor: '#6366f1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ marginTop: '12px', fontSize: '13px', color: '#94a3b8' }}>
              Resolving Issuer DIDs and verifying cryptographic signatures...
            </p>
          </div>
        )}

        {/* Verification Result Display */}
        {verificationResult && (
          <div>
            {/* SUCCESS STATE */}
            {verificationResult.valid ? (
              <div>
                <div style={{
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle2 size={24} color="#10b981" />
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#10b981' }}>
                          Verified Authentic Worker Identity
                        </h4>
                        <p style={{ fontSize: '12px', color: '#a7f3d0', margin: '2px 0 0' }}>
                          Candidate: {verificationResult.holderName}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      background: '#10b981',
                      color: '#064e3b',
                      fontSize: '12px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '20px'
                    }}>
                      PASSED (5/5 CHECKS)
                    </span>
                  </div>

                  {/* Trust Assessment Scorecard */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    background: 'rgba(0,0,0,0.25)',
                    padding: '14px',
                    borderRadius: '12px',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>VERIFIED TOTAL TASKS</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                        {verificationResult.totalTasks.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#34d399' }}>Swiggy + Uber Combined</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>CROSS-PLATFORM RATING</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#fbbf24' }}>
                        {verificationResult.compositeRating} / 5.0
                      </div>
                      <div style={{ fontSize: '11px', color: '#34d399' }}>Top 5% Delivery Tier</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>GOVERNMENT CERTIFIED</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#60a5fa' }}>
                        NSDC Level 2
                      </div>
                      <div style={{ fontSize: '11px', color: '#34d399' }}>Road Safety Distinction</div>
                    </div>
                  </div>

                  {/* Recommendation Callout */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(217,119,6,0.15) 100%)',
                    border: '1px solid rgba(245,158,11,0.4)',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#fcd34d', fontWeight: 700, textTransform: 'uppercase' }}>
                        AUTOMATED ONBOARDING DECISION
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                        {verificationResult.standing}
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#fef08a', background: 'rgba(245,158,11,0.2)', padding: '4px 8px', borderRadius: '6px' }}>
                      Skip 30-Day Probation
                    </span>
                  </div>
                </div>

                {/* Individual Cryptographic Audit Trail */}
                <h5 style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
                  Cryptographic Audit Trail
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {verificationResult.checks.map((chk, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}>
                      <span style={{ color: '#cbd5e1' }}>{chk.name}</span>
                      <span style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} /> Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* FAILED / TAMPERED / REVOKED STATE */
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '16px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <XCircle size={28} color="#ef4444" />
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#ef4444' }}>
                      Verification Failed: Security Threat Detected
                    </h4>
                    <p style={{ fontSize: '12px', color: '#fca5a5', margin: '4px 0 0' }}>
                      {verificationResult.error}
                    </p>
                  </div>
                </div>

                {/* Check list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '14px' }}>
                  {verificationResult.checks.map((chk, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}>
                      <span style={{ color: chk.pass ? '#cbd5e1' : '#fca5a5' }}>{chk.name}</span>
                      <span style={{ color: chk.pass ? '#10b981' : '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {chk.pass ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
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
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            <ScanLine size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
            <p style={{ fontSize: '14px' }}>Click "Scan & Verify QR" to inspect the worker presentation payload.</p>
          </div>
        )}
      </div>
    );
  }

  /* SUB-RENDERER: MOCK ISSUER PORTALS PAGE */
  function renderIssuersPage() {
    return (
      <div>
        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px', color: '#fff' }}>
            Trusted Issuer Platforms
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            These portals represent existing platforms that cryptographically sign and issue reputation credentials to workers upon request.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Swiggy Card */}
          <div style={{
            background: '#12141e',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '20px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                S
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#fff' }}>Swiggy Partner Platform</h3>
                <span style={{ fontSize: '11px', color: '#ea580c' }}>did:key:z6MkuwSwiggyDeliveryIssuer...</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
              Issues food & grocery delivery performance records (3,240 deliveries, 4.92★ rating, 98.4% on-time).
            </p>

            <button
              onClick={() => alert('Swiggy Credential already issued and active in wallet')}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(234,88,12,0.4)',
                background: 'rgba(234,88,12,0.15)',
                color: '#fb923c',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              Credential Active in Wallet
            </button>
          </div>

          {/* Uber Card */}
          <div style={{
            background: '#12141e',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '20px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                U
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#fff' }}>Uber Mobility Fleet</h3>
                <span style={{ fontSize: '11px', color: '#a1a1aa' }}>did:key:z6MkuwUberDriverMobility...</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
              Issues rideshare mobility records (1,420 completed trips, 4.88★ rating, Diamond standing).
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => toggleRevoke('urn:uuid:uber-rep-551029')}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: revokedIds.has('urn:uuid:uber-rep-551029') ? '#ef4444' : '#71717a',
                  background: revokedIds.has('urn:uuid:uber-rep-551029') ? '#ef4444' : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                {revokedIds.has('urn:uuid:uber-rep-551029') ? 'Revoked (Click to Restore)' : 'Revoke Credential (Demo)'}
              </button>
            </div>
          </div>

          {/* NSDC Skill India Card */}
          <div style={{
            background: '#12141e',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '20px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                SI
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#fff' }}>NSDC / Skill India</h3>
                <span style={{ fontSize: '11px', color: '#60a5fa' }}>did:key:z6MkuwSkillIndiaGovt...</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
              Issues government skill competency certification (Two-Wheeler Operations Level 2, Distinction).
            </p>

            <button
              onClick={() => alert('NSDC Government Skill Credential is verified')}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(96,165,250,0.4)',
                background: 'rgba(30,64,175,0.2)',
                color: '#93c5fd',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              Government Verified
            </button>
          </div>
        </div>
      </div>
    );
  }
}
