const SHA256 = require('crypto-js/sha256');

/**
 * ブロックを生成するクラス
 */
class Block{
    /**
     * コンストラクタ
     * @param {number} index - 何番目のブロックかを表す
     * @param {string} timestamp - タイムスタンプ
     * @param {object} data - ブロックに格納したい何らかのデータ
     * @param {string} previousHash - 前のブロックのハッシュ
     */
    constructor(index, timestamp, data, previousHash = ''){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    /**
     * ハッシュ値を算出
     */
    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}

/**
 * ブロックを配列に格納し、"ブロックチェーン"を作るクラス
 */
class BlockChain{
    /**
     * コンストラクタ
     */
    constructor(){
        this.chain = [this.createGenesisBlock()];
    }

    /**
     * ブロックチェーンの最初のブロックを作成する
     */
    createGenesisBlock(){
        return new Block(0, "01/01/2019", "Genesis Block", "0");
    }

    /**
     * 最新のブロック(一つ前のブロック)を取得する
     */
    getLatestBlock(){
        return this.chain[this.chain.length -1];
    }

    /**
     * ブロックをブロックチェーンに追加する
     * @param {object} newBlock - 新たに追加したいブロックのオブジェクト
     */
    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }

    /**
     * ブロックの正当性を評価
     */
    isChainValid(){
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1]; // 一つ前のブロックを取得
            
            /**
             * ブロックのハッシュが改ざんされていないか、ハッシュを再算出して計算して確認
             */
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }
            
            /**
             * 前のブロックのハッシュと同一か確認
             */
            if(currentBlock.previousHash !== previousBlock.hash){
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
suyamaCoin.addBlock(new Block(1, "03/02/2019", {amount: 4}));
suyamaCoin.addBlock(new Block(2, "03/05/2019", {amount: 10}));

/**
 * 改ざんしてみる(= ブロックチェーンの整合性が取れなくなる)
 */
suyamaCoin.chain[1].data = {amount: 40};
suyamaCoin.chain[1].hash = suyamaCoin.chain[1].calculateHash();

console.log('ブロックチェーンは有効？' + suyamaCoin.isChainValid());
console.log(JSON.stringify(suyamaCoin, null, 4));