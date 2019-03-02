const SHA256 = require('crypto-js/sha256');

/**
 * ブロックを生成するクラス
 */
class Block{
    /**
     * コンストラクタ
     * @param {number} index - 何番目のブロックかを表す
     * @param {string} timestamp - タイムスタンプ
     * @param {object} transactions - ブロックに格納したい何らかのデータ(トランザクション)
     * @param {string} previousHash - 前のブロックのハッシュ
     */
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0; // 追加
    }

    /**
     * ハッシュ値を算出
     */
    calculateHash(){
        // nounceをHashの計算対象に追加
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    /**
     * マイニングして、ブロックチェーンに入れられるようにする
     * @param {number} dificulty - マイニングの難易度
     */
    mineBlock(dificulty){
        while(this.hash.substring(0, dificulty) !== Array(dificulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("ブロックがマイニングされました。ハッシュ値は" + this.hash + "です");
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
        this.dificulty = 2; // これを増やすとマシンパワーが必要になる
    }

    /**
     * ブロックチェーンの最初のブロックを作成する
     */
    createGenesisBlock(){
        return new Block("01/01/2019", "Genesis Block", "0");
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
        newBlock.mineBlock(this.dificulty);
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
