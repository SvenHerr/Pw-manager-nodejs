import user from './user.js';
import customer from './customer.js';
import administration from './administration.js'; // TODO: Change name !!!
import i18next from 'i18next';

export default function (app) {
    let routes = { customer, administration };

    app.get('/', async function(req, res) {
        console.log('redirect to / (loadData)');
    
        if (req.session.loggedIn === false) {
            console.log('user is null1 => login');
            return res.render('login', { errormsg: '' });
        }
    
        await administration.loadData(req, res);
    });
    
    /*app.get("/test", async function (req, res) {
        let exists = await database.getUserExists("sadsadas");
    
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
    
    /*app.post('/logout', async function(req, res) {
        await customer.logout(req, res);
    });*/
    
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

    Object.keys(routes).forEach(function (path) {
        if (routes[path]?.post) {
            Object.keys(routes[path].post).forEach(function (method) {
                app.post(`/${path.toLowerCase()}/${method.toLowerCase()}`, routes[path].post[method]);
            });
        }

        if (routes[path]?.get) {
            Object.keys(routes[path].get).forEach(function (method) {
                app.get(`/${path.toLowerCase()}/${method.toLowerCase()}`, routes[path].get[method]);
            });
        }
    });
    
    app.post('*', function(req, res) {
        console.log('redirect to / (*2)');
        return res.redirect('/');
    });
}
