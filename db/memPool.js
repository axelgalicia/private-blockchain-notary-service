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
        const timeLeft = this.getValidationWindow(requestObject);
        requestObject.validationWindow = timeLeft;
    }

    getValidationWindow(requestObject) {
        const timeElapse = this.getTimeStamp() - requestObject.requestTimeStamp;
        const timeLeft = (MemPool.TimeoutRequestsWindowTime / 1000) - timeElapse;
        return timeLeft;
    }

    // Remove the request from the mempool
    removeValidationRequest(walletAddress) {
        this.timeoutRequests = this.timeoutRequests.filter(r => r.walletAddress !== walletAddress);
    }
    // Returns true if the wallet address has submitted a request before
    isRequestInPool(walletAddress) {
        if (!!this.timeoutRequests[walletAddress]) {
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
        this.mempoolValid[walletAddress] = newReq; // Adds the new valid request to mempoolValid
        return newReq;
    }






}

MemPool.TimeoutRequestsWindowTime = 5 * 60 * 1000;
module.exports = MemPool;