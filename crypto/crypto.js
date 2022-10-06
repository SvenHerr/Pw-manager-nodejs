// This script runs on serverside

// https://attacomsian.com/blog/nodejs-encrypt-decrypt-data
const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);

const encrypt = (text, secretKey) => {
  try {
    const key = crypto.scryptSync(secretKey, 'GfG', 32);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([ cipher.update(text), cipher.final() ]);
    var returnObject = {
      iv : iv.toString('hex'),
      content : encrypted.toString('hex')
    };

    return JSON.stringify(returnObject);

  } catch (err) {
    console.log(err);
    return "error";
  }
};

const decrypt = (hashJson, secretKey) => {
  try {

    var hash = JSON.parse(hashJson);
    const key = crypto.scryptSync(secretKey, 'GfG', 32);
    const decipher =
        crypto.createDecipheriv(algorithm, key, Buffer.from(hash.iv, 'hex'));
    const decrpyted = Buffer.concat([
      decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()
    ]);

    return decrpyted.toString();

  } catch (err) {
    console.log(err);
    return "error";
  }
};

module.exports = {
  encrypt,
  decrypt
};