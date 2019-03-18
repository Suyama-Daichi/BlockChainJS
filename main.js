const SHA256 = require('crypto-js/sha256');

/**
 * ブロックを生成するクラス
 */
class Block {
    /**
     * コンストラクタ
     * @param {number} index - 何番目のブロックかを表す
     * @param {string} timestamp - タイムスタンプ
     * @param {object} data - ブロックに格納したい何らかのデータ
     * @param {string} previousHash - 前のブロックのハッシュ
     * @param {number} nonce - ナンス
     */
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
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
        return SHA256(this.index +
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.data) +
            this.nonce
        ).toString();
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
        this.difficulty = 2;
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
    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
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
}

/**
 * 実行
 */
let suyamaCoin = new BlockChain();
console.log('Mining block 1');
suyamaCoin.addBlock(new Block(1, "03/02/2019", { amount: 5 }));
console.log('Mining block 2');
suyamaCoin.addBlock(new Block(2, "03/05/2019", { amount: 10 }));