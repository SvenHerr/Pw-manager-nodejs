class User{
    constructor(id,username,surname,lastname,pw,loggedIn){
        this.id = id,
        this.username = username,
        this.surname = surname,
        this.lastname = lastname,
        this.pw = pw;
        this.loggedIn = loggedIn;
    }
}

module.exports = User;