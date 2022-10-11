// This script runs on serverside

// Checking the crypto module
import crypto from "crypto";
const algorithm = "aes-256-cbc"; // Using AES encryption
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
// const hash = crypto.createHash('sha256');
const salt = "f844b09ff50c";

// console.log(crypto.randomBytes(16));

export default {
    // Encrypting text
    encrypt: function (text) {
        let cipher = crypto.createCipheriv(
            "aes-256-cbc",
            Buffer.from(key),
            Buffer.from(iv)
        );
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted.toString("hex");
    },

    // Decrypting text
    decrypt: function (text) {
        let iv = Buffer.from(text.iv, "hex");
        let encryptedText = Buffer.from(text.encryptedData, "hex");
        let decipher = crypto.createDecipheriv(
            "aes-256-cbc",
            Buffer.from(key),
            iv
        );
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    },

    // function createCipher(algorithm: CipherCCMTypes, password: BinaryLike,
    // options: CipherCCMOptions): CipherCCM;
    encryptDepr: function (text, password) {
        let cipher = crypto.createCipher(algorithm, password);
        let crypted = cipher.update(text, "utf8", "binary");
        crypted += cipher.final("binary");
        return crypted;
    },

    decryptDepr: function (text, password) {
        let decipher = crypto.createDecipher(algorithm, password);
        let dec = decipher.update(text, "binary", "utf8");
        dec += decipher.final("utf8");
        return dec;
    },

    hashPw: function (pw) {
        let hasher = (password) => {
            let hash = crypto.createHmac("sha256", salt);
            hash.update(password);
            let value = hash.digest("hex");
            return { hashedpassword: value };
        };

        let hash = (password) => {
            if (password == null || salt == null) {
                throw new Error("Must Provide Password and salt values");
            }
            if (typeof password !== "string" || typeof salt !== "string") {
                throw new Error(
                    "password must be a string and salt must either be a salt string or a number of rounds"
                );
            }
            return hasher(password);
        };

        return hash(pw).hashedpassword;
    },
};
