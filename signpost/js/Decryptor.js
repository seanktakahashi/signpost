class Decryptor {
  static decryptInternal(salt, iv, ciphertext, password) {
    const wordSizeBytes = 4;
    const keySizeBytes = 32;
    const iterations = 50000;

    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: keySizeBytes / wordSizeBytes, // in words
      hasher: CryptoJS.algo.SHA256,
      iterations
    });
    var plaintext = CryptoJS.AES.decrypt(ciphertext, key, {
      iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });
    return plaintext.toString(CryptoJS.enc.Utf8);
  }

  static unformatEncrytionComponents(rawText) {
    const saltSizeBytes = 32;
    const ivSizeBytes = 16;
    const saltLengthChars = saltSizeBytes * 2; // salt is encoded in hex, so each 2 chars is 1 byte
    const ivLengthChars = ivSizeBytes * 2; // iv is encoded in hex, so each 2 chars is 1 byte
    return {
      salt: CryptoJS.enc.Hex.parse(rawText.substr(0, saltLengthChars)),
      iv: CryptoJS.enc.Hex.parse(rawText.substr(saltLengthChars, ivLengthChars)),
      ciphertext: rawText.substring(saltLengthChars + ivLengthChars)
    }
  }

  static decrypt(rawText, password) {
    const { salt, iv, ciphertext } = this.unformatEncrytionComponents(rawText);
    return this.decryptInternal(salt, iv, ciphertext, password);
  }
}
