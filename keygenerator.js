const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

/** キーを生成します */
const key = ec.genKeyPair();

/** 生成したキーから公開鍵を取得します */
const publicKey = key.getPublic('hex');

/** 生成したキーから秘密鍵を取得します */
const privateKey = key.getPrivate('hex');

/** 取得した秘密鍵と公開鍵を表示 */
console.log('Your public Key: ' + publicKey);
console.log('Your private Key: ' + privateKey);