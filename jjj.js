const crypto = require('crypto');
const { generateKeyPairSync, publicEncrypt, privateDecrypt } = require('crypto');

// Function to generate RSA public and private keys
function generateRsaKeys() {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
    return { privateKey, publicKey };
}

// Function to encrypt data using RSA public key
function rsaEncrypt(publicKey, data) {
    const encrypted = publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        data
    );
    return encrypted;
}

// Function to decrypt data using RSA private key
function rsaDecrypt(privateKey, encryptedData) {
    const decrypted = privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        encryptedData
    );
    return decrypted;
}

// Function to generate a random AES key
function generateAesKey() {
    return crypto.randomBytes(32); // Generate a 256-bit AES key
}

// Function to encrypt plaintext using AES key
function aesEncrypt(aesKey, plaintext) {
    const iv = crypto.randomBytes(16); // Generate a random 128-bit IV
    const cipher = crypto.createCipheriv('aes-256-cfb', aesKey, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    return Buffer.concat([iv, ciphertext]); // Prepend IV to the ciphertext
}

// Function to decrypt ciphertext using AES key
function aesDecrypt(aesKey, ciphertext) {
    const iv = ciphertext.slice(0, 16); // Extract IV from the beginning of the ciphertext
    const actualCiphertext = ciphertext.slice(16); // Extract actual ciphertext
    const decipher = crypto.createDecipheriv('aes-256-cfb', aesKey, iv);
    const plaintext = Buffer.concat([decipher.update(actualCiphertext), decipher.final()]);
    return plaintext;
}

// Example usage
(() => {
    // RSA key generation
    const { privateKey, publicKey } = generateRsaKeys();

    // AES key generation
    const aesKey = generateAesKey();

    // Encrypt AES key with RSA public key
    const encryptedAesKey = rsaEncrypt(publicKey, aesKey);

    // Decrypt AES key with RSA private key
    const decryptedAesKey = rsaDecrypt(privateKey, encryptedAesKey);

    // Encrypt and decrypt a message using AES key
    const message = Buffer.from('MY NAME IS IDEHEN GABRIEL:'); // This is a Buffer object
    const encryptedMessage = aesEncrypt(decryptedAesKey, message);
    const decryptedMessage = aesDecrypt(decryptedAesKey, encryptedMessage);

    // Print original, encrypted, and decrypted messages
    console.log('Original message:', message.toString());
    console.log('Encrypted message:', encryptedMessage.toString('hex'));
    console.log('Decrypted message:', decryptedMessage.toString());
})();