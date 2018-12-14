/**
 * Controller Definition to encapsulate routes to work with validations
 */

const RequestObject = require('../entities/RequestObject');
const MemPool = require('../db/memPool');


class ValidationController {

    /**
     * Constructor to create a new ValidationController
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.memPool = new MemPool();
        this.requestValidation();
        this.validationRequest();
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
                    res.send(newReq);
                }


            }

        });
    }

}

/**
 * Exporting the ValidationController class
 */
module.exports = ValidationController;