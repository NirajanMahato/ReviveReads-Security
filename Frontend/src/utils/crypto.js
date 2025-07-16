import CryptoJS from "crypto-js";

const SECRET = import.meta.env.VITE_MESSAGE_SECRET_KEY;

export const encryptMessage = (text) => {
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(
    text,
    CryptoJS.enc.Utf8.parse(SECRET),
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  return iv.toString(CryptoJS.enc.Hex) + ":" + encrypted.toString();
};

export const decryptMessage = (cipherText) => {
  try {
    const [ivHex, encryptedText] = cipherText.split(":");
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const decrypted = CryptoJS.AES.decrypt(
      encryptedText,
      CryptoJS.enc.Utf8.parse(SECRET),
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error("Decryption failed:", err);
    return "[decryption failed]";
  }
};
