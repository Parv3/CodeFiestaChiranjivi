/**
 * GigPass Backend API Server
 * Provides W3C Verifiable Credential issuance, verification, and revocation endpoints.
 */

const express = require("express");
const cors = require("cors");
const {
  generateEd25519Keypair,
  issueVerifiableCredential,
  createVerifiablePresentation,
  verifyPresentation
} = require("./crypto/didEngine");
const {
  ISSUER_REGISTRY,
  REVOCATION_REGISTRY,
  getIssuerById,
  revokeCredential,
  unrevokeCredential
} = require("./registry/issuerRegistry");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store for worker keypair in mock mode
let currentWorkerKeypair = generateEd25519Keypair();

/**
 * Health check
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "GigPass Credential Engine",
    version: "1.0.0",
    issuersCount: Object.keys(ISSUER_REGISTRY).length,
    revokedCount: REVOCATION_REGISTRY.size
  });
});

/**
 * Get known issuers and their public DIDs
 */
app.get("/api/issuers", (req, res) => {
  const issuers = Object.values(ISSUER_REGISTRY).map(i => ({
    id: i.id,
    name: i.name,
    did: i.did,
    domain: i.domain,
    category: i.category
  }));
  res.json({ issuers });
});

/**
 * Get or regenerate worker identity
 */
app.get("/api/worker/profile", (req, res) => {
  res.json({
    workerName: "Ramesh Kumar",
    phone: "+91 98765 43210",
    did: currentWorkerKeypair.did,
    publicKeyPem: currentWorkerKeypair.publicKeyPem
  });
});

app.post("/api/worker/generate-identity", (req, res) => {
  currentWorkerKeypair = generateEd25519Keypair();
  res.json({
    message: "Fresh worker keypair and DID generated",
    did: currentWorkerKeypair.did,
    publicKeyPem: currentWorkerKeypair.publicKeyPem
  });
});

/**
 * Issue a Verifiable Credential from an issuer (swiggy, uber, or nsdc)
 */
app.post("/api/credentials/issue", (req, res) => {
  const { issuerId, subjectDid, credentialType, claims, credentialId } = req.body;

  const issuer = getIssuerById(issuerId);
  if (!issuer) {
    return res.status(404).json({ error: `Issuer '${issuerId}' not found` });
  }

  const targetDid = subjectDid || currentWorkerKeypair.did;

  try {
    const credential = issueVerifiableCredential({
      issuerDid: issuer.did,
      issuerPrivateKeyPem: issuer.privateKeyPem,
      subjectDid: targetDid,
      credentialType: credentialType || "ReputationCredential",
      claims: claims || {},
      credentialId: credentialId
    });

    res.json({
      success: true,
      issuer: issuer.name,
      credential: credential
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Create a Verifiable Presentation signed by the worker
 */
app.post("/api/presentation/create", (req, res) => {
  const { credentials } = req.body;

  if (!credentials || !Array.isArray(credentials) || credentials.length === 0) {
    return res.status(400).json({ error: "Provide at least one credential to present" });
  }

  try {
    const presentation = createVerifiablePresentation({
      holderDid: currentWorkerKeypair.did,
      holderPrivateKeyPem: currentWorkerKeypair.privateKeyPem,
      verifiableCredentials: credentials
    });

    res.json({
      success: true,
      presentation: presentation
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Verify a presented Verifiable Presentation (scanned by Verifier app)
 */
app.post("/api/presentation/verify", (req, res) => {
  const { presentation } = req.body;

  if (!presentation) {
    return res.status(400).json({ error: "Missing presentation object" });
  }

  try {
    const result = verifyPresentation({
      presentation: presentation,
      holderPublicKeyPem: currentWorkerKeypair.publicKeyPem,
      issuerRegistry: ISSUER_REGISTRY,
      revocationRegistry: REVOCATION_REGISTRY
    });

    // Compute composite reputation metrics
    let totalTasks = 0;
    let ratingSum = 0;
    let ratingCount = 0;
    let hasGovtCert = false;

    for (const cred of result.credentialResults) {
      if (cred.valid && cred.claims) {
        if (cred.claims.lifetimeDeliveries) {
          totalTasks += Number(cred.claims.lifetimeDeliveries);
        }
        if (cred.claims.completedTrips) {
          totalTasks += Number(cred.claims.completedTrips);
        }
        if (cred.claims.averageRating) {
          ratingSum += Number(cred.claims.averageRating);
          ratingCount += 1;
        }
        if (cred.claims.certifyingBody) {
          hasGovtCert = true;
        }
      }
    }

    const avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(2) : "0.00";
    
    // Tier recommendation logic
    let tierRecommendation = "Standard Tier";
    if (result.valid && totalTasks >= 2000 && Number(avgRating) >= 4.85) {
      tierRecommendation = "Gold Tier (Fast-Track Priority Onboarding)";
    } else if (result.valid && totalTasks >= 500) {
      tierRecommendation = "Silver Tier (Accelerated Onboarding)";
    }

    res.json({
      valid: result.valid,
      holderDid: result.holderDid,
      metrics: {
        totalTasks: totalTasks,
        compositeRating: avgRating,
        hasGovtCert: hasGovtCert,
        tierRecommendation: tierRecommendation
      },
      credentialDetails: result.credentialResults
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Revocation management endpoints (for live security edge case demo)
 */
app.post("/api/credentials/revoke", (req, res) => {
  const { credentialId } = req.body;
  if (!credentialId) {
    return res.status(400).json({ error: "credentialId required" });
  }
  revokeCredential(credentialId);
  res.json({ message: `Credential ${credentialId} marked as REVOKED` });
});

app.post("/api/credentials/unrevoke", (req, res) => {
  const { credentialId } = req.body;
  if (!credentialId) {
    return res.status(400).json({ error: "credentialId required" });
  }
  unrevokeCredential(credentialId);
  res.json({ message: `Credential ${credentialId} unrevoked` });
});

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`GigPass Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
