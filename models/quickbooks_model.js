

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    /**
     * Stores information about the quickbooks auth tokens
     */

    var quickbooksSchema = new Schema({
        userid: String,
        realmid: String,
        token: String,
        tokenSecret: String
    });

    module.exports.qbo =  mongoose.model('quickbooks', quickbooksSchema);
