/**
 * Cryptographic engine for W3C Verifiable Credentials and DIDs.
 * Uses native Node.js Ed25519 asymmetric cryptography.
 */

const crypto = require("crypto");

/**
 * Generate an Ed25519 keypair and a deterministic did:key identifier.
 */
function generateEd25519Keypair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });

  // Export raw public key bytes for did:key generation
  const pubDer = crypto.createPublicKey(publicKey).export({ type: "spki", format: "der" });
  // The last 32 bytes of the SPKI DER for Ed25519 represent the raw 32-byte public key
  const rawPub = pubDer.subarray(pubDer.length - 32);
  const didKey = `did:key:z6Mk${rawPub.toString("hex").substring(0, 40)}`;

  return {
    did: didKey,
    publicKeyPem: publicKey,
    privateKeyPem: privateKey
  };
}

/**
 * Sign data string with Ed25519 private key.
 */
function signData(dataString, privateKeyPem) {
  return crypto.sign(null, Buffer.from(dataString, "utf8"), privateKeyPem).toString("base64url");
}

/**
 * Verify data string against an Ed25519 public key.
 */
function verifySignature(dataString, signatureBase64Url, publicKeyPem) {
  try {
    const signatureBuffer = Buffer.from(signatureBase64Url, "base64url");
    return crypto.verify(
      null,
      Buffer.from(dataString, "utf8"),
      publicKeyPem,
      signatureBuffer
    );
  } catch (err) {
    return false;
  }
}

/**
 * Canonical JSON stringifier (sorts keys deterministically for signing).
 */
function canonicalizeJson(obj) {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalizeJson).join(",") + "]";
  }
  const sortedKeys = Object.keys(obj).sort();
  const entries = sortedKeys.map(k => `"${k}":${canonicalizeJson(obj[k])}`);
  return "{" + entries.join(",") + "}";
}

/**
 * Issue a W3C Verifiable Credential.
 */
function issueVerifiableCredential({
  issuerDid,
  issuerPrivateKeyPem,
  subjectDid,
  credentialType,
  claims,
  credentialId
}) {
  const id = credentialId || `urn:uuid:${crypto.randomUUID()}`;
  const issuanceDate = new Date().toISOString();

  const credentialPayload = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://schema.org"
    ],
    id: id,
    type: ["VerifiableCredential", credentialType],
    issuer: issuerDid,
    issuanceDate: issuanceDate,
    credentialSubject: {
      id: subjectDid,
      ...claims
    }
  };

  const canonicalString = canonicalizeJson(credentialPayload);
  const proofValue = signData(canonicalString, issuerPrivateKeyPem);

  return {
    ...credentialPayload,
    proof: {
      type: "Ed25519Signature2020",
      created: issuanceDate,
      verificationMethod: `${issuerDid}#key-1`,
      proofPurpose: "assertionMethod",
      proofValue: proofValue
    }
  };
}

/**
 * Verify a W3C Verifiable Credential against an issuer public key.
 */
function verifyVerifiableCredential(vc, issuerPublicKeyPem, revokedIds = new Set()) {
  if (!vc || !vc.proof || !vc.proof.proofValue) {
    return { valid: false, reason: "Missing cryptographic proof" };
  }

  // Check revocation status
  if (revokedIds.has(vc.id)) {
    return { valid: false, reason: "Credential has been revoked by issuer" };
  }

  // Extract payload without proof block
  const { proof, ...payload } = vc;
  const canonicalString = canonicalizeJson(payload);

  const isValid = verifySignature(canonicalString, proof.proofValue, issuerPublicKeyPem);
  if (!isValid) {
    return { valid: false, reason: "Cryptographic signature mismatch (data tampered)" };
  }

  return { valid: true };
}

/**
 * Create a Verifiable Presentation enclosing multiple credentials.
 */
function createVerifiablePresentation({
  holderDid,
  holderPrivateKeyPem,
  verifiableCredentials
}) {
  const presentationId = `urn:uuid:${crypto.randomUUID()}`;
  const presentationDate = new Date().toISOString();

  const presentationPayload = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    id: presentationId,
    type: ["VerifiablePresentation"],
    holder: holderDid,
    verifiableCredential: verifiableCredentials
  };

  const canonicalString = canonicalizeJson(presentationPayload);
  const proofValue = signData(canonicalString, holderPrivateKeyPem);

  return {
    ...presentationPayload,
    proof: {
      type: "Ed25519Signature2020",
      created: presentationDate,
      verificationMethod: `${holderDid}#key-1`,
      proofPurpose: "authentication",
      proofValue: proofValue
    }
  };
}

/**
 * Verify a Verifiable Presentation and all of its child credentials.
 */
function verifyPresentation({
  presentation,
  holderPublicKeyPem,
  issuerRegistry,
  revocationRegistry
}) {
  if (!presentation || !presentation.proof || !presentation.proof.proofValue) {
    return { valid: false, reason: "Malformed presentation (no proof found)" };
  }

  // Verify presentation wrapper signature
  const { proof, ...payload } = presentation;
  const canonicalString = canonicalizeJson(payload);
  const isHolderValid = verifySignature(canonicalString, proof.proofValue, holderPublicKeyPem);

  if (!isHolderValid) {
    return { valid: false, reason: "Presentation holder signature invalid (unauthorized bearer)" };
  }

  const credentials = presentation.verifiableCredential || [];
  const credentialResults = [];

  for (const vc of credentials) {
    const issuerInfo = issuerRegistry[vc.issuer];
    if (!issuerInfo) {
      credentialResults.push({
        id: vc.id,
        type: vc.type,
        valid: false,
        reason: `Unknown or untrusted issuer: ${vc.issuer}`
      });
      continue;
    }

    const check = verifyVerifiableCredential(
      vc,
      issuerInfo.publicKeyPem,
      revocationRegistry
    );

    credentialResults.push({
      id: vc.id,
      issuer: issuerInfo.name,
      type: vc.type,
      claims: vc.credentialSubject,
      valid: check.valid,
      reason: check.reason || null
    });
  }

  const allCredentialsValid = credentialResults.every(r => r.valid);

  return {
    valid: isHolderValid && allCredentialsValid,
    holderDid: presentation.holder,
    credentialResults: credentialResults
  };
}

module.exports = {
  generateEd25519Keypair,
  signData,
  verifySignature,
  canonicalizeJson,
  issueVerifiableCredential,
  verifyVerifiableCredential,
  createVerifiablePresentation,
  verifyPresentation
};
