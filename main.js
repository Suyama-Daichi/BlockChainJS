const {BlockChain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('fb2999acc70f553bf5f10a785bb8010a408c7e20d0c83b09ca3c6b96f03a3c39');
const myWalletAddress = myKey.getPublic('hex');

/**
 * 実行
 */
let suyamaCoin = new BlockChain();

/**
 * トランザクションを作成
 * 自分のアドレスから〇〇に10コイン送る
 */
const tx1 = new Transaction(myWalletAddress, 'public key of recipient', 10);

/** トランザクションに署名 */
tx1.signTransaction(myKey);

/** トランザクションを追加 */
suyamaCoin.addTransaction(tx1);

/** マイニング */
suyamaCoin.minePendingTransactions(myWalletAddress);

console.log('Balance of Suyama is', suyamaCoin.getBalanceOfAddress(myWalletAddress));

// // ブロックチェーンに追加待ちのトランザクションを作成
// suyamaCoin.createTransaction(new Transaction("address1", "address2", 100)); // address1からaddress2に100コイン送る
// suyamaCoin.createTransaction(new Transaction("address2", "address", 30)); // 30コインのおつりを返す

// // ブロックチェーンに追加待ちのトランザクションをマイニング！
// console.log('\n マイニング開始');
// suyamaCoin.minePendingTransactions('suyama\'s address');

// console.log('\n Suyamaの残高は', suyamaCoin.getBalanceOfAddress('suyama\'s address'));

// // ブロックチェーンに追加待ちのトランザクションをマイニング！
// console.log('\n 再度マイニング開始');
// suyamaCoin.minePendingTransactions('suyama\'s address');
// console.log('\n Suyamaの残高は', suyamaCoin.getBalanceOfAddress('suyama\'s address'));
