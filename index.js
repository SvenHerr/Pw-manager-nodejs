// This script runs on serverside

//dependencies required for the app
var express = require("express");
var bodyParser = require("body-parser");
const dateLib = require('date-and-time');
var connection = require('../PwTressor/database');
var encrypt1 = require('../PwTressor/encrypt');
const { encrypt, decrypt } = require('./crypto');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
var app = express();
const dateObject = new Date();
var languageImport = require('../PwTressor/language');
const { redirect } = require("express/lib/response");

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


// What does it do? Do i need it?
app.post(function(req, res, next) {
    next();
});


var currentUserPw = ""; // Needs to be stored here until the user loggs out. 
var encryptArray = [];
var encryptedPwCopy = "";
var pwcopycalled = false; // TODO: Nochmal drüber nachdenken


class User{
    constructor(id,username,surname,lastname,createDate,pw,loggedIn){
        this.id = id,
        this.username = username,
        this.surname = surname,
        this.lastname = lastname,
        this.createDate = createDate,
        this.pw = pw;
        this.loggedIn = loggedIn;
    }
}

var user = null;

function showPw(req, res) {
    var decryptedPw = "";

    if (encryptArray.includes(req.body.id)) {

        const index = encryptArray.indexOf(req.body.id);
        if (index > -1) {
            encryptArray.splice(index, 1);
        }

        res.send("*****");

    } else {
        encryptArray.push(req.body.id);

        const index = encryptArray.indexOf(req.body.id);

        var temp = encryptArray[index];
        
        if (temp != null) {
            connection.query('SELECT * FROM pw WHERE User =  ? AND Id = ?', [user.username, req.body.id], (err, rows) => {

                if (err != null) {
                    console.log("showpw sql error");
                }

                if (rows[0] != null) {

                    if (rows[0].Pw != null) {

                        decryptedPw = decrypt(rows[0].Pw, currentUserPw);

                        res.send(decryptedPw);
                    }
                }
            });

        } else {
            console.log("encryptArray on index is null");
        }
    }
};

function copyPw(req, res) {
    pwcopycalled = true;
    if (user.loggedIn) {
        connection.query('SELECT Pw FROM pw WHERE Id =  ?', [req.body.id], function(err, rows) {

            if (rows[0] != null) {
                encryptedPwCopy = decrypt(rows[0].Pw, currentUserPw);
                res.send(encryptedPwCopy);
            } else {
                res.send("error");
            }

        });
    }
};

function changePw(req, res) {
    var oldPw = req.body.oldPw;
    var newPw = req.body.newPw;

    connection.query('SELECT * FROM pw WHERE User =  ?', [user.username], function(err, complete) {
        currentDate = `${month}/${date}/${year}`;

        if (user.loggedIn) {
            if (complete != null) {
                complete.forEach(row => {

                    var decriptedName = decrypt(row.Name.toString(), oldPw.toString());
                    var encriptedName = encrypt(decriptedName.toString(), newPw.toString());
                    var decriptedPw = decrypt(row.Pw.toString(), oldPw.toString());
                    var encriptedPw = encrypt(decriptedPw.toString(), newPw.toString());

                    try {
                        connection.query('UPDATE pw SET Name = ?, Pw = ? WHERE Id = ?', [encriptedName, encriptedPw, row.Id]);
                    } catch (err) {
                        console.log("ChangePW update sql: " + err);
                    }
                });
            }

        } else {
            return res.render("login", { errormsg: "Nach Pw Änderung bitte erneut anmelden" });
        }
    });

    currentUserPw = newPw;
    connection.query('UPDATE user SET Pw = ? WHERE Username = ?', [newPw, user.username]);

    return res.render("login", { errormsg: language.loginErrorPwChange });
};

function changePwApp(req, res) {
    var newPw = req.body.newPw;
    var newPwConfirmation = req.body.newPw1;
    var id = req.body.changeelement;

    if (newPw != newPwConfirmation) {
        return language.pwMissmatch;
    }

    if (id == null) {
        return language.idIsNotDefined;
    }

    var currentDate = new Date();
    currentDate = dateLib.format(currentDate, 'YYYY-MM-DD');

    if (user.loggedIn) {

        var encriptedPw = encrypt(newPw.toString(), currentUserPw);

        try {
            connection.query('UPDATE pw SET Pw = ?, CreateDate = ? WHERE Id = ?', [encriptedPw, currentDate, id]);
        } catch (err) {
            console.log("ChangePW update sql: " + err);
        }

    } else {
        console.log("ChangePW else!");
    }
    console.log("redirect to / (changePwApp)");
    res.redirect("/");
};

var count1 = 0;
// Why does this function get called 11 Times?
function loadData(req, res, pwcopycalled = false) {
    if(user == null){
        return res.render("login", { errormsg: language.errorLogin });
    }

    if (user.loggedIn == false) {
        return res.render("login", { errormsg: language.errorLogin });
    }

    count1 += 1; // TODO: wieder löschen
    console.log(count1); // TODO: wieder löschen

    try {
        connection.query('SELECT * FROM pw WHERE User =  ?', [user.username], function(err, complete) {
            currentDate = `${month}/${date}/${year}`;
            if (user.loggedIn) {
                
                var tempComplete = [];
                complete.forEach(row => {
                    try{
                        var tempApplicationnames = row;
                        tempApplicationnames.Name = decrypt(row.Name, currentUserPw);
    
                        if (row.Loginname != null) {
                            var tempLoginname = row;
                            tempLoginname.Loginname = decrypt(row.Loginname, currentUserPw);
                        }

                        if (encryptArray.includes(row.Id)) {
    
                            var tempRow = row;
                            tempRow.Pw = decrypt(row.Pw.toString(), currentUserPw);
                            tempComplete.push(tempRow);
    
                        } else {
                            tempComplete.push(row);
                        }

                    }catch(err){
                        console.log(err);
                    }
                });

                if (pwcopycalled == false) {
                    encryptedPwCopy = null;
                }

                return res.render("index", { pwDatas: complete, userData: user, date: dateLib, currentDate: currentDate });

            } else {
                return res.render("login", { errormsg: "" });
            }
        })
    } catch (err) {
        console.log("Error on load: " + err);
    }

    console.log("finish load data" + count1);
};


function logout(req, res) {
    user.loggedIn = false;
    user = "";
    currentUserPw = "";
    return res.render("login", { errormsg: language.loggedOut });
};

function addNewPw(req, res) {

    try {
        var encryptedpw = encrypt(req.body.pw, currentUserPw);
        var tempDate = new Date();
        var applicationname = encrypt(req.body.applicationname, currentUserPw);
        var loginname = encrypt(req.body.loginname, currentUserPw);

        tempDate = dateLib.format(tempDate, 'YYYY-MM-DD');

        connection.query('INSERT INTO `pw`(`User`, `Name`, `Pw`, `Loginname`, `CreateDate`, `Id`) VALUES (?,?,?,?,?,?)', [user.username, applicationname, encryptedpw, loginname, tempDate, Math.floor(Math.random() * 1000001).toString()], function(err, complete) {
            if (err != null) {
                console.log("addnewpw db error: " + err);
            }
            console.log("redirect to / (addNewPw)");
            res.redirect("/");
        })
    } catch (err) {
        console.log("addnewpw err: " + err);
    }
};

function deletePw(req, res) {
    var id = req.body.elementId;
    var confirmation = req.body.confirmation;

    if (confirmation == "yes") {
        connection.query('DELETE FROM `pw` WHERE Id = ?', [id], function(err, complete) {
            console.log("redirect to / (deletePw)");
            res.redirect("/");
        })
    }
};

function signIn(req, res) {
    console.log("in signin");
    connection.query('SELECT * FROM user WHERE Username = ?', [req.body.username], function(err, users) {
        console.log("in signin db");
        currentDate = `${month}/${date}/${year}`;
        
        if (users != null) {
            if (users[0] != null) {

                user = new User(null,users[0].Username,users[0].Surname,users[0].Lastname,users[0].CreateDate,users[0].Pw);                
            }
        }
        console.log(user.username);

        if (users == null) {
            console.log("in return");
            return res.render("login", { errormsg: language.loginError });
        }

        if (users[0] == null) {
            console.log("in return");
            return res.render("login", { errormsg: language.loginError });
        }

        var tempEncryptPW = encrypt1.hashPw(req.body.pw)
        
        if (bcrypt.compare(tempEncryptPW,user.pw)) {

            user.username = req.body.username;
            currentUserPw = req.body.pw
            
            user.loggedIn = true;
            console.log("user.loggedIn: " + user.loggedIn);
            console.log("redirect to / (signIn)");
            res.redirect("/");

        } else {
            console.log("pw incorrect");
            return res.render("login", { errormsg: language.loginError });
        }
    })
};

function signUp(req, res) {

    var pw = req.body.pw;
    var pw1 = req.body.pw1;

    if (pw != pw1) {
        return "pw missmatch";
    }

    var hashedPw = encrypt1.hashPw(pw);
    if (hashedPw == null) {
        return "error: Pw hash problem!";
    }

    var tempDate = new Date();
    tempDate = dateLib.format(tempDate, 'YYYY-MM-DD');
    var randomId = Math.random().toString();
    var user = new User(randomId,req.body.username,req.body.surname,req.body.lastname,tempDate,hashedPw,null);

    if (pw == null || pw1 == null) {
        return "error: Pw not found!";
    }

    if (user.username == null || user.surname == null || user.lastname == null) {
        return "error: User data not found!";
    }    

    var userExists = false;
    connection.query('SELECT Id FROM user WHERE User = ?', [user.username], function(err, complete) {
        if (complete != null) {
            userExists = true;
        }
    });

    if (userExists) {
        return "User already exists!";
    }    

    connection.query('INSERT INTO user VALUES(?,?,?,?,?,?)', [user.id, user.username, user.surname, user.lastname, tempDate, user.pw], function(err, complete) {

        if (err == null) {
            currentUser = user.username;
            currentUserPw = pw;
           
            user.loggedIn = true;
        } else {
            console.log("Db error: " + err);
            return "Db error! Talk to your admin";
        }
    });

    return "ok";
};

// routing
app.get("/", function(req, res) {
    console.log("redirect to / (loadData)");
    console.log(user);
    if(user == null){
        console.log("user is null => login");
        return res.render("login", { errormsg: "" });
    }
    
    loadData(req, res);
    
});

app.get("/index", function(req,res){
    res.redirect("/");
})

app.post("/addnewpw", function(req, res) {
    addNewPw(req, res);
});

app.post("/copypw", function(req, res) {
    copyPw(req, res);
});

app.post("/changepw", function(req, res) {
    changePw(req, res);
});

app.post("/changepwapp", function(req, res) {
    changePwApp(req, res);
});

app.get("/login", function(req, res) {
    res.render("login", { errormsg: "" });
});

app.post("/logout", function(req, res) {
    logout(req, res);
});

app.get("/logout", function(req, res) {
    logout(req, res);
});

app.post("/deletepw", function(req, res) {
    deletePw(req, res);
});

app.post("/signup", function(req, res) {

    try {
        var status = signUp(req, res);

        if (status == "ok") {
            console.log("werde user einloggen");
            signIn(req, res);
        } else {
            return res.render("signup", { userData: user, errormsg: status });
        }

    } catch (err) {
        console.log("Error on Login: " + err);
        return res.render("signup", { userData: user, errormsg: language.signUpError });
    }
});

app.post("/signin", function(req, res) {
    signIn(req, res);
});

app.post("/showpw", function(req, res) {
    showPw(req, res);
});

app.get("/signup", function(req, res) {
    return res.render("signup", { userData: user, errormsg: "" });
});

app.get("/documentation", function(req, res) {
    if (user.loggedIn == false) {
        signIn(req, res);
    } else {
        return res.render("documentation", { userData: user});
    }
});

app.get("/changepw", function(req, res) {
    if (user.loggedIn == false) {
        signIn(req, res);
    } else {
        return res.render("changepw", { userData: user});
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