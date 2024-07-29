// Generate RSA key pair
async function generateRSAKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: { name: "SHA-256" },
        },
        true,
        ["encrypt", "decrypt"]
    );
    return keyPair;
}

// Export RSA key to PEM format
async function exportKey(key) {
    const exported = await window.crypto.subtle.exportKey("spki", key);
    const exportedAsString = String.fromCharCode.apply(null, new Uint8Array(exported));
    const exportedAsBase64 = window.btoa(exportedAsString);
    const pemExported = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
    return pemExported;
}

// Generate AES key
async function generateAESKey() {
    const aesKey = await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
    return aesKey;
}

// Encrypt AES key with RSA public key
async function encryptAESKey(aesKey, publicKey) {
    const exportedAESKey = await window.crypto.subtle.exportKey("raw", aesKey);
    const encryptedAESKey = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        publicKey,
        exportedAESKey
    );
    return encryptedAESKey;
}

// Decrypt AES key with RSA private key
async function decryptAESKey(encryptedAESKey, privateKey) {
    const decryptedAESKey = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP",
        },
        privateKey,
        encryptedAESKey
    );
    const importedAESKey = await window.crypto.subtle.importKey(
        "raw",
        decryptedAESKey,
        {
            name: "AES-GCM",
        },
        true,
        ["encrypt", "decrypt"]
    );
    return importedAESKey;
}

// Encrypt message with AES key
async function encryptMessageWithAESKey(aesKey, message) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);
    const encryptedMessage = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        aesKey,
        encodedMessage
    );
    return { encryptedMessage, iv };
}

// Decrypt message with AES key
async function decryptMessageWithAESKey(aesKey, encryptedMessage, iv) {
    const decryptedMessage = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        aesKey,
        encryptedMessage
    );
    const decoder = new TextDecoder();
    return decoder.decode(decryptedMessage);
}

// Example usage
let rsaKeyPair;
let aesKey;
let encryptedAESKey;

async function setup() {
    // Generate RSA key pair
    rsaKeyPair = await generateRSAKeyPair();
    const publicKeyPEM = await exportKey(rsaKeyPair.publicKey);
    console.log("Public Key:\n", publicKeyPEM);

    // Generate AES key
    aesKey = await generateAESKey();
    console.log("AES Key generated");

    // Encrypt AES key with RSA public key
    encryptedAESKey = await encryptAESKey(aesKey, rsaKeyPair.publicKey);
    console.log("AES Key encrypted with RSA public key");
}

async function encryptMessage() {
    const message = document.getElementById("MY NAME IS IDEHEN GABRIEL").value;
    const { encryptedMessage, iv } = await encryptMessageWithAESKey(aesKey, message);
    document.getElementById("encryptedMessage").value = `${btoa(String.fromCharCode.apply(null, new Uint8Array(iv)))}:${btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedMessage)))}`;
}

async function decryptMessage() {
    const encryptedMessageInput = document.getElementById("encryptedMessage").value.split(':');
    const iv = new Uint8Array(atob(encryptedMessageInput[0]).split('').map(c => c.charCodeAt(0)));
    const encryptedMessage = new Uint8Array(atob(encryptedMessageInput[1]).split('').map(c => c.charCodeAt(0)));
    const decryptedMessage = await decryptMessageWithAESKey(aesKey, encryptedMessage, iv);
    document.getElementById("decryptedMessage").value = decryptedMessage;
}

// Initialize the setup
setup();
