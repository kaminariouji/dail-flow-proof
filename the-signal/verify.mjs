// Standalone Ed25519 verification for DAiL bounty bnty_0027 "THE SIGNAL".
// No dependencies. Node.js >= 15.
//
// Usage:
//   node verify.mjs                        # verify the recorded signature
//   node verify.mjs "<message>" "<sig_hex>" # verify a NEW challenge nonce

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rec = JSON.parse(fs.readFileSync(path.join(__dirname, 'signature.json'), 'utf8'));

const message = process.argv[2] ?? rec.signed_message;
const sigHex = process.argv[3] ?? rec.signature_hex;

// Rebuild the Ed25519 public key from raw bytes (SPKI DER wrapper).
const rawPub = Buffer.from(rec.public_key_hex, 'hex');
const spki = Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), rawPub]);
const publicKey = crypto.createPublicKey({ key: spki, format: 'der', type: 'spki' });

const ok = crypto.verify(null, Buffer.from(message), publicKey, Buffer.from(sigHex, 'hex'));

console.log('responder :', rec.responder);
console.log('algorithm :', rec.algorithm);
console.log('pubkey    :', rec.public_key_base58);
console.log('message   :', message);
console.log('signature :', sigHex.slice(0, 32) + '...' + sigHex.slice(-16));
console.log('VALID     :', ok);

// A valid signature over a message that was never published before
// cannot be produced without the private key. Only the responder holds it.
process.exit(ok ? 0 : 1);
