const crypto = require("crypto");

const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY;
const IV_LENGTH = 16; // AES block size

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error("Encryption key must be 32 characters long.");
}

function encryptMessage(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decryptMessage(text) {
  if (!text || !text.includes(":")) return "[invalid message]";

  const [ivHex, encryptedText] = text.split(":");
  if (!ivHex || !encryptedText) return "[invalid format]";

  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedText, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = {
  encryptMessage,
  decryptMessage,
};
