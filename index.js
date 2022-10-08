// This script runs on serverside

//dependencies required for the app
var express = require("express");
var bodyParser = require("body-parser");
const session = require('express-session');
var app = express();
var config = require('./config.json');
var languageImport = require('../Pw-manager-nodejs/language');
var user = require('../Pw-manager-nodejs/user');
var customer = require('../Pw-manager-nodejs/customer');
var debugHelper = require('../Pw-manager-nodejs/debugHelper');
var administration = require('../Pw-manager-nodejs/administration'); // Change name!!!
var language = languageImport.getEnglish();



const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 900, // Limit each IP to 900 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Sorry, you reached the request limit! Please try again later!"
});

// Apply the rate limiting middleware to all requests
//app.use(limiter);



// Why do i need extended false and not true?
//https://stackoverflow.com/questions/35931135/cannot-post-error-using-express
app.use(bodyParser.urlencoded({ extended: false }));
//app.use('/login', require('./login'))
app.set("view engine", "ejs");
//render css files
app.use(express.static("public"));


app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));


// What does it do? Do i need it?
app.post(function(req, res, next) {
    console.log("next() called!");
    next();
});



// routing
app.get("/", async function(req, res) {
    console.log("redirect to / (loadData)");

    if (req.session.loggedIn === false || typeof req.session.loggedIn === 'undefined') {

        if(config.debug){
            debugHelper(req);
        }
        else{
            console.log("user is null1 => login");
            return res.render("login", { errormsg: "" });
        }        
    }

    await administration.loadData(req, res);
});

/*app.get("/test", async function (req, res) {
    let exists = await database.getUserExists("sadsadas");

    res.send({ exists });
}); */

app.get("/index", function(req, res) {
    res.redirect("/");
});

app.post("/getcustomers", async function(req, res) {
    res.send(await administration.getCustomers(req,res));
});

app.post("/addnewpw", async function(req, res) {
    await administration.addNewPw(req, res);
});

app.post("/copypw", async function(req, res) {
    await administration.copyPw(req, res);
});

app.post("/changepw", async function(req, res) {
    await administration.changePw(req, res);
});

app.post("/changepwapp", async function(req, res) {
    await administration.changePwApp(req, res);
});

app.get("/login", limiter, function(req, res) {
    res.render("login", { errormsg: "" });
});

app.get("/customers", async function(req, res) {

    user = customer.getUserFromSession(req);
    if (user.loggedIn === false || typeof user.loggedIn === 'undefined') {
        
        res.redirect("/");
        
    } else {

        let customers = await administration.getCustomers(req,res);

        return res.render("customers", { userData: user, customerData: customers });
    }
});

app.post("/customersDetails", async function(req, res) {

    user = customer.getUserFromSession(req);
    if (user.loggedIn === false || typeof user.loggedIn === 'undefined') {
        
        res.redirect("/");
        
    } else {

        let customersDetails = await administration.getCustomersDetails(req);

        return res.render("customersDetails", { userData: user, customersDetailsData: customersDetails });
    }
});

app.post("/logout", limiter, async function(req, res) {
    await customer.logout(req, res);
});

app.get("/logout", limiter, async function(req, res) {
    await customer.logout(req, res);
});

app.post("/deletepw", async function(req, res) {
    await administration.deletePw(req, res);
});

app.post("/signup", limiter, async function(req, res) {

    try {
        let status = await customer.signUp(req, res);
        user = customer.getUserFromSession(req);

        if (status == "ok") {
            console.log("werde user einloggen");
            await customer.signIn(req, res);
        } else {
            return res.render("signup", { userData: user, errormsg: status });
        }

    } catch (err) {
        console.log("Error on Login: " + err);
        return res.render("signup", { userData: user, errormsg: language.signUpError });
    }
});

app.post("/signin", limiter, async function(req, res) {
    await customer.signIn(req, res);
});

app.post("/showpw", async function(req, res) {
    await administration.showPw(req, res);
});

app.get("/signup", limiter,  function(req, res) {
    user = customer.getUserFromSession(req);
    return res.render("signup", { userData: user, errormsg: "" });
});

app.get("/documentation", function(req, res) {
    user = customer.getUserFromSession(req);
    if (user.loggedIn === false) {
        customer.signIn(req, res);
    } else {
        return res.render("documentation", { userData: user });
    }
});

app.get("/changepw", async function(req, res) {
    user = customer.getUserFromSession(req);
    if (user.loggedIn === false || typeof user.loggedIn === 'undefined') {
        
        res.redirect("/");
        //await customer.signIn(req, res);
    } else {
        return res.render("changepw", { userData: user });
    }
});

// here you set all routes that would end in cannot get/... or cannot post/... to default page could also be you own error page
// ---->cant use this or it will call loadData around 10 times for no reason.
/*app.get('*', function(req, res) {
    console.log("redirect to / (*1)");
    return res.redirect('/');
});*/

app.post('*', function(req, res) {
    console.log("redirect to / (*2)");
    return res.redirect('/');
});

//set app to listen on port 3001
app.listen(3001, function() {
    console.log("server is running on port 3001");
});