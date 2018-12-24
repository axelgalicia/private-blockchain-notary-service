# Private Blockchain Notary Service

Simple **REST** API which keeps a notary service using a private blockchain.

This project was created using **Express JS** framework to facilitate the creation of the REST API.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

- Node JS ( Tested with v11.2.0)

### Installing

In order to install all the required libraries please use the commands bellow:

Install Node Modules

```
npm install
```

### How to use

Please use the commands bellow to start the REST API service

Start the service

```
$ node app.js
Server Listening for port: 8000
```

The service will run on port 8000 by default

### End-Points

**POST** /requestValidation

**Parameters**

|  Parameter | Type   | Description 
|---|---|---|
| address  |  Body Parameter | A valid Bitcoin wallet address |

**Response Codes**

| Code | Description 
|---|---|
| 200 | The validation request was accepted or still valid. |
| 404 | The resource it is not found |
| 500 | A server error. |

If the request was accepted or it still valid it will be retrieved with the current validation window.
By default, this validation request will be in the temporal pool for 5 minutes.

```
-- Retrieving the validation request based on wallet address

$ curl -X POST \
  http://localhost:8000/requestValidation \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
	"address": "16RJpWohWazP4DuZwRjvxph9DG9qrE7Rym"
}'

```
Response 200
```

{
    "walletAddress": "16RJpWohWazP4DuZwRjvxph9DG9qrE7Rym",
    "requestTimeStamp": "1545616805",
    "message": "16RJpWohWazP4DuZwRjvxph9DG9qrE7Rym:1545616805:starRegistry",
    "validationWindow": 300
}

```

**POST** /message-signature/validate

**Parameters**

|  Parameter | Type   | Description 
|---|---|---|
| address  |  Payload Parameter | Valid Bitcoin address |
| signature | Payload Parameter | A valid signature of the message received by the previous endpoint. |

**Response Codes**


| Code | Description
|---|---|
| 200  | The signature was approved and the request was stored in the valid mempool for 30 min.
| 400 | A bas request has been made to create a new block.
| 500 | A server error

If the signature is valid, then the user will see the a valid status to submit a new star.

```
-- Submitting Valid Signature for validation

$ curl -X POST \
  http://localhost:8000/message-signature/validate \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
	"address":"16RJpWohWazP4DuZwRjvxph9DG9qrE7Rym",
	"signature": "H7YJPplRPzwLLULnNp80jeS1y8XE5RUXr0re4AlIIWh+R2BR7gZX+70OyV5YvG5UmYODxqoJccseEwgKkb0+Y1k="
}'

```
Response 200

```
{
    "registerStar": true,
    "status": {
        "address": "16RJpWohWazP4DuZwRjvxph9DG9qrE7Rym",
        "requestTimeStamp": "1545616805",
        "message": "16RJpWohWazP4DuZwRjvxph9DG9qrE7Rym:1545616805:starRegistry",
        "validationWindow": 279,
        "messageSignature": true
    }
}

```

**POST** /block

**Parameters**

|  Parameter | Type   | Description 
|---|---|---|
| address  |  Payload Parameter | Valid Bitcoin address |
| star | Payload Parameter | A valid star object |

**Response Codes**


| Code | Description
|---|---|
| 200  | If the star is being accepted then it is stored and retrieved as a response.
| 400 | A bas request has been made to create a new block.
| 500 | A server error

If the star submitted is valid request it is stored in the private blockchain and then returned.

```
-- Submitting Valid star

$ curl -X POST \
  http://localhost:8000/block \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
"address": "16RJpWohWazP4DuZwRjvxph9DG9qrE7Rym",
    "star": {
            "dec": "68° 52'\'' 56.6",
            "ra": "16h 29m 1.0s",
            "story": "Romeo Santos"
        }
}'

```
Response 200

```
{
    "hash": "705c154c4ed7774a96c8fa08897554d97fc242acf75a6ef776fb5fff7a08eab8",
    "height": 8,
    "body": {
        "address": "16RJpWohWazP4DuZwRjvxph9DG9qrE7Rym",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.6",
            "story": "526f6d656f2053616e746f73",
            "storyDecoded": "Romeo Santos"
        }
    },
    "time": "1545616846",
    "previousBlockHash": "cd56e509d596caa3ad63a3e40bcd9c93f41fce1286cc4e8bf544e1a48bdc32ed"
}

```



**GET** /stars/hash:[hash]

**Parameters**

|  Parameter | Type   | Description 
|---|---|---|
| hash  |  Path Parameter | Valid block hash |

**Response Codes**


| Code | Description
|---|---|
| 200  | A block with the hash passed is returned. |
| 400 | A bas request has been made to create a new block.
| 500 | A server error

If the hash exist in the private blockchain, the block will be returned.

```
-- Getting a block by hash

$ curl -X GET \
  http://localhost:8000/stars/hash:705c154c4ed7774a96c8fa08897554d97fc242acf75a6ef776fb5fff7a08eab8 \
  -H 'cache-control: no-cache'

```
Response 200

```
{
    "hash": "705c154c4ed7774a96c8fa08897554d97fc242acf75a6ef776fb5fff7a08eab8",
    "height": 8,
    "body": {
        "address": "16RJpWohWazP4DuZwRjvxph9DG9qrE7Rym",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.6",
            "story": "526f6d656f2053616e746f73",
            "storyDecoded": "Romeo Santos"
        }
    },
    "time": "1545616846",
    "previousBlockHash": "cd56e509d596caa3ad63a3e40bcd9c93f41fce1286cc4e8bf544e1a48bdc32ed"
}

```




**GET** /stars/address:[address]

**Parameters**

|  Parameter | Type   | Description 
|---|---|---|
| address  |  Path Parameter | Valid Bitcoin address |

**Response Codes**


| Code | Description
|---|---|
| 200  | A block with the address passed is returned. |
| 400 | A bas request has been made to create a new block.
| 500 | A server error

If the address passed has stars registered they will be returned.

```
-- Getting a block by hash

$ curl -X GET \
  http://localhost:8000/stars/address:16RJpWohWazP4DuZwRjvxph9DG9qrE7Rym \
  -H 'cache-control: no-cache'

```
Response 200

```
[
    {
        "hash": "705c154c4ed7774a96c8fa08897554d97fc242acf75a6ef776fb5fff7a08eab8",
        "height": 8,
        "body": {
            "address": "16RJpWohWazP4DuZwRjvxph9DG9qrE7Rym",
            "star": {
                "ra": "16h 29m 1.0s",
                "dec": "68° 52' 56.6",
                "story": "526f6d656f2053616e746f73",
                "storyDecoded": "Romeo Santos"
            }
        },
        "time": "1545616846",
        "previousBlockHash": "cd56e509d596caa3ad63a3e40bcd9c93f41fce1286cc4e8bf544e1a48bdc32ed"
    }
]

```

**GET** /block/[height]

**Parameters**

|  Parameter | Type   | Description 
|---|---|---|
| height  |  Path Parameter |A block height to search |

**Response Codes**


| Code | Description
|---|---|
| 200  | A block with the height passed is returned. |
| 400 | A bas request has been made to create a new block.
| 500 | A server error

If the height passed exist, it will be returned.

```
-- Getting a block by height

$ curl -X GET \
  http://localhost:8000/block/8 \
  -H 'cache-control: no-cache'

```
Response 200

```
{
    "hash": "705c154c4ed7774a96c8fa08897554d97fc242acf75a6ef776fb5fff7a08eab8",
    "height": 8,
    "body": {
        "address": "16RJpWohWazP4DuZwRjvxph9DG9qrE7Rym",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.6",
            "story": "526f6d656f2053616e746f73",
            "storyDecoded": "Romeo Santos"
        }
    },
    "time": "1545616846",
    "previousBlockHash": "cd56e509d596caa3ad63a3e40bcd9c93f41fce1286cc4e8bf544e1a48bdc32ed"
}

```


### Logs

Any time the user calls an end-point it is being logged in the application console. 
Describing which end-point was called and the time it took.

### Storage of the blockchain
The blocklchain is being saved in a folder called **privatechain** which will be created when the blockchain is initialized.

## Versioning

| Version | Status
|---|---|
|0.0.1| Stable

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/axelgalicia/private-blockchain-service/tags). 

## Authors

* **Axel Galicia** - *Based on my project* - [PrivateBlockchain](https://github.com/axelgalicia/blockchain-private-blockchain)
axelgalicia@gmail.com


## License

This project is licensed under the MIT License
