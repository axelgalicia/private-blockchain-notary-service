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
    }

    /**
     * POST Endpoint to submit a validation request
     */
    requestValidation() {
        this.app.post('/requestValidation', (req, res) => {
            const { address } = req.body;
            const requestObject = this.memPool.addRequestValidation({ walletAddress: address });
            res.send(requestObject);
        });
    }

}

/**
 * Exporting the ValidationController class
 */
module.exports = ValidationController;