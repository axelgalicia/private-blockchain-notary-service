/* =============== Block Service =================
|         Class to access Blockchain             |
|===============================================*/

const BlockChain = require('../models/Blockchain');

class BlockService {

    constructor() {
        this.blockchain = null;
    }
    // Initializes the Blockchain
    async initBlockchain() {
        if (this.blockchain === null) {
            this.blockchain = await BlockChain.initBlockchain();
            return this.blockchain;
        }
        return this.blockchain;
    }

    // Get the Blockchain instance
    async getBlockchain() {
        return await this.initBlockchain();
    }

    // Look up for the block by index
    async getBlockByIndex(index) {
        let block = {};
        let bc = await this.getBlockchain();
        block = await bc.getBlock(index);
        const blockObject = BlockChain.getBlockFromString(block);
        return blockObject;
    }

    // Look up for the block by block hash
    async getBlockByHash(hash) {
        let block = {};
        let bc = await this.getBlockchain();
        block = await bc.getBlockByHash(hash);
        const blockObject = BlockChain.getBlockFromString(block);
        return blockObject;
    }

    // Look up for the block by wallet address
    async getBlockByAddress(address) {
        let blocks = [];
        let bc = await this.getBlockchain();
        blocks = await bc.getBlockByWalletAddress(address);
        return blocks;
    }


    // Look up for the block by query parameter
    async getBlockByQueryParameter(queryParameter, queryValue) {
        switch (queryParameter) {
            case 'hash': return await this.getBlockByHash(queryValue);
            case 'walletaddress': return await this.getBlockByAddress(queryValue);
            case 'height': return await this.getBlockByIndex(queryValue).catch(() => { return -1 });
            default: return -1;
        }
    }

    // Creates a new Block
    async addNewBlock(block) {
        let newBlock = {};
        try {
            let bc = await this.getBlockchain();
            newBlock = await bc.addBlock(block);
        } catch (e) {
            throw new Error(e);
        }
        return BlockChain.getBlockFromString(newBlock);
    }
}

module.exports = BlockService;