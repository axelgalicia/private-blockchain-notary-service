const SHA256 = require('crypto-js/sha256');
const Block = require('../entities/Block');
//Entities
const ResponseError = require('../entities/ResponseError');
const ErrorType = require('../entities/ErrorType');
//Services
const BlockService = require('../services/BlockService');
const hex2ascii = require('hex2ascii');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.blockService = new BlockService();
        this.getBlockByIndex();
        this.getBlockByHash();
        this.postNewBlock();
    }

    /**
     * GET Endpoint to retrieve a block by index, url: "/block/:index"
     */
    getBlockByIndex() {
        this.app.get("/block/:index", async (req, res) => {
            const { index } = req.params;
            const block = await this.blockService.getBlockByIndex(index).catch((e) => {
                let error = '';
                if (e === -1) {
                    error = new ResponseError(`The block with index ${index} does not exist`, ErrorType.PARAMETER);
                    ResponseError.printError(error);
                    res.status(404).json(error);
                } else {
                    console.log(e);
                    error = new ResponseError('There was an error to retrieve block');
                    ResponseError.printError(error);
                    res.status(500).json(error);
                }
            });
            res.status(200).json(block);
        });
    }

    /**
    * GET Endpoint to retrieve a block by hash, url: "/stars/[hash:[hash]]"
    */
    getBlockByHash() {
        this.app.get("/stars/:hash", async (req, res) => {
            const { hash } = req.params;
            const hashParameters = hash.split(':');
            const hashParameter = hashParameters[0];
            const hashValue = hashParameters[1];
            if (hashParameter !== 'hash' || !hashValue) {
                res.status(400).send('hash parameter is mandatory hash:[hash]');
            } else {
                let error = '';
                const block = await this.blockService.getBlockByHash(hashValue).catch((e) => {
                    console.log(e);
                    error = new ResponseError('There was an error to retrieve block');
                    ResponseError.printError(error);
                    res.status(500).json(error);

                });
                if (block === -1) {
                    error = new ResponseError(`The star with hash [${hashValue}] does not exist`, ErrorType.PARAMETER);
                    ResponseError.printError(error);
                    res.status(404).json(error);
                } else {
                    block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                    res.status(200).json(block);
                }

            }
        });
    }

    /**
     * POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.app.post("/block", async (req, res) => {
            const { body } = req.body;
            if (!body) {
                const error = new ResponseError('The body property is required to create a new block!', ErrorType.PAYLOAD);
                ResponseError.printError(error);
                res.status(400).json(error);
            } else {
                const block = await this.blockService.addNewBlock(new Block(body)).catch((e) => {
                    console.log(e);
                    const error = new ResponseError('There was an error creating a new block');
                    ResponseError.printError(error);
                    res.status(500).json(error);
                });
                res.status(200).json(block);
            }

        });
    }

}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app); }