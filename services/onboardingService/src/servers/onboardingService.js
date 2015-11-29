"use strict";

var express = require('express'),
    app = express(),
    http = require('http'),
    logger = require('winston'),
    errorHandling = require('../lib/middleware/errorHandling'),
    log = require('../lib/middleware/fileLogger'),
    MongoConnector = require("../modules/mongoConnector.js"),
    mongoConnector = new MongoConnector(logger),

    bodyParser = require('body-parser');
    //logger.add(logger.transports.File, { filename: 'quinjet.log', level: 'info',handleExceptions: true, maxsize: 5242880,maxFiles: 10});
/*Require all servlets */
var mongoUserConfig = "/etc/sokrati/db/asgard.cfg";
var subscriptionServlet = require('../servlets/subscriptionServlet');
var paywithServlet = require('../servlets/paywith');
var paymentServlet = require('../servlets/paymentServlet');
var merchantServlet = require('../servlets/merchantDetail');
var configuration, paypalExpress;
app.use(function(req, res, next) {
    try {
        var data='';
        req.setEncoding('utf8');
        req.on('data', function(chunk) {
           data += chunk;
        });
        req.on('end', function() {
            req.body = data;
            next();
        });
    }
    catch(err) {
        res.send({"error": err.message});
    }
});
exports.start = function(port) {
    /*
        connect to mongoDb via mongoose
    */
   /* mongoConnector.connect(
        mongoUserConfig,
        function (err, connection) {
            //Setting connection in dbAccessor.
            var wallDbAccessor = require("../models/wallDbAccess.js"),
                signupDb = new wallDbAccessor();
            signupDb.setConnection(connection);
            //Setting up collections models
            init();
        }
    );*/
    mongoConnector.connect(mongoUserConfig, function (err, connection) {
        logger.info("connected");
        var AsgardDbAccess = require("../models/asGuardDbAccess"),
            asgardDbAccess = new AsgardDbAccess();
            asgardDbAccess.setConnection(connection);
            var Configuration = require("../models/configuration");
            configuration = new Configuration();
            var PaypalExpress = require("../modules/paypalExpressCheckout");
            paypalExpress = new PaypalExpress();

        init();
    })
    /*
        initializing signup servlet
    */
    function init() {
        app.post(
            '/onboardingService/subscribe',
            subscriptionServlet.post(logger, configuration)
        );
        app.get(
            '/onboardingService/payWith',
            paywithServlet.get(logger, configuration)
        );
        app.get(
            '/onboardingService/merchantDetail',
            merchantServlet.get(logger, configuration)
        );
        app.post(
            '/onboardingService/payment',
            paymentServlet.post(logger, configuration, paypalExpress)
        );
        logger.log("info", "onboardingService has started on port: %s", port); 
        app.listen(port);
        /*
        * Finally Use the Error Handling Middleware to log any errors which may be 
        * thrown above
        */
        app.use(errorHandling.errorHandler);
    }
};
