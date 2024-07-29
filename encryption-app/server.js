const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { generateKeyPairSync, publicEncrypt, privateDecrypt } = require('crypto');

// Generate RSA keys
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Function to generate a random AES key
function generateAesKey() {
    return crypto.randomBytes(32); // Generate a 256-bit AES key
}

// Function to encrypt data using RSA public key
function rsaEncrypt(publicKey, data) {
    return publicEncrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    }, data);
}

// Function to decrypt data using RSA private key
function rsaDecrypt(privateKey, encryptedData) {
    return privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    }, encryptedData);
}

// Function to encrypt plaintext using AES key
function aesEncrypt(aesKey, plaintext) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cfb', aesKey, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    return Buffer.concat([iv, ciphertext]);
}

// Function to decrypt ciphertext using AES key
function aesDecrypt(aesKey, ciphertext) {
    const iv = ciphertext.slice(0, 16);
    const actualCiphertext = ciphertext.slice(16);
    const decipher = crypto.createDecipheriv('aes-256-cfb', aesKey, iv);
    return Buffer.concat([decipher.update(actualCiphertext), decipher.final()]);
}

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // Ensure your HTML, CSS, and client.js are in a 'public' directory

app.post('/encrypt', (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const aesKey = generateAesKey();
        const encryptedMessage = aesEncrypt(aesKey, Buffer.from(message));
        const encryptedAesKey = rsaEncrypt(publicKey, aesKey);
        res.json({ encryptedMessage: encryptedMessage.toString('hex'), encryptedAesKey: encryptedAesKey.toString('hex') });
    } catch (error) {
        console.error('Encryption error:', error);
        res.status(500).json({ error: 'Encryption failed' });
    }
});

app.post('/decrypt', (req, res) => {
    try {
        const { encryptedMessage, encryptedAesKey } = req.body;
        if (!encryptedMessage || !encryptedAesKey) {
            return res.status(400).json({ error: 'Encrypted message and AES key are required' });
        }

        const aesKey = rsaDecrypt(privateKey, Buffer.from(encryptedAesKey, 'hex'));
        const decryptedMessage = aesDecrypt(aesKey, Buffer.from(encryptedMessage, 'hex'));
        res.json({ decryptedMessage: decryptedMessage.toString() });
    } catch (error) {
        console.error('Decryption error:', error);
        res.status(500).json({ error: 'Decryption failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
