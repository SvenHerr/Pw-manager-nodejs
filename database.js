// This script runs on serverside

var mysql = require('mysql');
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'nodetest',
    password: 'Start1234',
    database: 'nodepw1',
    debug: true
});

conn.connect(function(err) {
    if (err) throw err;
    console.log('Database is connected successfully !');
});

function getUser(req) {
    conn.query('SELECT * FROM user WHERE Username = ?', [req.session.username], function(err, users) {
        currentDate = `${month}/${date}/${year}`;

        if (users != null) {
            if (users[0] != null) {
                if (this.user == null) {
                    this.user = new userClass();
                }
                this.user = new userClass(null, users[0].Username, users[0].Surname, users[0].Lastname, users[0].Pw);
            }
        }

        if (users == null || users[0] == null) {
            return res.render("login", { errormsg: language.loginError });
        }

        var tempEncryptPW = encrypt1.hashPw(req.body.pw);

        if (bcrypt.compare(tempEncryptPW, this.user.pw)) {
            req.session.loggedIn = true;
            req.session.id = this.user.id;
            req.session.username = this.user.username;
            req.session.surname = this.user.surname;
            req.session.lastname = this.user.lastname;
            req.session.pw = this.user.pw;

            res.redirect("/");

        } else {
            return res.render("login", { errormsg: language.loginError });
        }
    })
}

function getUserExists(username) {
    conn.query('SELECT Id FROM user WHERE user = ?', [username], function(err, complete) {
        if (complete != null) {
            return true;
        }

        return false;
    });
}

function addUser(user) {
    let query = `INSERT INTO user 
    (id, username, surname, lastname, createdate, pw) VALUES (?,?,?,?,?,?);`;

    conn.query(query, [user.id, user.username, user.surname, user.lastname, tempDate, user.pw], function(err, complete) {

        if (err == null) {
            currentUser = user.username;
            req.session.pw = pw;
            user.loggedIn = true;
        } else {
            console.log("Db error: " + err);
            return "Db error! Talk to your admin";
        }
    });
}

function getPw(req, res) {

}

function addPw(req, res) {

}



module.exports = { conn, getUserExists, addUser, getUser };