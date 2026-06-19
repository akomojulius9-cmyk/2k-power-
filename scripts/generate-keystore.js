import forge from 'node-forge';
import fs from 'fs';
import path from 'path';

function run() {
  try {
    console.log('--- Generating High-Grade Cryptographic Android Keystore ---');
    
    // 1. Generate an RSA 2048 keypair
    console.log('[1/4] Generating RSA-2048 keypair (this might take a few seconds)...');
    const keys = forge.pki.rsa.generateKeyPair(2048);
    
    // 2. Create a self-signed certificate
    console.log('[2/4] Initializing X.509 certificate metadata...');
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '1000';
    
    // Validity: 25 years (required for standard Google Play publishing compatibility)
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 25);

    const attrs = [
      { name: 'commonName', value: 'Power2k' },
      { name: 'countryName', value: 'UG' },
      { name: 'stateOrProvinceName', value: 'Central' },
      { name: 'localityName', value: 'Kampala' },
      { name: 'organizationName', value: 'Power2k' },
      { name: 'organizationalUnitName', value: 'IT' }
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    // Self-sign key
    console.log('[3/4] Registering SHA256 self-signing signatures on certificate...');
    cert.sign(keys.privateKey, forge.md.sha256.create());

    // 3. Package everything into a PKCS12 (standard modern Keystore format)
    console.log('[4/4] Packing Private Key and Certificate into PKCS12 container...');
    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
      keys.privateKey,
      [cert],
      'power2k_password',
      {
        friendlyName: 'release-key-alias',
        algorithm: '3des'
      }
    );

    // Convert to Binary buffer
    const p12Der = forge.asn1.toDer(p12Asn1).getBytes();

    // Ensure directory exists
    const appDir = path.join(process.cwd(), 'android', 'app');
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }

    const keyPath = path.join(appDir, 'release-key.keystore');
    fs.writeFileSync(keyPath, p12Der, 'binary');

    console.log('✔ SUCCESS: Android Sign-Ready Keystore generated successfully!');
    console.log('Location: ' + keyPath);
    console.log('Password: power2k_password');
    console.log('Alias:    release-key-alias');
    console.log('------------------------------------------------------------');
  } catch (error) {
    console.error('❌ Failed to construct keystore:', error);
    process.exit(1);
  }
}

run();
