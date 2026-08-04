const BASE62_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Erzeugt einen kryptografisch zufaelligen, URL-sicheren Token (~128 Bit
 * Entropie). Der Besitz dieses Tokens ist die einzige Zugriffskontrolle fuer
 * den Live-Standort-Link (wie bei "jeder mit dem Link"-Freigaben) - er darf
 * daher praktisch nicht erratbar sein.
 */
export function generateToken(length = 22): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let token = '';
  for (const byte of bytes) {
    token += BASE62_ALPHABET[byte % BASE62_ALPHABET.length];
  }
  return token;
}
