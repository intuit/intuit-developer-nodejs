/**
 * Created by sram on 7/9/15.
 */


/**
 * This is the place where we read data out of QuickBooks
 * and move it to QuickBase
 * @type {*|exports|module.exports}
 */
var express         = require('express');
var QuickBooks      = require('../quickbooks_index');
var PropertyReader  = require('properties-reader');
var properties      = PropertyReader("./properties");
var qboauth_module  = require ('../helpers/qbo_setup');
var maptoqbase      = require ('../helpers/maptoqbase');


var router = express.Router();

var app                   = require('../app');

var consumerKey    = properties.get('consumerKey'),
    consumerSecret = properties.get('consumerSecret');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.params.operation);

    res.render('index', {user: req.user});
});

router.get('/accounts', function(req,res,next) {
   //var qbo = req.session.qbo;
    //console.log ("in accounts++++ with qbo", qbo);

    var qboauth         = qboauth_module.qboAuth();

    console.log ("new QuickBooks Object", qboauth);

    qboauth.findAccounts(function (_, accounts) {
        req.session.accounts = accounts;


        //console.log(accounts);
        //accounts.QueryResponse.Account.forEach(function (account) {
          //  console.log(account.Name)
        //});
        res.render("qbodatadisplay", { accounts: accounts});
    });
});



router.get('/qboauth', function(req,res,next) {
    var qboauth = qboauth_module.qboAuth();
    res.send(qboauth);
});



module.exports = router;
