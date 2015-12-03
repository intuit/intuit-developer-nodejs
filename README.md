Intuit Developer with NodeJS Demystified
========

Developers need to grapple with a number of new technologies when they onboard to Intuit's Developer Platform. This includes OpenID and OAuth - essential for ensuring that applications are authorized to access data, and users are able to use the Intuit Credentials to sign in to the application.

While OpenID and Oauth are essential to ensure proper operation with the Intuit Platform, it is hardly the main problem developers come to the Intuit Platform for. They are interested in using Intuit's Platform capabilities and data to help their customers. This repository shows how you can easily put all the 'plumbing' together so you can focus on developing your awesome App.

The example here is in Node: But it can of course to reused using your favorite programming language. Where possible, we like using SDK's. In this example, we use mcohen's excellent wrapper around the QuickBooks API to get bootstrapped.

Node makes it easy to build applications that use OpenID and OAuth, thanks to the QuickBooks API, mcohen's Node SDK, and [Jared Hansson's ](https://github.com/jaredhanson/passport-intuit, "passport-intuit") SDK, which makes
it easy to integrate with OpenID. We will use all of the above. 

You will need to store some data returned from the OpenID protocols and OAuth. We are using mongo in this example.

A quick overview
==========

There are two things that need to happen to for an IPP app to get bootstrapped

1. You need to have your customer log in and get validated with the Intuit system
2. You need to get the customers permission to access their data

(1) Corresponds to OpenID. (2) corresponds to OAuth.

In short, OpenID is used for _authentication_ and OAuth is used for _authorization_. You need to use both in order to log in and then access customer data

Once you have completed (1) and (2) you will get some data in return - which is valid for a certain amount of time. Once that time expires, you have to repeat the procedure. 

Intuit also provides a widget to start the _authorization_ flow from any site. You can read more about this widget known as "Intuit Anywhere" [here](https://developer.intuit.com/docs/0150_payments/0060_authentication_and_authorization/widgets)  
 
 OAuth Tokens are valid for 6 months. They can be revoked by the user at any time. 

How it all works together
==============

>Please keep in mind that the example below are meant to be high level and glosses over some details. I encourage 
>you to read the references at the bottom for more normative information on the protocols.

Lets assume that you are a developer, and run a company, Catmandu LLC. You specialize in the food industry. You analyze money movement for catering companies and need access
to QuickBooks data for doing so. 

Jane is the owner of  Kayser's Cakes, LLC. She is interested in trying out Catmandu's analysis engine.

First, Jane needs to authenticate  with Intuit. Catmandu needs to get her credentials from Intuit.



Authentication
---------
The sequence diagram below shows what happens in the authentication (openid) part of the flows;

![OpenID with Intuit](/images/auth.png)


Authorization
-------------

Once authenticated, Catmandu needs to ask Jane for authorization to access her Keyser's Cake, LLC company data. 
 Keep in mind that Jane may have several companies that she runs: _One user credential can be associated with multiple realms_
 So you have to ask for permission for each company file. Access to one does not imply access to another. Jane has to give permission to access each
 company individually.
 
 Intuit does authorization using the OAuth 1.0 protocol. In order to use OAuth, you need to visit 
 [The Intuit Developer portal](http://developer.intuit.com/ "Intuit") and get keys for your application. 
 You need an App Token, a consumer Key and a Consumer Secret. You will need to store this securely. (note that 
 you need seperate keys for the development and the production environments)
 
 Once you have these, you use the standard OAuth flows to get authorization. A great resource for understanding OAuth
  in depth is [Understanding OAuth](http://www.cubrid.org/blog/dev-platform/dancing-with-oauth-understanding-how-authorization-works/ "OAuth Explained")
  
 The sequence diagram below shows the flows:
 

![Oauth with Intuit](/images/authz.png)


 A note on security
 ================
 
 OAuth tokens should be considered secure data, and be encrypted in your storage (_review intuit security guidelines_)

Plumbing using NodeJS
-----

One of the really nice things about node is npm. In particular, [Jared Hanson's passport-intuit](https://github.com/jaredhanson/passport-intuit "passport-intuit") make life very easy.
You do not need to deep dive into OpenID and OAuth - you can just use passport-intuit  for openid, and [mcohen's QuickBooks SDK](https://github.com/mcohen01/node-quickbooks "QuickBooks Node SDK")


Setup
----
- download and run mongodb. Note its port number (27017 by default)
- run 'npm install' to install the packages in package.json
- set NODE_ENV=development
- create a file named properties in the root directory. Add the following information to it, in the format shown
* consumerKey    =  _your_consumer_key_from_developer.intuit.com_
* consumerSecret = _your_consumer_secret_from_developer.intuit.com_

USAGE
----
start mongod. you may need to provide it a data directory (suggested: ../data)
use nodemon to run. (nodemon bin/www). 
After starting. navigate to localhost:3000

### Usage of passport-intuit


The work of interacting with openid.intuit.com for authentication is done via intuit.js, which uses passport-intuit.

This code in particular shows does all the work: 


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
    
     
   Note the reference to /quickbooks - that is the redirect to do OAuth, if necessary (your OAuth tokens are valid for a long time,
   and you need to redo OAuth only when the expire) _what is the duration? 6 months_?
   
  ### /quickbooks does the following: It starts with the requestToken. Once we have the requestToken, we exchange it for the 
  oauth_token in /callback. the call to qboSetup stores the token and secret in mongo. (that part should be replaced
  with a call to your database if you are not using mongo)
  
   
   
   
       outer.get('/requestToken', function (req, res) {
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
       
   ### /importdata
   
   we use mcohen's wrapper around the Intuit API's to fetch the accounts of the company file that we have permission for. 
  Once the setup in the previous steps are completed, it becomes easy enough. In qbo_setup, a QuickBooks Object is created:
  
        qboauth = new QuickBooks(
              consumerKey,
              consumerSecret,
              token,
              secret,
              realm,
              false, // use the Sandbox
              true); // turn debugging
          console.log ("QBOAUTH is ", qboauth);
          
          
  Using this, we can easily use methods on the quickbooks API, like looking up accounts (importdata.js)
  
      
    qboauth.findAccounts(function (_, accounts) {
        req.session.accounts = accounts;


        //console.log(accounts);
        //accounts.QueryResponse.Account.forEach(function (account) {
          //  console.log(account.Name)
        //});
        res.render("qbodatadisplay", { accounts: accounts});
    });
          
