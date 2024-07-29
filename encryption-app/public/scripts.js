document.getElementById('encryptButton').addEventListener('click', () => {
    const message = document.getElementById('message').value;
    
    fetch('/encrypt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.encryptedMessage && data.encryptedAesKey) {
            document.getElementById('encryptedMessage').value = data.encryptedMessage;
            document.getElementById('encryptedMessage').dataset.encryptedAesKey = data.encryptedAesKey;
        } else {
            console.error('Invalid response format:', data);
        }
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('decryptButton').addEventListener('click', () => {
    const encryptedMessage = document.getElementById('encryptedMessage').value;
    const encryptedAesKey = document.getElementById('encryptedMessage').dataset.encryptedAesKey;
    
    if (!encryptedMessage || !encryptedAesKey) {
        console.error('No encrypted message or AES key found.');
        return;
    }
    
    fetch('/decrypt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ encryptedMessage, encryptedAesKey })
    })
    .then(response => response.json())
    .then(data => {
        if (data.decryptedMessage) {
            document.getElementById('decryptedMessage').value = data.decryptedMessage;
        } else {
            console.error('Invalid response format:', data);
        }
    })
    .catch(error => console.error('Error:', error));
});
