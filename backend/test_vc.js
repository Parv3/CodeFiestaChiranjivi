/**
 * Standalone test script to verify end-to-end W3C VC cryptographic lifecycle.
 */

const assert = require("assert");
const {
  generateEd25519Keypair,
  issueVerifiableCredential,
  verifyVerifiableCredential,
  createVerifiablePresentation,
  verifyPresentation
} = require("./src/crypto/didEngine");

console.log("=== GigPass W3C Cryptographic Engine Test Suite ===");

// 1. Generate keys
const worker = generateEd25519Keypair();
const swiggy = generateEd25519Keypair();
const uber = generateEd25519Keypair();
const nsdc = generateEd25519Keypair();

console.log("[1] Generated DIDs:");
console.log("    Worker DID: ", worker.did);
console.log("    Swiggy DID: ", swiggy.did);

// 2. Issue Credentials
const swiggyCred = issueVerifiableCredential({
  issuerDid: swiggy.did,
  issuerPrivateKeyPem: swiggy.privateKeyPem,
  subjectDid: worker.did,
  credentialType: "DeliveryReputationCredential",
  claims: {
    workerName: "Ramesh Kumar",
    platform: "Swiggy",
    lifetimeDeliveries: 3240,
    averageRating: 4.92,
    standing: "Top Tier Partner"
  }
});

const uberCred = issueVerifiableCredential({
  issuerDid: uber.did,
  issuerPrivateKeyPem: uber.privateKeyPem,
  subjectDid: worker.did,
  credentialType: "MobilityReputationCredential",
  claims: {
    workerName: "Ramesh Kumar",
    platform: "Uber",
    completedTrips: 1420,
    averageRating: 4.88,
    standing: "Diamond Driver"
  }
});

const nsdcCred = issueVerifiableCredential({
  issuerDid: nsdc.did,
  issuerPrivateKeyPem: nsdc.privateKeyPem,
  subjectDid: worker.did,
  credentialType: "SkillCertificationCredential",
  claims: {
    workerName: "Ramesh Kumar",
    qualification: "Two-Wheeler Operations Level 2",
    grade: "Distinction"
  }
});

console.log("[2] Issued 3 W3C Verifiable Credentials with Ed25519 proofs.");

// 3. Verify single credential
const singleCheck = verifyVerifiableCredential(swiggyCred, swiggy.publicKeyPem);
assert.strictEqual(singleCheck.valid, true, "Swiggy credential must be valid");
console.log("[3] Verified Swiggy credential signature mathematically: PASS");

// 4. Create Verifiable Presentation
const presentation = createVerifiablePresentation({
  holderDid: worker.did,
  holderPrivateKeyPem: worker.privateKeyPem,
  verifiableCredentials: [swiggyCred, uberCred, nsdcCred]
});
console.log("[4] Packaged credentials into signed Verifiable Presentation (VP).");

// 5. Verify Presentation
const registry = {
  [swiggy.did]: { name: "Swiggy", publicKeyPem: swiggy.publicKeyPem },
  [uber.did]: { name: "Uber", publicKeyPem: uber.publicKeyPem },
  [nsdc.did]: { name: "NSDC", publicKeyPem: nsdc.publicKeyPem }
};

const vpResult = verifyPresentation({
  presentation: presentation,
  holderPublicKeyPem: worker.publicKeyPem,
  issuerRegistry: registry,
  revocationRegistry: new Set()
});

assert.strictEqual(vpResult.valid, true, "Full presentation must verify cleanly");
assert.strictEqual(vpResult.credentialResults.length, 3, "All 3 credentials must be verified");
console.log("[5] Verifier successfully verified presentation and all 3 credentials: PASS");

// 6. Security Test: Tampering Detection
const tamperedCred = JSON.parse(JSON.stringify(swiggyCred));
tamperedCred.credentialSubject.averageRating = 5.0; // modified rating without re-signing!
const tamperCheck = verifyVerifiableCredential(tamperedCred, swiggy.publicKeyPem);
assert.strictEqual(tamperCheck.valid, false, "Tampered credential MUST fail signature verification");
console.log("[6] Security Test (Tamper Detection): Correctly caught forged rating: PASS");

// 7. Security Test: Revocation Checking
const revokedSet = new Set([uberCred.id]);
const revocationCheck = verifyPresentation({
  presentation: presentation,
  holderPublicKeyPem: worker.publicKeyPem,
  issuerRegistry: registry,
  revocationRegistry: revokedSet
});
assert.strictEqual(revocationCheck.valid, false, "Presentation containing revoked credential must fail overall check");
const revokedItem = revocationCheck.credentialResults.find(c => c.id === uberCred.id);
assert.strictEqual(revokedItem.valid, false);
console.log("[7] Security Test (Revocation Check): Correctly identified revoked Uber credential: PASS");

console.log("\nALL 7 CRYPTOGRAPHIC VERIFICATION TESTS PASSED SUCCESSFULLY!");
