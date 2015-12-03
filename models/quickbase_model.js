/**
 * Created by sram on 7/10/15.
 */


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Stores quickbase info, like the table id's which are needed
 * to push data and read from the table
 */

var quickbaseDetails = new Schema({
    tablename: String,
    tableid: String
});

var quickbaseMeta = new Schema({
    name: String,
    table_id: String,
    app_id: String,
    tables: [quickbaseDetails]
});

module.exports.quickbase =  mongoose.model('quickbaseMeta', quickbaseMeta);

