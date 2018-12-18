/*======= MemPool class =============
|  Class that represents the mempool |
====================================*/

const RequestObject = require('../entities/RequestObject');
const RequestObjectValidated = require('../entities/RequestObjectValidated');
const bitcoinMessage = require('bitcoinjs-message');

class MemPool {
    constructor() {
        this.mempoolValid = [];
        this.memPool = [];
        this.timeoutRequests = [];
        this.timeoutValidRequests = [];
    }

    // Adds the timeout for temporal mempool requests
    setTimeoutTemporalPool(walletAddress) {
        this.timeoutRequests[walletAddress] =
            setTimeout(() => { this.removeValidationRequest(walletAddress) }, MemPool.TimeoutRequestsWindowTime);
    }

    // Adds the timeout for valid mempool requests
    setTimeoutValidPool(walletAddress) {
        this.timeoutValidRequests[walletAddress] =
            setTimeout(() => { this.removeValidationRequest(walletAddress) }, MemPool.TimeoutValidRequestsWindowTime);
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
            this.setTimeoutTemporalPool(walletAddress);
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
        const timeLeft = this.getValidationWindow(requestObject);
        requestObject.validationWindow = timeLeft;
    }

    getValidationWindow(requestObject) {
        const timeElapse = this.getTimeStamp() - requestObject.requestTimeStamp;
        const timeLeft = (MemPool.TimeoutRequestsWindowTime / 1000) - timeElapse;
        return timeLeft;
    }

    // Remove the request from the temporal mempool
    removeValidationRequest(walletAddress) {
        this.timeoutRequests = this.timeoutRequests.filter(r => r.walletAddress !== walletAddress);
    }

    // Remove the request from the mempool
    removeValidationValidRequest(walletAddress) {
        this.timeoutValidRequests = this.timeoutValidRequests.filter(r => r.walletAddress !== walletAddress);
    }
    // Returns true if the wallet address has submitted a request before
    isRequestInPool(walletAddress) {
        if (!!this.timeoutRequests[walletAddress]) {
            return true;
        }
        return false;
    }

    // Returns true if the wallet address has a valid request in the mempool
    isValidRequestInPool(walletAddress) {
        if (!!this.timeoutValidRequests[walletAddress]) {
            return true;
        }
        return false;
    }

    // Return the exiting request from the temporal mempool
    getExistingRequest(request) {
        if (this.isRequestInPool(request.walletAddress)) {
            return this.memPool[request.walletAddress];
        }
        return null;
    }

    // Return the exiting request from the valid mempool
    getExistingValidRequest(address) {
        if (this.isValidRequestInPool(address)) {
            return this.mempoolValid[address];
        }
        return null;
    }

    // Validates if the signature provided correspond to the wallet address
    validateRequestByWallet(walletAddress, signature) {
        const request = this.getExistingRequest({ walletAddress: walletAddress });
        if (!request) {
            return false;
        }
        let isValid = bitcoinMessage.verify(request.message, walletAddress, signature);
        return isValid;
    }

    addRequestToValidMempool(walletAddress) {
        const request = this.getExistingRequest({ walletAddress: walletAddress });
        if (!request) {
            return false;
        }
        const { requestTimeStamp, message } = request;
        const validationWindow = this.getValidationWindow(request);
        const newReq = new RequestObjectValidated(walletAddress, requestTimeStamp, message, validationWindow);
        this.removeValidationRequest(walletAddress); // Removes the request from temporal memPool
        this.setTimeoutValidPool(walletAddress); // Adds the timeout for a valid request
        this.mempoolValid[walletAddress] = newReq; // Adds the new valid request to mempoolValid
        return newReq;
    }

    encodeStory(body) {

    }

}

MemPool.TimeoutRequestsWindowTime = 5 * 60 * 1000; // 5 min
MemPool.TimeoutValidRequestsWindowTime = 30 * 60 * 1000; // 30 min
module.exports = MemPool;