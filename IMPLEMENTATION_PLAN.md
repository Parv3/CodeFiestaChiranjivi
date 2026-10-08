# Portable Worker Reputation and Credential Wallet Across Gig Platforms

## 1. Problem Overview

Gig workers across food delivery, ride hailing, and home services accumulate thousands of hours of work, high ratings, and valuable customer trust on platforms like Swiggy, Uber, and Urban Company. However, this reputation data is locked inside each platform's proprietary database.

When a worker switches to a competing platform or looks for additional work, they are forced to start from scratch:
- Zero recognized history or completed trips.
- Base-tier algorithmic order allocation and minimum incentive brackets.
- Redundant and costly background verification and skill tests.

This project implements a decentralized, self-sovereign credential ecosystem where workers own their work history and ratings. Using W3C Verifiable Credentials (VCs) and Decentralized Identifiers (DIDs), workers can store cryptographically signed reputation cards in a mobile wallet and present them to new platforms via a dynamic QR code for instant, tamper-proof verification.

---

## 2. High-Level System Architecture

The architecture consists of three interconnected systems operating over open W3C standards:

```text
+------------------------------------------------------------------------+
|                            TRUSTED ISSUERS                             |
|  - Platform 1 (Swiggy): Delivery Reputation Credential                 |
|  - Platform 2 (Uber): Mobility & Driver Reputation Credential          |
|  - Government Authority (NSDC / Skill India): Skill Certificate        |
+------------------------------------------------------------------------+
                                    |
                    Issues Signed W3C Credentials
                                    v
+------------------------------------------------------------------------+
|                          WORKER MOBILE WALLET                          |
|  - Generates & holds worker Ed25519 keypair and did:key                |
|  - Stores signed reputation credentials locally on device              |
|  - Computes composite reputation and trustworthiness score             |
|  - Packages selected credentials into a Verifiable Presentation (VP)   |
|  - Renders dynamic presentation QR code                                |
+------------------------------------------------------------------------+
                                    |
                    Presents QR Code for Scanning
                                    v
+------------------------------------------------------------------------+
|                         PLATFORM VERIFIER APP                          |
|  - Used by onboarding team at new platforms (e.g., Zomato, Porter)     |
|  - Scans presentation QR code via device camera or upload              |
|  - Verifies cryptographic signature against Issuer DIDs                |
|  - Checks revocation status registry                                   |
|  - Displays Trust Summary & fast-tracks worker to higher tier          |
+------------------------------------------------------------------------+
```

---

## 3. Core Standards and Cryptography

### W3C Verifiable Credentials (VC) Data Model
Every work record is represented as a JSON-LD Verifiable Credential conforming to the W3C VC 1.1 / 2.0 specification. Each credential contains:
- Issuer identifier (`did:key` or `did:web`).
- Subject identifier (the worker's public DID).
- Claims object containing ratings, task counts, and platform tenure.
- Cryptographic proof block (Ed25519 signature) signed by the issuing platform's private key.

### Decentralized Identifiers (DIDs)
- Worker Identity: Generated on the device using `did:key:z6Mk...` derived from an Ed25519 public key. No blockchain gas fees or centralized registration required.
- Issuer Identities: Platform issuers use established DIDs (`did:key` or `did:web:swiggy.com`).

### Verifiable Presentation (VP)
When presenting credentials to a verifier, the wallet bundles the credentials into a Verifiable Presentation signed by the worker's private key. This proves that the presenter is indeed the legitimate owner of the credentials, preventing credential theft or screenshots.

---

## 4. Concrete Credential Schemas

### Credential 1: Swiggy Delivery Reputation Credential
```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://schema.org"
  ],
  "id": "urn:uuid:swiggy-rep-982134",
  "type": ["VerifiableCredential", "DeliveryReputationCredential"],
  "issuer": "did:key:z6MkuwSwiggyIssuerPublicKeyHexExample",
  "issuanceDate": "2026-03-15T10:00:00Z",
  "credentialSubject": {
    "id": "did:key:z6MkrWorkerPublicKeyHexExample",
    "workerName": "Ramesh Kumar",
    "platform": "Swiggy",
    "lifetimeDeliveries": 3240,
    "averageRating": 4.92,
    "onTimeDeliveryRate": "98.4%",
    "tenureMonths": 26,
    "standing": "Top Tier Partner"
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-03-15T10:00:00Z",
    "verificationMethod": "did:key:z6MkuwSwiggyIssuerPublicKeyHexExample#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z3mX9k...tamperproofSignatureValue..."
  }
}
```

### Credential 2: Uber Mobility Driver Credential
```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://schema.org"
  ],
  "id": "urn:uuid:uber-rep-551029",
  "type": ["VerifiableCredential", "MobilityReputationCredential"],
  "issuer": "did:key:z6MkuwUberIssuerPublicKeyHexExample",
  "issuanceDate": "2026-03-20T14:30:00Z",
  "credentialSubject": {
    "id": "did:key:z6MkrWorkerPublicKeyHexExample",
    "workerName": "Ramesh Kumar",
    "platform": "Uber",
    "completedTrips": 1420,
    "averageRating": 4.88,
    "safetyIncidentCount": 0,
    "tenureMonths": 14,
    "standing": "Diamond Driver"
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-03-20T14:30:00Z",
    "verificationMethod": "did:key:z6MkuwUberIssuerPublicKeyHexExample#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z7pB2q...tamperproofSignatureValue..."
  }
}
```

### Credential 3: NSDC / Skill India Certification
```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://schema.org"
  ],
  "id": "urn:uuid:nsdc-cert-118274",
  "type": ["VerifiableCredential", "SkillCertificationCredential"],
  "issuer": "did:key:z6MkuwGovtNSDCPublicKeyHexExample",
  "issuanceDate": "2026-01-10T09:00:00Z",
  "credentialSubject": {
    "id": "did:key:z6MkrWorkerPublicKeyHexExample",
    "workerName": "Ramesh Kumar",
    "certifyingBody": "National Skill Development Corporation",
    "qualification": "Commercial Two-Wheeler Operations and Road Safety Level 2",
    "grade": "Distinction",
    "verificationStatus": "Government Verified"
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-01-10T09:00:00Z",
    "verificationMethod": "did:key:z6MkuwGovtNSDCPublicKeyHexExample#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z9kL4r...tamperproofSignatureValue..."
  }
}
```

---

## 5. Technical Stack

| Layer | Recommended Choice | Key Rationale |
|---|---|---|
| **Worker Mobile App** | **React Native (Expo)** or **Flutter** | Cross-platform, fast prototyping, native camera, and QR rendering. |
| **Issuer & Verifier Portals** | **React (Vite) + Tailwind CSS** | Clean responsive web dashboard for laptop demo and webcam scanning. |
| **Cryptography Core** | **Node.js (TypeScript)** / **Python** | Robust Ed25519 cryptographic signing (`@mattrglobal/node-did-spki`, `tweetnacl`, or Python `cryptography`). |
| **Data Storage** | **LocalStorage / SQLite** | Client-side wallet storage ensuring self-sovereignty; no central honeypot. |

---

## 6. System Workflows

### Flow 1: Worker Key Generation and Onboarding
1. Worker launches the mobile wallet app.
2. The app generates an Ed25519 keypair locally using device crypto APIs.
3. The app computes the worker's DID (`did:key:z6Mk...`).
4. The private key remains stored securely in device storage.

### Flow 2: Credential Issuance
1. The worker connects with the Mock Issuer portal (Swiggy, Uber, or Skill India).
2. The issuer retrieves the worker's completed orders and ratings from its database.
3. The issuer constructs the W3C Verifiable Credential payload targeting the worker's DID.
4. The issuer signs the payload using its private Ed25519 key.
5. The signed JSON credential is sent to the worker's wallet app and saved to local storage.

### Flow 3: Presentation and Dynamic QR Generation
1. In the wallet, the worker selects which credentials to present (e.g., Swiggy + Uber + Skill India).
2. The wallet constructs a Verifiable Presentation (VP) object enclosing the chosen credentials.
3. The wallet signs the presentation using the worker's private key.
4. The presentation payload is encoded into a dynamic QR code.

### Flow 4: Verifier Scanning and Validation
1. The onboarding manager at the new platform opens the Verifier Web Portal.
2. The portal scans the QR code via webcam or uploaded camera image.
3. The verifier performs four automated checks:
   - Presentation Signature Check: Confirms the worker holds the matching private key.
   - Issuer Signature Checks: Confirms each credential was authentically signed by Swiggy, Uber, or NSDC.
   - Expiration and Date Validation: Ensures credentials are active.
   - Revocation Check: Queries the revocation list endpoint to ensure credentials have not been recalled.
4. The verifier calculates an aggregate reputation index:
   - Combined tasks: 4,660.
   - Weighted average rating: 4.91 / 5.0.
   - Verified safety record: Zero reported incidents.
5. Displays a Trust Assessment Card recommending immediate Gold Partner onboarding.

---

## 7. Composite Reputation Scoring Model

To avoid simple averaging where 10 rides on one platform weigh identically to 3,000 rides on another, the verifier computes a volume-weighted composite score:

```text
Composite Score = [ (R1 * V1) + (R2 * V2) ] / (V1 + V2)
```

Where:
- R1, R2 = Average ratings on Platform 1 and Platform 2.
- V1, V2 = Volume of completed deliveries/rides on each platform.

A credential bonus (+0.05) is applied if a verified government or safety credential is present.

Threshold tiers:
- Elite / Gold Tier: Composite score >= 4.85 and total volume >= 2,000 tasks.
- Silver Tier: Composite score >= 4.70 and total volume >= 500 tasks.
- Standard Tier: All new or unverified workers.

---

## 8. Step-by-Step Implementation Roadmap

### Step 1: Cryptographic Engine Setup
- Implement Ed25519 keypair generation and DID formatting (`did:key`).
- Write credential signing and signature verification functions.
- Build a mock revocation registry containing credential IDs.

### Step 2: Mock Issuer Portals
- Build a lightweight web UI simulating Swiggy, Uber, and Skill India partner portals.
- Provide a button to issue mock credentials directly to the worker.

### Step 3: Worker Mobile Wallet
- Build the Portfolio screen showing reputation cards with custom logos and stats.
- Build the Aggregate Score screen displaying overall metrics.
- Build the QR Code screen rendering the signed Verifiable Presentation.

### Step 4: Platform Verifier Application
- Build the scanning interface using an in-browser QR code scanner (`html5-qrcode` or equivalent).
- Parse the received presentation, verify signatures, and fetch issuer metadata.
- Display a green verified banner, detailed breakdown of past work, and fast-track recommendations.
- Include a test toggle to simulate a revoked credential or forged signature, showing an immediate red warning.

---

## 9. Live Demo Walkthrough

1. Introduction: Explain the problem of locked gig reputation and how starting from zero harms workers.
2. Wallet Tour: Show the worker wallet loaded with credentials from Swiggy, Uber, and NSDC Skill India.
3. QR Presentation: Tap "Share Reputation" in the wallet to generate the dynamic presentation QR code.
4. Verifier Scan: Show the onboarding portal at Zomato scanning the QR code via webcam.
5. Trust Result: In under two seconds, the verifier validates all signatures, shows 4,660 verified tasks, 4.91 composite rating, and automatically assigns the worker to Gold Tier status.
6. Tamper Detection Test: Modify a single character in the QR payload or present a revoked credential to demonstrate that the verifier catches the tamper attempt and rejects it.
