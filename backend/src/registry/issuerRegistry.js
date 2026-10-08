/**
 * Registry holding issuer keys, metadata, and active revocation lists.
 */

const { generateEd25519Keypair } = require("../crypto/didEngine");

// Generate stable keys for the three demo issuers
const swiggyKeypair = generateEd25519Keypair();
const uberKeypair = generateEd25519Keypair();
const nsdcKeypair = generateEd25519Keypair();

const ISSUER_REGISTRY = {
  [swiggyKeypair.did]: {
    id: "swiggy",
    name: "Swiggy Delivery Partner Platform",
    did: swiggyKeypair.did,
    publicKeyPem: swiggyKeypair.publicKeyPem,
    privateKeyPem: swiggyKeypair.privateKeyPem,
    domain: "partner.swiggy.com",
    category: "Delivery"
  },
  [uberKeypair.did]: {
    id: "uber",
    name: "Uber Mobility Driver Fleet",
    did: uberKeypair.did,
    publicKeyPem: uberKeypair.publicKeyPem,
    privateKeyPem: uberKeypair.privateKeyPem,
    domain: "drivers.uber.com",
    category: "Rideshare"
  },
  [nsdcKeypair.did]: {
    id: "nsdc",
    name: "National Skill Development Corporation (NSDC)",
    did: nsdcKeypair.did,
    publicKeyPem: nsdcKeypair.publicKeyPem,
    privateKeyPem: nsdcKeypair.privateKeyPem,
    domain: "skillindia.gov.in",
    category: "Government Authority"
  }
};

// Set of revoked credential IDs
const REVOCATION_REGISTRY = new Set();

function getIssuerById(id) {
  return Object.values(ISSUER_REGISTRY).find(i => i.id === id);
}

function getIssuerByDid(did) {
  return ISSUER_REGISTRY[did];
}

function revokeCredential(credentialId) {
  REVOCATION_REGISTRY.add(credentialId);
}

function unrevokeCredential(credentialId) {
  REVOCATION_REGISTRY.delete(credentialId);
}

function isRevoked(credentialId) {
  return REVOCATION_REGISTRY.has(credentialId);
}

module.exports = {
  ISSUER_REGISTRY,
  REVOCATION_REGISTRY,
  getIssuerById,
  getIssuerByDid,
  revokeCredential,
  unrevokeCredential,
  isRevoked
};
