/*======= MemPool class =============
|  Class that represents the mempool |
====================================*/
class MemPool {
    constructor() {
        this.mempool = [];
        this.timeoutRequests = [];
    }

    addRequestToPool(request) {
        this.timeoutRequests[request.walletAddress] = setTimeout(() => { this.removeValidationRequest(request.walletAddress) }, MemPool.TimeoutRequestsWindowTime);
    }

    removeValidationRequest(address) {
        console.log(`Remove Address: ${address}`);
    }

}


MemPool.TimeoutRequestsWindowTime = 3000;
module.exports = MemPool;