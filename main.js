const SHA256 = require('crypto-js/sha256');

/**
 * ブロックを生成するクラス
 */
class Block {
    /**
     * コンストラクタ
     * @param {string} timestamp - タイムスタンプ
     * @param {string} previousHash - 前のブロックのハッシュ
     * @param {number} nonce - ナンス
     */
    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("BLOCK MINED: " + this.hash);
    }

    /**
     * ハッシュ値を算出
     */
    calculateHash() {
        return SHA256(
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.transactions) +
            this.nonce
        ).toString();
    }
}

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

/**
 * ブロックを配列に格納し、"ブロックチェーン"を作るクラス
 */
class BlockChain {
    /**
     * コンストラクタ
     */
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 5;

        this.pendingTransactions = [];

        this.miningReward = 100;
    }

    /**
     * ブロックチェーンの最初のブロックを作成する
     */
    createGenesisBlock() {
        return new Block(0, "01/01/2019", "Genesis Block", "0");
    }

    /**
     * 最新のブロック(一つ前のブロック)を取得する
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * ブロックをブロックチェーンに追加する
     * @param {object} newBlock - 新たに追加したいブロックのオブジェクト
     */
    createTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    /** マイニング待ち(ブロックに追加される前)のトランザクションをマイニングする */
    minePendingTransactions(miningRewardAddress) {
        /** ブロックを生成 */
        let block = new Block(Date.now(), this.pendingTransactions);

        /** マイニング */
        block.mineBlock(this.difficulty);

        /** マイニングしたブロックをチェーンに追加 */
        this.chain.push(block);

        /** マイナーに報酬を支払うトランザクションをマイニング待ちに作成 */
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    /** 
     * チェーンの妥当性があるかをチェック
     */
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            /** hashのみ改ざんされていたらfalseを返す */
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            /** 前後のハッシュ値を比較して、何かしらが改ざんされていたらfalseを返す */
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    /** 残高を取得 */
    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            /** ブロックに格納されているトランザクションの配列の中をチェック */
            for (const tran of block.transactions) {
                /** トランザクションのfromAddress(送金者)が確認したい残高のアドレスと一致したらそのトランザクションのamount分を引く */
                if (tran.fromAddress == address) {
                    balance -= tran.amount;
                }
                /** トランザクションのtoAddress(受け取るアドレス)が確認したい残高のアドレスと一致したらそのトランザクションのamount分を足す */
                if (tran.toAddress === address) {
                    balance += tran.amount;
                }
            }
        }
        return balance;
    }

}

/**
 * 実行
 */
let suyamaCoin = new BlockChain();

console.log('Creating some transactions...');
// トランザクションの作成
suyamaCoin.createTransaction(new Transaction('address1', 'address2', 100));
suyamaCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('Starting the miner...');
// 上記で作成したトランザクションをマイニング
suyamaCoin.minePendingTransactions('xaviers-address');

console.log('Balance of Xaviers address is', suyamaCoin.getBalanceOfAddress('xaviers-address'));

/** マイニング報酬分は保留トランザクションに入ったままなので、再度マイニングする */
console.log('Starting the miner again!');
suyamaCoin.minePendingTransactions("xaviers-address");

console.log('Balance of Xaviers address is', suyamaCoin.getBalanceOfAddress('xaviers-address'));