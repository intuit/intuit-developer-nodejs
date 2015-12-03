/**
 * Created by sram on 7/6/15.
 */
/**
 * Created by sram on 7/6/15.
 */
var express     = require('express');
var request     = require('request');
var qs          = require ('querystring');
var router      = express.Router();
var mongoose    = require('mongoose');
var QuickBooks  = require('../quickbooks_index');
var qbModel        = require ('../models/quickbooks_model');
var PropertyReader  = require('properties-reader');
var properties      = PropertyReader("./properties");
var qbosetup       = require ('../helpers/qbo_setup');
var app          = require ('../app');
var qboauth;


/**
 * Deals with the oauth flows
 */

var consumerKey    = properties.get('consumerKey'),
    consumerSecret = properties.get('consumerSecret');

console.log ("****", consumerKey, consumerSecret);

var port = process.env.PORT || '3000';

/**
 * The start route for starting oauth
 */
router.get('/', function (req,res,next) {
    // see if the email address already has realms
    // or if oauth needs to happen

    var email = req.user.emails[0].value;
    req.session.email = email;
    console.log (req.session.email);

    if (email == undefined) {
        console.log("email is empty");
    } else {

        // find out if realm exists tied to this email
        var query = qbModel.qbo.where({userid: email});
        query.findOne(function (err, profile) {
            if (err) {
                console.log(err);
            } else {
                console.log("profile is", profile);
                if (profile == null) {
                    // start oauth flows
                    res.redirect('/quickbooks/start');
                }
                else {
                    console.log("found user", profile);
                    qbosetup.qboSetup(profile.token, profile.tokenSecret, profile.realmid, req.session.email, function (qboa) {
                        console.log("++++ QBO set", qboa);
                        res.render('importdata');
                    });

                }
            }
        });
        };
    });

router.get('/start', function(req, res, next) {
    res.render('qboauth', {port: port, appCenter: QuickBooks.APP_CENTER_BASE, pageTitle: "Log in"})
});
/**
 * requestToken.. called by the oauth flows
 */

router.get('/requestToken', function (req, res) {
        var postBody = {
            url: QuickBooks.REQUEST_TOKEN_URL,
            oauth: {
                callback: 'http://localhost:' + port + '/quickbooks/callback/',
                consumer_key: consumerKey,
                consumer_secret: consumerSecret
            }
        };
        request.post(postBody, function (e, r, data) {
            var requestToken = qs.parse(data);
            req.session.oauth_token_secret = requestToken.oauth_token_secret;
            console.log(requestToken);
            res.redirect(QuickBooks.APP_CENTER_URL + requestToken.oauth_token)
        });
    });

/**
 * callback when flows are completed
 */

router.get('/callback', function (req, res) {
    var postBody = {
        url: QuickBooks.ACCESS_TOKEN_URL,
        oauth: {
            consumer_key: consumerKey,
            consumer_secret: consumerSecret,
            token: req.query.oauth_token,
            token_secret: req.session.oauth_token_secret,
            verifier: req.query.oauth_verifier,
            realmId: req.query.realmId
        }
    }
    request.post(postBody, function (e, r, data) {
        var accessToken = qs.parse(data);
        console.log ("CALLBACK====================")
        console.log(accessToken);
        console.log(postBody.oauth.realmId);

        // save the access token somewhere on behalf of the logged in user
        qbosetup.qboSetup( accessToken.oauth_token, accessToken.oauth_token_secret, postBody.oauth.realmId, req.session.email, function(qboa) {
            console.log ("++++ QBO set", qboa);
            res.render('importdata');
        });


        //res.render("importdata");
    });
   // res.send('<!DOCTYPE html><html lang="en"><head></head><body><script>window.opener.location.reload(); window.close();</script></body></html>')

});


module.exports = router;
