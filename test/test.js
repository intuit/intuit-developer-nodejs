/**
 * Created by sram on 7/15/15.
 */

var assert    = require('assert');
var request   = require('superagent');
var console   = require ('console');
var qbosetup  = require ('../helpers/qbo_setup');
//var qboauth;


describe('Array', function() {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            assert.equal(-1, [1,2,3].indexOf(5));
            assert.equal(-1, [1,2,3].indexOf(0));
        });
    });
});

var baseURL = "http://localhost:3000/";
var user1 = request.agent();


describe ('QuickBooks Setup', function() {
        it('should have the qboauth object available after login ', function (done) {
            user1
                .get(baseURL + "importdata/qboauth")
                //.send({email: "siddharth_ram@intuit.com", password: "mootex12"})
                //.get("http://localhost:3000/quickbooks/start")
                // .send({ name: 'Manny', species: 'cat' })
                // .set('X-API-Key', 'foobar')
                // .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (res.ok) {
                        console.log('yay got ' + JSON.stringify(res.text));
                        //qboauth = new JSONObject(res.text);
                        done();
                    } else {
                        console.log('Oh no! error ' + res.text);
                    }

                });
        });


    describe('Get Accounts', function () {
        it('should get a list of QUickBooks Accounts', function (done) {
            this.timeout(10000);
            user1
                .get(baseURL + 'importdata/accounts')
                .end(function (err, res) {
                    if (res.ok) {
                        console.log('yay got' + JSON.stringify(res.text));
                        done();
                    } else {
                        console.log('got an error' + res.text);
                    }
                });
        });
    });
});

