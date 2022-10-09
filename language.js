// This script runs on serverside


// TODO: Do some research on how to do translation stuff in js.

// Pleas keep in mind that you always need the same propertys in all languages
const english = {
    loginErrorPwChange: "Changed pw please login again",
    pwMissmatch: "Pw missmatch",
    idIsNotDefined: "error: Id is not defined",
    errorLogin: "Please login!",
    loggedOut: "Logged out!",
    loginError: "Login error!",
    signUpError: "Sign up error!"
};

const german = {
    loginErrorPwChange: "Nach Pw Änderung bitte erneut anmelden",
    pwMissmatch: "Pw fehler",
    idIsNotDefined: "error: Id wurde nicht gesetzt",
    errorLogin: "Bitte einloggen!",
    loggedOut: "Erfolgreich abgemeldet!",
    loginError: "Anmeldung fehlgeschlagen!",
    signUpError: "Registrierung fehlgeschlagen!"
}

const spanish = {
    loginErrorPwChange: "",
    pwMissmatch: "",
    idIsNotDefined: "",
    errorLogin: "",
    loggedOut: "",
    loginError: "",
    signUpError: ""
}

export default {
    getEnglish() {
        return english;
    },
    getGerman() {
        return german;
    },
    getSpanish() {
        return spanish;
    } 
};
