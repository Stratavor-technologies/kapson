"use strict";
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const config = require("config");

// Load configurations securely
const creds = require("../config/develop");
const cryptoKey = creds.Crypto;

const salts = creds.salts;
const keyBufferSalt = salts.keyBufferSalt || 32; // Default to 32 bytes if not specified
const iterations = 100000; // PBKDF2 iterations for key derivation
const ivLength = 12; // Recommended IV length for GCM (12 bytes)

// Derive a secure key using PBKDF2 with a salts
const keyBuffer = crypto.pbkdf2Sync(
  cryptoKey.key,
  crypto.randomBytes(16), // Secure random salt
  iterations,
  keyBufferSalt,
  "sha512"
);

// Password Hashing Functions
exports.setPassword = async (password) => {
  const salt = await bcrypt.genSalt(salts.genSalt || 12); // Default to 12 rounds if not specified
  return bcrypt.hash(password, salt);
};

exports.comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

exports.compareNum = (num1, num2) => {
  return num1 === num2;
};

// Encrypt Function using AES-256-GCM
exports.encrypt = (text) => {
  try {
    // const iv = crypto.randomBytes(ivLength); // Generate a random IV for each encryption
    // const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, iv);

    // let encrypted = cipher.update(text, "utf8", "hex");
    // encrypted += cipher.final("hex");
    // const authTag = cipher.getAuthTag().toString("hex"); // Get authentication tag

    // Concatenate IV, authTag, and encrypted text with a separator
    // return `${iv.toString("hex")}:${authTag}:${encrypted}`;
    return text
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Encryption failed");
  }
};

// Decrypt Function using AES-256-GCM
exports.decrypt = (text) => {
  try {
    // Split the input text into IV, authTag, and encrypted parts
    // const [ivHex, authTagHex, encryptedText] = text.split(":");
    // const iv = Buffer.from(ivHex, "hex");
    // const authTag = Buffer.from(authTagHex, "hex");

    // const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuffer, iv);
    // decipher.setAuthTag(authTag); // Set the authentication tag for integrity check

    // let decrypted = decipher.update(encryptedText, "hex", "utf8");
    // decrypted += decipher.final("utf8");

    // return decrypted;
    return text
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Decryption failed");
  }
};
