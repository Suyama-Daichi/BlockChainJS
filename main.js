const SHA256 = require('crypto-js/sha256');

/**
 * トランザクション型を追加
 */
class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

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
        this.nonce = 0;
    }

    /**
     * ハッシュ値を算出
     */
    calculateHash(){
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
        this.dificulty = 2;
        this.pendingTransactions = []; // 追加
        this.miningReward = 100; // 追加(=マイニング報酬)
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
     * ブロックチェーンに追加待ちのトランザクションをマイニングしてブロックチェーンに追加する
     * @param {string} miningRewardAddress - マイニングした人のアドレス
     */
    minePendingTransactions(miningRewardAddress){
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
    createTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                // 送金する側は残高を減らす
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }
                // 受け取る側は、残高を増やす
                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }
        return balance;
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

// ブロックチェーンに追加待ちのトランザクションを作成
suyamaCoin.createTransaction(new Transaction("address1", "address2", 100)); // address1からaddress2に100コイン送る
suyamaCoin.createTransaction(new Transaction("address2", "address", 30)); // 30コインのおつりを返す

// ブロックチェーンに追加待ちのトランザクションをマイニング！
console.log('\n マイニング開始');
suyamaCoin.minePendingTransactions('suyama\'s address');

console.log('\n Suyamaの残高は', suyamaCoin.getBalanceOfAddress('suyama\'s address'));

// ブロックチェーンに追加待ちのトランザクションをマイニング！
console.log('\n 再度マイニング開始');
suyamaCoin.minePendingTransactions('suyama\'s address');
console.log('\n Suyamaの残高は', suyamaCoin.getBalanceOfAddress('suyama\'s address'));
