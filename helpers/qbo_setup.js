/**
 * Created by sram on 7/13/15.
 */

var PropertyReader  = require('properties-reader');
var properties      = PropertyReader("./properties");
var QuickBooks      = require('../quickbooks_index');
var qbModel        = require ('../models/quickbooks_model');

var qboauth;

function qboSetup (token, secret, realm,  email, callback) {
    var consumerKey = properties.get('consumerKey');
    var consumerSecret = properties.get('consumerSecret');
    console.log ("----------QBOSETUP CREATED-----------");
    qboauth = new QuickBooks(
        consumerKey,
        consumerSecret,
        token,
        secret,
        realm,
        false, // use the Sandbox
        true); // turn debugging
    console.log ("QBOAUTH is ", qboauth);

/**
 * store the credentials in the db
 */
    qbModel.qbo.findOneAndUpdate(
        {email: email},
        {
            userid: email,
            realmid: realm,
            tokenSecret: secret,
            token: token
        },
        {upsert: true},
        function(err, numberAffected, raw) {
            console.log(err, numberAffected, raw)
        }
    );
    callback(qboauth);

}

function qboAuth () {
    console.log ("returning..", qboauth);
    return qboauth;
}

module.exports.qboAuth = qboAuth;
module.exports.qboSetup = qboSetup;