/**
 * Created by sram on 7/10/15.
 */

var PropertyReader  = require('properties-reader');
var properties      = PropertyReader("./properties");
var QuickBase       = require('quickbase');
var mongoose        = require ('mongoose');
var quickbase_schema= require('../models').quickbaseModel;
var quickbase_ticket = null;
var appToken = null;
var retval = {};

function setupQuickBase(callback) {
    appToken = properties.get('quickbase-apptoken');
    console.log(isEmpty(retval));
    if (!isEmpty(retval)) {
        // quickbase already initialized
        console.log ("quickbase initialized already..")
        callback(retval);
    }
    quickbase = new QuickBase({
        realm: 'intuitcorp',
        appToken: appToken
    });
    console.log("apptoken", appToken);
    username = properties.get('quickbase-username');
    password = properties.get('quickbase-password');
    quickbase.api('API_Authenticate', {
        username: username,
        password: password
    }).then(function (r) {
        quickbase_ticket = r.ticket;
        console.log("^^^", quickbase_ticket);
        retval.response = r;
        retval.quickbase = quickbase;
        callback(retval);
    });
    //console.log("--",quickbase);
    //return quickbase;
}

function isEmpty(theobject) {
return !Boolean(Object.keys(theobject).length); //returns 0 if empty or an integer > 0 if non-empty
}



function mapDB(r) {
    var qbase_schema = mongoose.model('quickbaseMeta');
    var meta = new quickbase_schema.quickbase(
        {

        }
    );

    console.log("created");

    for (i = 0; i < r.table.chdbids.length; i++) {
        meta.tables.push(
            {
                tablename: r.table.chdbids[i].$.name,
                tableid: r.table.chdbids[i]._
            }
        );
        console.log(r.table.chdbids[i].$.name, r.table.chdbids[i]._);
    }
    quickbase_schema.quickbase.findOneAndUpdate(
        {table_id: r.table.original.table_id},
        {
            name: r.table.name,
            table_id: r.table.original.table_id,
            app_id: r.table.original.app_id,
            tables: meta.tables
        },
        {upsert: true},
        function(err, numberAffected, raw) {
            console.log(err, numberAffected, raw)
        }
    );
}


module.exports.setup = setupQuickBase;
module.exports.mapDB = mapDB;