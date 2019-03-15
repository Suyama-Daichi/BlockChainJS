const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

/**
 * トランザクション型を追加
 */
class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    /**
     * トランザクションのハッシュを計算する
     */
    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount)
            .toString();
    }

    /**
     * トランザクションに署名する
     * @param {Object} signingKey キーペアオブジェクト
     */
    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if (this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }

}

/**
 * ブロックを生成するクラス
 */
class Block {
    /**
     * コンストラクタ
     * @param {string} timestamp - タイムスタンプ
     * @param {object} transactions - ブロックに格納したい何らかのデータ(トランザクション)
     * @param {string} previousHash - 前のブロックのハッシュ
     */
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    /**
     * ハッシュ値を算出
     */
    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    /**
     * マイニングして、ブロックチェーンに入れられるようにする
     * @param {number} dificulty - マイニングの難易度
     */
    mineBlock(dificulty) {
        while (this.hash.substring(0, dificulty) !== Array(dificulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("ブロックがマイニングされました。ハッシュ値は" + this.hash + "です");
    }

    /**
     * ブロック内のトランザクションに異常のあるものがないか確認
     */
    hasValidTransactions(){
        for (const tx of this.transactions){
            if (!tx.isValid()) {
                return false;
            }
        }
        return true;
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
        this.dificulty = 2;
        this.pendingTransactions = []; // 追加
        this.miningReward = 100; // 追加(=マイニング報酬)
    }

    /**
     * ブロックチェーンの最初のブロックを作成する
     */
    createGenesisBlock() {
        return new Block("01/01/2019", "Genesis Block", "0");
    }

    /**
     * 最新のブロック(一つ前のブロック)を取得する
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * ブロックチェーンに追加待ちのトランザクションをマイニングしてブロックチェーンに追加する
     * @param {string} miningRewardAddress - マイニングした人のアドレス
     */
    minePendingTransactions(miningRewardAddress) {
        let block = new Block(Date.now(), this.pendingTransactions)
        block.mineBlock(this.dificulty);

        console.log("マイニング成功！");
        this.chain.push(block)
        /**
         * 保留中のトランザクションにマイニングした人に報酬を与えるトランザクションを作成
         */
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    /**
     * ブロックチェーンに追加待ちのトランザクションを追加する
     * @param {Transaction} transaction - 追加したいトランザクションオブジェクト
     */
    addTransaction(transaction) {

        /** トランザクションには、送り主と受取人が必須 */
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include from and to address');
        }

        /** トランザクションに異常がないか確認 */
        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                // 送金する側は残高を減らす
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                // 受け取る側は、残高を増やす
                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }

    /**
     * ブロックの正当性を評価
     */
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1]; // 一つ前のブロックを取得


            /**
             * ブロックのトランザクションに異常がないか確認。異常があればFalseを返す
             */
            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            /**
             * ブロックのハッシュが改ざんされていないか、ハッシュを再算出して計算して確認。改ざんされていればFalseを返す
             */
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            /**
             * 前のブロックのハッシュと同一か確認。同一でなければFalseを返す
             */
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }


}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;