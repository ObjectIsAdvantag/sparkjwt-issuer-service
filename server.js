//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//


const debug = require("debug")("sparkjwt");

//
// HTTP Service
//
const express = require("express");
const app = express();

// Let's mimic Cisco Spark API headers
app.set("x-powered-by", false);
app.set("etag", false);
const uuid = require('uuid/v4');
app.use(function (req, res, next) {
    res.setHeader("Cache-Control", "no-cache");

    // New Trackingid
    res.locals.trackingId = "JWT_" + uuid();
    res.setHeader("Trackingid", res.locals.trackingId);

    next();
});


//
// Healthcheck
//
app.locals.started = new Date(Date.now()).toISOString();
var props = require('./package.json');
app.get("/", function (req, res) {
    res.status(200).send({
        "service": "Spark JWT Issuer",
        "description": props.description,
        "version": props.version,
        "up-since": app.locals.started,
        "creator": props.author,
        "code": "https://github.com/ObjectIsAdvantag/sparkjwt-issuer_service",
        "resources": [
            "/jwt/issuer"
        ]
    });
});


// 
// Main: Issuer Resource
//

// default routing properties to mimic Cisco Spark
const API = express.Router({ "caseSensitive": true, "strict": false });
app.use("/jwt/issuer", API);

// for parsing application/json
const bodyParser = require("body-parser");
API.use(bodyParser.json());

// Extra imports 
const sendError = require('./utils').sendError;
const sendSuccess = require('./utils').sendSuccess;

// JWT utility with HMAC SHA256 support
const jwt = require('jsonwebtoken')

API.post("/", function (req, res) {
    // Check Media type
    const media = req.get("Content-Type");
    if (!media) {
        debug("no Content-Type specified");
        return sendError(res, 415, "Content type 'text/plain' not supported");
    }
    if (!media.startsWith("application/json")) {
        debug(`bad 'Content-Type' specified: '${media}'`);
        return sendError(res, 415, `Content type '${media}' not supported`);
    }

    // Check incoming payload
    const incoming = req.body;
    if (!incoming) {
        return sendError(res, 400);
    }
    const appid = incoming.appid;
    if (!appid) {
        debug("Missing appid");
        return sendError(res, 400, "Missing appId.");
    }
    const secret = incoming.secret;
    if (!secret) {
        debug("Missing secret");
        return sendError(res, 400, "Missing secret.");
    }
    const userid = incoming.userid;
    if (!userid) {
        debug("Missing userid");
        return sendError(res, 400, "Missing userid.");
    }
    const username = incoming.username;
    if (!username) {
        debug("Missing username");
        return sendError(res, 400, "Missing username.");
    }

    // Forge issuer token
    try {

        const payload = {
            "sub": userid,
            "name": username,
            "iss": appid
        }

        const decoded = Buffer.from(secret, 'base64')

        const issuerToken = jwt.sign(payload, decoded, { algorithm: 'HS256', noTimestamp: true })

        debug("successfully built issuer JWT token" + issuerToken.substring(0, 50))

        sendSuccess(res, 200, {
            'token': issuerToken,
            'description': "this is a JWT issuer token, as such, you'll need to fetch an access token for Cisco Spark API /jwt/login resource"
        });
    }
    catch (err) {
        debug("failed to generate a JWT issuer token");
        debug("err: " + err);
        sendError(res, 500, "failed to generate a JWT issuer token");
    }
});


//
// Starting server
//
const port = process.env.PORT || 3210;
app.listen(port, function () {
    debug(`Spark JWT Issuer Service started on port: ${port}`);
    console.log(`Spark JWT Issuer Service started on port: ${port}`);
});
