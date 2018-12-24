/**
 * Controller Definition to encapsulate routes to work with validations
 */

const Star = require('../entities/Star');
const MemPool = require('../db/memPool');
const Block = require('../entities/Block');
//Services
const BlockService = require('../services/BlockService');
const hex2ascii = require('hex2ascii');


class ValidationController {

    /**
     * Constructor to create a new ValidationController
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.memPool = new MemPool();
        this.blockService = new BlockService();
        this.requestValidation();
        this.validationRequest();
        this.registerNewStar();
    }

    /**
     * POST Endpoint to submit a validation request
     */
    requestValidation() {
        this.app.post('/requestValidation', (req, res) => {
            const { address } = req.body;
            if (!address) {
                res.status(400).send('address parameter is mandatory');

            } else {
                const requestObject = this.memPool.addRequestValidation({ walletAddress: address });
                res.send(requestObject);
            }

        });
    }

    /**
     * POST Endpoint to send a validation request with a signed message
     */
    validationRequest() {
        this.app.post('/message-signature/validate', (req, res) => {
            const { address, signature } = req.body;
            if (!address || !signature) {
                res.status(400).send('The address and the signature are mandatory');
            } else {
                // Validate request
                const isValid = this.memPool.validateRequestByWallet(address, signature);
                if (!isValid) {
                    res.status(400).send('Not a valid signature or request');
                } else {
                    const newReq = this.memPool.addRequestToValidMempool(address);
                    if (!newReq) {
                        res.status(400).send('Request has expired, try with a new validation request');
                    }
                    res.send(newReq);
                }


            }

        });
    }

    /**
    * POST Endpoint to register a new start
    */
    registerNewStar() {
        this.app.post('/block', async (req, res) => {
            const { address, star } = req.body;
            if (!address || !star || !star.ra
                || !star.dec || !star.story) {
                res.status(400).send('address and star properties are mandatory');
            } else {
                // Validate valid request exist
                const validRequest = this.memPool.getExistingValidRequest(address);
                if (!validRequest) {
                    res.status(400).send('The request has expired or already used.');
                } else {
                    // Remove valid request from valid pool
                    this.memPool.removeValidationValidRequest(address);
                    // Create new Star object
                    const newStar = {address: address, star : new Star(star)};
                    // Add block
                    const newBlock = await this.blockService.addNewBlock(new Block(newStar));
                    // Add decoded story
                    newBlock.body.star.storyDecoded = hex2ascii(newBlock.body.star.story);
                    // Return block
                    res.send(newBlock);
                }

            }
        });
    }

}

/**
 * Exporting the ValidationController class
 */
module.exports = ValidationController;