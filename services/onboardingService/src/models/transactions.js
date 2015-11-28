var asGuardDbAccessor = require("./asGuard.js"),
    util = require('util');

function Transaction() {
    var COLLECTION_NAME = "transactions";

    var paymentOption =
        new asGuardDbAccessor.prototype.connection.Schema(
            {
                "transactionId": {
                    type: String,
                    required: true,
                    trim: true
                },
                "amount": {
                    type: Boolean,
                    required: true,
                    trim: true
                },
                "paymentStatus": {
                    type: String,
                    required: true,
                    trim: true
                },
                "_id": false
            }
        );

    
    var transactionSchema = {
        "transactionId": {
            type: String,
            required: true,
            trim: true
        },
        "amount": {
            type: Boolean,
            required: true,
            trim: true
        },
        "paymentStatus": {
            type: String,
            required: true,
            trim: true
        },
        "transactionType": {
            type: String,
            required: true,
            trim: true
        },
        "transactionDetails": {
            type: String,
            required: true,
            trim: true
        },
        "_id": false
    }

    var TransactionModel = asGuardDbAccessor.prototype.connection.model(
                                 COLLECTION_NAME, transactionSchema
                             );

    this.saveToDb = function (request, callBack) {
        var keys = Object.keys(request);
        var doc = {};

        for(var i = 0; i < keys.length; i++) {
            doc[keys[i]] = request[keys[i]];
        }

        var toSave = new TransactionModel(doc);
        toSave.save(function (err, savedResponse, numberAffected) {
            var error = null;
            if (err) {
                util.log("[ERROR] err: " + err)
                if (err["name"] == "ValidationError") {
                    error = err.message;
                } else {
                    error = "Internal error while saving.";
                }
                toSave.set("status", "FAILED", {
                    strict: false
                });
                toSave.set("error", error, {
                    strict: false
                });
                callBack("[ERROR] Error while saving in DB.", null);
            } else {
                savedResponse.set("status", "SUCCESS", {
                    strict: false
                });
            }
            callBack(null, savedResponse == undefined ? toSave : savedResponse);
        });
    }

    this.updateToDb = function(selectionObj, updateObj, callback) {
        TransactionModel.find(selectionObj, function (err, doc) {
            if (err) {
                util.log( "[ERROR]" + err.message);
                callback(err.message, null);
            } else {
                TransactionModel.update(selectionObj, {
                    $set: updateObj
                }, function (err, doc) {
                    if (err) {
                        util.log( "[ERROR]" + err.message);
                        callback(err.message, null);
                    }else {
                        util.log("[INFO] Document Updated");
                        callback(null,doc);
                    }
                });
            }
        });
    }

    this.getFromDb = function(selectionObj, callback) {
        util.log("[INFO] getFromDb");
        TransactionModel.find(selectionObj, function (err, doc) {
            if (err) {
                util.log("[ERROR] getFromDb: " + err.message);
                callback(err.message, null);
            }
            else {
                util.log("[INFO] getFromDb successful");
                callback(null, doc);
            }
        });
    }
    this.TransactionModel = TransactionModel;
}
util.inherits(Configuration, asGuardDbAccessor);
module.exports = Configuration;
