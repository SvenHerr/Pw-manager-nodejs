// This script runs on serverside

//dependencies required for the app
var express = require("express");
var bodyParser = require("body-parser");
const dateLib = require('date-and-time');
var connection = require('../Pw-manager-nodejs/Database/database');
const session = require('express-session');
const { decrypt } = require('./crypto/crypto');
const crypto = require('crypto');
var app = express();
const dateObject = new Date();
var languageImport = require('../Pw-manager-nodejs/language');
var user = require('../Pw-manager-nodejs/user');
var customer = require('../Pw-manager-nodejs/customer');
var administration = require('../Pw-manager-nodejs/administration'); // Change name!!!
var language = languageImport.getEnglish();
// current date
const date = (`0 ${dateObject.getDate()}`).slice(-2);
// current month
const month = (`0 ${dateObject.getMonth() + 1}`).slice(-2);
// current year
const year = dateObject.getFullYear();



const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 900, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
app.use(limiter);



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



// Why does this function get called 11 Times?
async function loadData(req, res) {

    try {

        if(req.session.loggedIn != true){
            return res.render("login", { errormsg: "" });
        }
        console.log("LoadDate Username= " + req.session.username);

        let pwItemList = await connection.getAllPwFromUser(req);
        
        if (req.session.loggedIn) {

            pwItemList.forEach(row => {
                try {
                    
                    row.Name = decrypt(row.Name, req.session.pw);

                    if (row.Loginname != null) {
                        
                        row.Loginname = decrypt(row.Loginname, req.session.pw);
                    }

                    row.Pw = decrypt(row.Pw.toString(), req.session.pw);                    

                } catch (err) {
                    console.log(err);
                }
            });

            return res.render("index", { pwDatas: pwItemList, userData: customer.getUserFromSession(req), date: dateLib, currentDate: `${month}/${date}/${year}` });

        } else {
            return res.render("login", { errormsg: "" });
        }   
        
    } catch (err) {
        console.log("Error on load: " + err);
    }
};



// routing
app.get("/", async function(req, res) {
    console.log("redirect to / (loadData)");

    if (req.session.loggedIn === false) {
        console.log("user is null1 => login");
        return res.render("login", { errormsg: "" });
    }

    await loadData(req, res);
});

/*app.get("/test", async function (req, res) {
    let exists = await database.getUserExists("sadsadas");

    res.send({ exists });
}); */

app.get("/index", function(req, res) {
    res.redirect("/");
});

app.post("/getcustomers", async function(req, res) {
    await administration.getCustomers(req,res);
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

app.get("/login", function(req, res) {
    res.render("login", { errormsg: "" });
});

app.post("/logout", async function(req, res) {
    await customer.logout(req, res);
});

app.get("/logout", async function(req, res) {
    await customer.logout(req, res);
});

app.post("/deletepw", async function(req, res) {
    await administration.deletePw(req, res);
});

app.post("/signup", async function(req, res) {

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

app.post("/signin", async function(req, res) {
    await customer.signIn(req, res);
});

app.post("/showpw", async function(req, res) {
    await administration.showPw(req, res);
});

app.get("/signup", function(req, res) {
    user = customer.getUserFromSession(req);
    return res.render("signup", { userData: user, errormsg: "" });
});

app.get("/documentation", function(req, res) {
    user = customer.getUserFromSession(req);
    if (user.loggedIn == false) {
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