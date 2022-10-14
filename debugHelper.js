
var config = require('./config.json');

function setDebugUser(req){
    if(config.debug){

        req.session.loggedIn = true;
        req.session.id = 1;
        req.session.username = "Sven1";
        req.session.surname = "Sven";
        req.session.lastname = "Herrmann";
        req.session.pw = "b1f4011b08266fb427ca279634f94752ce3125cdba706b7522809e5d03167ae4";
    }
}

module.exports = setDebugUser;

