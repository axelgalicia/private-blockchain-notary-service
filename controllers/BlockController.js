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
        this.getBlockByQuery();
        //this.postNewBlock();
    }

    /**
     * GET Endpoint to retrieve a block by index, url: "/block/:height"
     */
    getBlockByIndex() {
        this.app.get("/block/:height", async (req, res) => {
            const { height } = req.params;

            let error = '';
            const block = await this.blockService.getBlockByQueryParameter('height', height).catch((e) => {
                console.log(e);
                error = new ResponseError('There was an error to retrieve block');
                ResponseError.printError(error);
                res.status(500).json(error);

            });
            if (block === -1) {
                error = new ResponseError(`There are no stars with ${queryParameter} [${queryValue}]`, ErrorType.PARAMETER);
                ResponseError.printError(error);
                res.status(404).json(error);
            } else {

                if (height !== '0') {
                    block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                }
                res.status(200).json(block);
            }

        });
    }

    /**
    * GET Endpoint to retrieve a block by hash, url: "/stars/[hash:[hash]]"
    */
    getBlockByQuery() {
        this.app.get("/stars/:query", async (req, res) => {
            const { query } = req.params;
            const queryParameters = query.split(':');
            const queryParameter = queryParameters[0];
            const queryValue = queryParameters[1];
            if (queryParameter !== 'hash' & queryParameter !== 'address' | !queryValue) {
                res.status(400).send('query parameter is mandatory hash:[hash], address:[address]');
            } else {
                let error = '';
                const blocks = await this.blockService.getBlockByQueryParameter(queryParameter, queryValue).catch((e) => {
                    console.log(e);
                    error = new ResponseError('There was an error to retrieve block');
                    ResponseError.printError(error);
                    res.status(500).json(error);

                });
                if (blocks === -1) {
                    error = new ResponseError(`There are no stars with ${queryParameter} [${queryValue}]`, ErrorType.PARAMETER);
                    ResponseError.printError(error);
                    res.status(404).json(error);
                } else {

                    if (Array.isArray(blocks)) {
                        blocks.forEach(block => {
                            block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                        });
                    } else {
                        blocks.body.star.storyDecoded = hex2ascii(blocks.body.star.story);
                    }

                    res.status(200).json(blocks);
                }

            }
        });
    }

    /**
     * POST Endpoint to add a new Block, url: "/api/block"   FOR TESTING
     */
    /* postNewBlock() {
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
     } */

}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app); }