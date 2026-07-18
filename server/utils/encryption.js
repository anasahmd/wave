import Cryptr from 'cryptr';

const key = process.env.ENCRYPTION_KEY;
if (!key) throw new Error('ENCRYPTION_KEY env var is required.');

// Initialize Cryptr (it handles AES-256-GCM setup internally)
const cryptr = new Cryptr(key);

export function encrypt(text) {
	// Returns a single safe string containing the IV, AuthTag, and ciphertext
	return cryptr.encrypt(text);
}

export function decrypt(encryptedString) {
	return cryptr.decrypt(encryptedString);
}
