var express         = require('express');
var request         = require('request');
var qs              = require ('querystring');
var router          = express.Router();
var quickbase_setup = require('../helpers/quickbase_setup');
var mongoose        = require ('mongoose');
var quickbase_schema= require ('../models').quickbaseModel;


router.get('/', function(req,res,next) {
    quickbase_setup.setup(function(ret) {
        console.log("ticket is", ret.response.ticket);
        ret.quickbase.api('API_GetSchema', {
            ticket: ret.response.ticket,
            apptoken: ret.response.token,
            dbid: "bj2xkwmtf"
        }).then(function (r) {
            console.log("Quickbase response:", JSON.stringify(r));
            quickbase_setup.mapDB(r);
        }).catch(function (err) {
            console.log(err);
        });
    });
});

module.exports = router;
