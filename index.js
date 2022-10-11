// This script runs on serverside

// dependencies required for the app
import 'dotenv/config';

import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import session from 'express-session';
import user from './user.js';
import customer from './customer.js';
import administration from './administration.js'; // TODO: Change name !!!
import rateLimit from 'express-rate-limit';
import middleware from 'i18next-http-middleware';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
        backend: {
            loadPath: './locales/{{lng}}/translation.json'
        },
        fallbackLng: 'en',
        preload: ['en', 'de']
    });

const app = express();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 900, // Limit each IP to 900 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Sorry, you reached the request limit! Please try again later!"
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(
    middleware.handle(i18next)
);

app.use(helmet());

// Why do i need extended false and not true?
//https://stackoverflow.com/questions/35931135/cannot-post-error-using-express
app.use(bodyParser.urlencoded({ extended: false }));
//app.use('/login', require('./login'))
app.set('view engine', 'ejs');
//render css files
app.use(express.static('public'));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// routing
app.get('/', async function(req, res) {
    console.log('redirect to / (loadData)');

    if (req.session.loggedIn === false) {
        console.log('user is null1 => login');
        return res.render('login', { errormsg: '' });
    }

    await administration.loadData(req, res);
});

app.post("/customersDetails", async function(req, res) {

    res.send({ exists });
}); */

app.get('/index', function(req, res) {
    res.redirect('/');
});

app.post('/getcustomers', async function(req, res) {
    await administration.getCustomers(req, res);
});

app.post('/addnewpw', async function(req, res) {
    await administration.addNewPw(req, res);
});

app.post('/copypw', async function(req, res) {
    await administration.copyPw(req, res);
});

app.post('/changepw', async function(req, res) {
    await administration.changePw(req, res);
});

app.post('/changepwapp', async function(req, res) {
    await administration.changePwApp(req, res);
});

app.get('/login', function(req, res) {
    res.render('login', { errormsg: '' });
});

app.post('/logout', async function(req, res) {
    await customer.logout(req, res);
});

app.get('/logout', async function(req, res) {
    await customer.logout(req, res);
});

app.post('/deletepw', async function(req, res) {
    await administration.deletePw(req, res);
});

app.post('/signup', async function(req, res) {
    try {
        let status = await customer.signUp(req, res);
        let user = customer.getUserFromSession(req);

        if (status == 'ok') {
            console.log('werde user einloggen');
            await customer.signIn(req, res);
        } else {
            return res.render('signup', { userData: user, errormsg: status });
        }
    } catch (err) {
        console.log('Error on Login: ' + err);
        return res.render('signup', { userData: user, errormsg: i18next.t('signup.generalError') });
    }
});

app.post('/signin', async function(req, res) {
    await customer.signIn(req, res);
});

app.post('/showpw', async function(req, res) {
    await administration.showPw(req, res);
});

app.get('/signup', function(req, res) {
    let user = customer.getUserFromSession(req);
    return res.render('signup', { userData: user, errormsg: '' });
});

app.get('/documentation', function(req, res) {
    let user = customer.getUserFromSession(req);
    if (user.loggedIn == false) {
        customer.signIn(req, res);
    } else {
        return res.render('documentation', { userData: user });
    }
});

app.get('/changepw', async function(req, res) {
    let user = customer.getUserFromSession(req);

    if (user.loggedIn === false || typeof user.loggedIn === 'undefined') {
        res.redirect('/');
        //await customer.signIn(req, res);
    } else {
        return res.render('changepw', { userData: user });
    }
});

// here you set all routes that would end in cannot get/... or cannot post/... to default page could also be you own error page
// ---->cant use this or it will call loadData around 10 times for no reason.
/*app.get('*', function(req, res) {
    console.log("redirect to / (*1)");
    return res.redirect('/');
});*/

app.post('*', function(req, res) {
    console.log('redirect to / (*2)');
    return res.redirect('/');
});

//set app to listen on port 3001
app.listen(3001, function() {
    console.log('server is running on port 3001');
});
