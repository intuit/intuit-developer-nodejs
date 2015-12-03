
var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
    console.log (req.user);

    res.render('index', { user: req.user});
});




module.exports = router;
