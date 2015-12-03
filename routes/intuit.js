/**
 * Created by sram on 7/8/15.
 */
var express     = require('express');
var request     = require('request');
var qs          = require ('querystring');
var router      = express.Router();
var passport    = require('passport');

/*
router.get('/return', function(req, res, next) {
    res.render('intuit',{pageTitle: "Open ID", data: res})
});
*/

// GET /
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Intuit authentication will involve redirecting
//   the user to intuit.com.  After authenticating, Intuit will redirect the
//   user back to this application at /auth/intuit/return
router.get('/',
    passport.authenticate('intuit', {failureRedirect: '/failedlogin', failureFlash: true }),
    function(req, res) {
        console.log("+++++++++++in func");
        res.redirect('/');
    });

// GET /return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/return',
    passport.authenticate('intuit', { failureRedirect: '/failedlogin' }),
    function(req, res) {
        console.log("in return", req, res);
        res.redirect('/quickbooks');
    });


module.exports = router;