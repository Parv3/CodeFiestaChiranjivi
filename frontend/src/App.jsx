import React, { useState } from 'react';
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
  QrCode,
  Sparkles,
  Lock,
  Star,
  Layers,
  Check,
  Eye,
  FileCode,
  Download,
  Users,
  ChevronDown
} from 'lucide-react';

// Pre-configured Worker Personas for live judging demonstration
const PERSONAS = {
  ramesh: {
    id: 'ramesh',
    name: 'Ramesh Kumar',
    phone: '+91 98765 43210',
    did: 'did:key:z6MkrWorkerRamesh2026Ed25519Address',
    avatar: 'RK',
    credentials: [
      {
        id: 'urn:uuid:swiggy-rep-982134',
        type: ['VerifiableCredential', 'DeliveryReputationCredential'],
        issuer: 'did:key:z6MkuwSwiggyDeliveryIssuerDid2026',
        issuerName: 'Swiggy Delivery Platform',
        theme: {
          bg: 'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)',
          accent: '#fb923c',
          label: 'Food Delivery Specialist'
        },
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
        issuer: 'did:key:z6MkuwUberDriverMobilityIssuerDid2026',
        issuerName: 'Uber Mobility Fleet',
        theme: {
          bg: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
          accent: '#a1a1aa',
          label: 'Rideshare Mobility Partner'
        },
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
        issuer: 'did:key:z6MkuwSkillIndiaGovtAuthorityDid2026',
        issuerName: 'NSDC / Skill India',
        theme: {
          bg: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
          accent: '#60a5fa',
          label: 'Government Skill Certificate'
        },
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
    phone: '+91 91234 56789',
    did: 'did:key:z6MkrWorkerAnitaJunior2026Address',
    avatar: 'AS',
    credentials: [
      {
        id: 'urn:uuid:swiggy-rep-110294',
        type: ['VerifiableCredential', 'DeliveryReputationCredential'],
        issuer: 'did:key:z6MkuwSwiggyDeliveryIssuerDid2026',
        issuerName: 'Swiggy Delivery Platform',
        theme: {
          bg: 'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)',
          accent: '#fb923c',
          label: 'New Delivery Partner'
        },
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

  const persona = PERSONAS[currentPersonaId] || PERSONAS.ramesh;
  const userCredentials = persona.credentials;

  // Filtered credentials based on selective disclosure
  const disclosedCredentials = userCredentials.filter(c => selectedForDisclosure.has(c.id));

  // Compute composite metrics for disclosed credentials
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
      // 1. Tamper detection check
      if (tamperMode) {
        setVerificationResult({
          valid: false,
          error: 'Cryptographic Signature Mismatch: Swiggy Credential payload was modified without valid issuer private key.',
          checks: [
            { name: 'Holder Presentation Signature (did:key)', pass: true },
            { name: 'Swiggy Delivery Credential Proof', pass: false, error: 'Signature Mismatch (Data Tampered)' },
            { name: 'Revocation Registry Check', pass: true }
          ]
        });
        setVerifying(false);
        return;
      }

      // 2. Revocation check
      const revokedItem = disclosedCredentials.find(c => revokedIds.has(c.id));
      if (revokedItem) {
        setVerificationResult({
          valid: false,
          error: `Revocation Alert: Credential from ${revokedItem.issuerName} was revoked on the central registry.`,
          checks: [
            { name: 'Holder Presentation Signature', pass: true },
            { name: 'Issuer Signature Validity', pass: true },
            { name: 'Revocation Registry Check', pass: false, error: 'Status: REVOKED by Platform Issuer' }
          ]
        });
        setVerifying(false);
        return;
      }

      // 3. Successful verification
      const isGold = totalTasks >= 2000 && Number(avgRating) >= 4.85;
      const isSilver = totalTasks >= 100;

      setVerificationResult({
        valid: true,
        holderName: persona.name,
        holderDid: persona.did,
        totalTasks: totalTasks,
        compositeRating: avgRating,
        tier: isGold ? 'Gold Tier Partner (Fast-Tracked)' : isSilver ? 'Silver Tier (Standard Onboarding)' : 'Probationary Tier',
        probationWaived: isGold,
        checks: [
          { name: `Holder Presentation Signature (${persona.did.slice(0, 16)}...)`, pass: true },
          ...disclosedCredentials.map(c => ({
            name: `${c.issuerName} (${c.type[1]})`,
            pass: true
          })),
          { name: 'Revocation Registry Status (All Active)', pass: true }
        ]
      });
      setVerifying(false);
    }, 850);
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
      {/* Top Navigation */}
      <header style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(18,20,30,0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '14px 24px'
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
              color: '#fff',
              boxShadow: '0 0 15px rgba(99,102,241,0.4)'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#fff' }}>GigPass</h1>
                <span style={{ fontSize: '11px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  W3C VC v2.0
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                Decentralized Reputation & Portable Credential Wallet
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Persona Switcher Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '10px' }}>
              <Users size={14} color="#94a3b8" />
              <select
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
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="ramesh" style={{ background: '#18181b' }}>Ramesh (Veteran Gold Partner)</option>
                <option value="anita" style={{ background: '#18181b' }}>Anita (Junior Courier)</option>
              </select>
            </div>

            {/* Tab Buttons */}
            <nav style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px' }}>
              {[
                { id: 'demo', label: 'Split Demo', icon: Layers },
                { id: 'wallet', label: 'Wallet', icon: Smartphone },
                { id: 'issuers', label: 'Issuers', icon: Building2 },
                { id: 'verifier', label: 'Verifier Desk', icon: ScanLine }
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
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: isActive ? '#6366f1' : 'transparent',
                      color: isActive ? '#fff' : '#94a3b8'
                    }}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', margin: '28px auto 0', padding: '0 24px' }}>
        {/* VIEW 1: SPLIT SCREEN DEMO */}
        {activeTab === 'demo' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '20px',
                fontSize: '12px',
                color: '#a5b4fc',
                marginBottom: '10px'
              }}>
                <Sparkles size={13} /> Live Cross-Platform Decentralized Reputation Flow
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>
                Break The Walled Garden: Instant Portable Reputation
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '680px', margin: '0 auto' }}>
                Gig workers carry their tamper-proof credentials directly on their phone. When onboarding at a new platform, a single scan verifies thousands of past tasks and unlocks Gold Tier perks instantly.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '32px', alignItems: 'start' }}>
              <div>{renderWalletPhone()}</div>
              <div>{renderVerifierPortal()}</div>
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

      {/* MODAL: CREDENTIAL DEEP-DIVE INSPECTION */}
      {inspectedCred && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            background: '#12141e',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCode size={20} color="#6366f1" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#fff' }}>
                  W3C Verifiable Credential Payload
                </h3>
              </div>
              <button
                onClick={() => setInspectedCred(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{
              background: '#090a10',
              padding: '16px',
              borderRadius: '12px',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#38bdf8',
              overflowX: 'auto',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <pre>{JSON.stringify(inspectedCred, null, 2)}</pre>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setInspectedCred(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* SUB-RENDERER: PHONE COMPONENT WITH SELECTIVE DISCLOSURE */
  function renderWalletPhone() {
    return (
      <div style={{
        background: '#12141e',
        borderRadius: '36px',
        border: '8px solid #232738',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        {/* Notch */}
        <div style={{ height: '22px', background: '#12141e', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '4px', background: '#232738', borderRadius: '4px' }} />
        </div>

        <div style={{ padding: '18px 18px 24px' }}>
          {/* Identity Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '20px',
            padding: '16px',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '16px',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(67,56,202,0.4)'
              }}>
                {persona.avatar}
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#fff' }}>{persona.name}</h3>
                <p style={{ fontSize: '11px', color: '#a5b4fc', margin: '2px 0 0', fontFamily: 'monospace' }}>
                  {persona.did.slice(0, 22)}...
                </p>
              </div>
            </div>

            {/* Composite Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              background: 'rgba(0,0,0,0.35)',
              padding: '10px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>RATING</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <Star size={13} fill="#fbbf24" /> {avgRating}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>TASKS</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{totalTasks.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>VERIFIED</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                  {disclosedCredentials.length} VCs
                </div>
              </div>
            </div>
          </div>

          {/* Credentials Stack with Selective Disclosure Toggle */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>
                Selective Disclosure ({disclosedCredentials.length}/{userCredentials.length})
              </span>
              <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> Ed25519 Signed
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
                      background: c.theme.bg,
                      borderRadius: '12px',
                      padding: '12px',
                      border: isRevoked ? '2px solid #ef4444' : isSelected ? '1px solid rgba(255,255,255,0.2)' : '1px dashed rgba(255,255,255,0.1)',
                      opacity: isSelected ? 1 : 0.6,
                      position: 'relative',
                      textAlign: 'left',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => toggleDisclosure(c.id)}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.3)',
                            background: isSelected ? '#10b981' : 'transparent',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          {isSelected && <Check size={14} />}
                        </button>
                        <div>
                          <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
                            {c.theme.label}
                          </span>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '1px 0 0', color: '#fff' }}>
                            {c.issuerName}
                          </h4>
                        </div>
                      </div>

                      <button
                        onClick={() => setInspectedCred(c)}
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          color: '#fff',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={11} /> Proof
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', marginTop: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>
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

          {/* Dynamic Presentation QR Code */}
          <div style={{
            background: '#1a1d2d',
            borderRadius: '16px',
            padding: '14px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
              <QrCode size={15} color="#6366f1" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>Dynamic Presentation QR</span>
            </div>

            <div style={{
              background: '#fff',
              padding: '10px',
              borderRadius: '12px',
              display: 'inline-block',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
            }}>
              <QRCodeSVG
                value={JSON.stringify(buildPresentationPayload())}
                size={140}
                level="L"
              />
            </div>

            <p style={{ fontSize: '10px', color: '#94a3b8', margin: '8px 0 0' }}>
              Presents {disclosedCredentials.length} credentials with holder proof.
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
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#fff' }}>
              Zomato / Porter Onboarding Terminal
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
              Live W3C Cryptographic Signature & Status Verification
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
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                cursor: 'pointer'
              }}
            >
              <ScanLine size={16} />
              {verifying ? 'Scanning & Verifying...' : 'Scan & Verify QR'}
            </button>
          </div>
        </div>

        {/* Verification Animation */}
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
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle2 size={26} color="#10b981" />
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#10b981' }}>
                          Verified Authentic Worker Identity
                        </h4>
                        <p style={{ fontSize: '12px', color: '#a7f3d0', margin: '2px 0 0' }}>
                          Candidate: {verificationResult.holderName} ({verificationResult.holderDid.slice(0, 20)}...)
                        </p>
                      </div>
                    </div>
                    <span style={{
                      background: '#10b981',
                      color: '#064e3b',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '20px'
                    }}>
                      PASSED ALL CRYPTOGRAPHIC CHECKS
                    </span>
                  </div>

                  {/* Trust Scorecard */}
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
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>VERIFIED TOTAL OUTPUT</div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>
                        {verificationResult.totalTasks.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#34d399' }}>Across Disclosed Platforms</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>CROSS-PLATFORM RATING</div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#fbbf24' }}>
                        {verificationResult.compositeRating} / 5.0 &#9733;
                      </div>
                      <div style={{ fontSize: '11px', color: '#34d399' }}>Verified Customer Feedback</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>STATUS TIER ASSIGNED</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: verificationResult.probationWaived ? '#34d399' : '#60a5fa', marginTop: '4px' }}>
                        {verificationResult.tier}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {verificationResult.probationWaived ? 'Probation Period Waived' : 'Standard 30-Day Check'}
                      </div>
                    </div>
                  </div>

                  {/* Automated Fast-Track Callout */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(217,119,6,0.15) 100%)',
                    border: '1px solid rgba(245,158,11,0.4)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#fcd34d', fontWeight: 800, textTransform: 'uppercase' }}>
                        ONBOARDING ACTION & BENEFITS
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                        {verificationResult.probationWaived ? 'Gold Partner Fast-Track: 1.3x Order Allocation Priority' : 'Standard Partner Fast-Track'}
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#fef08a', background: 'rgba(245,158,11,0.25)', padding: '6px 12px', borderRadius: '8px', fontWeight: 700 }}>
                      Instant Verification Complete
                    </span>
                  </div>
                </div>

                {/* Audit Trail List */}
                <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
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
              /* FAILURE / SECURITY ALERT */
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '16px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <XCircle size={28} color="#ef4444" />
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#ef4444' }}>
                      Verification Rejected: Cryptographic Integrity Failure
                    </h4>
                    <p style={{ fontSize: '12px', color: '#fca5a5', margin: '4px 0 0' }}>
                      {verificationResult.error}
                    </p>
                  </div>
                </div>

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
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px', color: '#fff' }}>
            Trusted Issuer Platforms
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Platforms sign and issue verifiable credentials to workers. They can also revoke credentials if policy violations occur.
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
              onClick={() => alert('Swiggy Credential is active in worker wallet')}
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
              Credential Active
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
              {revokedIds.has('urn:uuid:uber-rep-551029') ? 'Revoked on Registry (Click to Restore)' : 'Revoke Credential (Simulate Policy Strike)'}
            </button>
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
