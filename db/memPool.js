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

    setTimeout(walletAddress) {
        this.timeoutRequests[walletAddress] =
            setTimeout(() => { this.removeValidationRequest(walletAddress) }, MemPool.TimeoutRequestsWindowTime);
    }

    // Add the request validation
    addRequestValidation(request) {
        const { walletAddress } = request;
        const isRequestInPool = this.isRequestInPool(walletAddress);
        if (isRequestInPool) {
             const cachedRequest = this.memPool[walletAddress];
             this.setValidationWindow(cachedRequest); 
            return cachedRequest;
        } else {
            this.setTimeout(walletAddress);
            const newRequest = new RequestObject(walletAddress, this.getTimeStamp());
            this.memPool[walletAddress] = newRequest;
            this.setValidationWindow(newRequest);
            return newRequest;
        }
    }

    getTimeStamp() {
        return new Date().getTime().toString().slice(0, -3);
    }

    setValidationWindow(requestObject) {
        const timeElapse = this.getTimeStamp() - requestObject.requestTimeStamp;
        const timeLeft = (MemPool.TimeoutRequestsWindowTime / 1000) - timeElapse;
        requestObject.validationWindow = timeLeft;
    }

    // Remove the request from the mempool
    removeValidationRequest(walletAddress) {
        this.timeoutRequests = this.timeoutRequests.filter(r => r.walletAddress !== walletAddress);
        console.log(`Removing request with address: ${walletAddress}`);

    }

    isRequestInPool(walletAddress) {
        if (!!this.timeoutRequests[walletAddress]) {
            return true;
        }
        return false;
    }

    getExistingRequest(request) {
        if (this.isRequestInPool()) {
            return this.memPool[request.walletAddress];
        }
        return null;
    }


}

MemPool.TimeoutRequestsWindowTime = 5*60*1000;
module.exports = MemPool;