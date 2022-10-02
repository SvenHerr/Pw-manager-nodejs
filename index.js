// This script runs on serverside

//dependencies required for the app
var express = require("express");
var bodyParser = require("body-parser");
const dateLib = require('date-and-time');
var connection = require('../PwTressor/database');
const session = require('express-session');
const { decrypt } = require('./crypto');
const crypto = require('crypto');
var app = express();
const dateObject = new Date();
var languageImport = require('../PwTressor/language');
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
app.post(function (req, res, next) {
    console.log("next() called!");
    next();
});

var encryptArray = [];
var encryptedPwCopy = "";
var pwcopycalled = false; // TODO: Nochmal drüber nachdenken


var count1 = 0;
// Why does this function get called 11 Times?
function loadData(req, res, pwcopycalled = false) {

    try {
        connection.query('SELECT * FROM pw WHERE User =  ?', [req.session.username], function (err, complete) {
            currentDate = `${month}/${date}/${year}`;
            if (req.session.loggedIn) {

                var tempComplete = [];

                complete.forEach(row => {
                    try {
                        var tempApplicationnames = row;
                        tempApplicationnames.Name = decrypt(row.Name, req.session.pw);

                        if (row.Loginname != null) {
                            var tempLoginname = row;
                            tempLoginname.Loginname = decrypt(row.Loginname, req.session.pw);
                        }

                        if (encryptArray.includes(row.Id)) {

                            var tempRow = row;
                            tempRow.Pw = decrypt(row.Pw.toString(), req.session.pw);
                            tempComplete.push(tempRow);

                        } else {
                            tempComplete.push(row);
                        }

                    } catch (err) {
                        console.log(err);
                    }
                });

                if (pwcopycalled == false) {
                    encryptedPwCopy = null;
                }

                return res.render("index", { pwDatas: complete, userData: customer.getUserFromSession(req), date: dateLib, currentDate: currentDate });

            } else {
                return res.render("login", { errormsg: "" });
            }
        })
    } catch (err) {
        console.log("Error on load: " + err);
    }

    console.log("finish load data" + count1);
};



// routing
app.get("/", function (req, res) {
    console.log("redirect to / (loadData)");

    if (req.session.loggedIn === false) {
        console.log("user is null1 => login");
        return res.render("login", { errormsg: "" });
    }

    loadData(req, res);

});

app.get("/index", function (req, res) {
    res.redirect("/");
})

app.post("/addnewpw", function (req, res) {
    administration.addNewPw(req, res);
});

app.post("/copypw", function (req, res) {
    administration.copyPw(req, res);
});

app.post("/changepw", function (req, res) {
    administration.changePw(req, res);
});

app.post("/changepwapp", function (req, res) {
    administration.changePwApp(req, res);
});

app.get("/login", function (req, res) {
    res.render("login", { errormsg: "" });
});

app.post("/logout", function (req, res) {
    customer.logout(req, res);
});

app.get("/logout", function (req, res) {
    customer.logout(req, res);
});

app.post("/deletepw", function (req, res) {
    administration.deletePw(req, res);
});

app.post("/signup", function (req, res) {

    try {
        var status = customer.signUp(req, res);
        user = customer.getUserFromSession(req);

        if (status == "ok") {
            console.log("werde user einloggen");
            customer.signIn(req, res);
        } else {
            return res.render("signup", { userData: user, errormsg: status });
        }

    } catch (err) {
        console.log("Error on Login: " + err);
        return res.render("signup", { userData: user, errormsg: language.signUpError });
    }
});

app.post("/signin", function (req, res) {
    customer.signIn(req, res);
});

app.post("/showpw", function (req, res) {
    administration.showPw(req, res);
});

app.get("/signup", function (req, res) {
    user = customer.getUserFromSession(req);
    return res.render("signup", { userData: user, errormsg: "" });
});

app.get("/documentation", function (req, res) {
    user = customer.getUserFromSession(req);
    if (user.loggedIn == false) {
        customer.signIn(req, res);
    } else {
        return res.render("documentation", { userData: user });
    }
});

app.get("/changepw", function (req, res) {
    user = customer.getUserFromSession(req);
    if (user.loggedIn == false) {
        customer.signIn(req, res);
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

app.post('*', function (req, res) {
    console.log("redirect to / (*2)");
    return res.redirect('/');
});

//set app to listen on port 3001
app.listen(3001, function () {
    console.log("server is running on port 3001");
});