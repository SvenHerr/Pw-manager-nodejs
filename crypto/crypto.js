// This script runs on serverside

// https://attacomsian.com/blog/nodejs-encrypt-decrypt-data
import crypto from 'crypto';

const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);

export const encrypt = (text, secretKey) => {
  try {
    let key = crypto.scryptSync(secretKey, 'GfG', 32);
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = Buffer.concat([ cipher.update(text), cipher.final() ]);
    let returnObject = {
      iv : iv.toString('hex'),
      content : encrypted.toString('hex')
    };

    return JSON.stringify(returnObject);
  } catch (err) {
    console.log(err);
    return 'error';
  }
};

export const decrypt = (hashJson, secretKey) => {
  try {
    let hash = JSON.parse(hashJson);
    let key = crypto.scryptSync(secretKey, 'GfG', 32);
    let decipher =
        crypto.createDecipheriv(algorithm, key, Buffer.from(hash.iv, 'hex'));
    let decrpyted = Buffer.concat([
      decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()
    ]);

    return decrpyted.toString();
  } catch (err) {
    console.log(err);
    return 'error';
  }
};
