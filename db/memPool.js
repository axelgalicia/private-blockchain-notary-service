/*======= MemPool class =============
|  Class that represents the mempool |
====================================*/

const RequestObject = require('../entities/RequestObject');

class MemPool {
    constructor() {
        this.memPoolValid = [];
        this.memPool = [];
        this.timeoutRequests = [];
    }

    setTimeout(request) {
        this.timeoutRequests[request.walletAddress] =
            setTimeout(() => { this.removeValidationRequest(request.walletAddress) }, MemPool.TimeoutRequestsWindowTime);
    }

    // Add the request validation
    addRequestValidation(request) {
        let request = this.getExistingRequest(request);
        if (request) {
            console.log(exist);
        } else {
            this.setTimeout(request);
        }
    }

    // Remove the request from the mempool
    removeValidationRequest(walletAddress) {
        // this.timeoutRequests = this.timeoutRequests.filter(r => r.walletAddress !== walletAddress);
        console.log(`Remove request with address: ${walletAddress}`);

    }

    getExistingRequest(request) {
        if (this.timeoutRequests.includes(request.walletAddress)) {
            return this.timeoutRequests[request.walletAddress];
        }
        return null;
    }


}

MemPool.TimeoutRequestsWindowTime = 3000;
module.exports = MemPool;