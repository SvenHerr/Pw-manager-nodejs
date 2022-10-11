import user from './user.js';
import customer from './customer.js';
import administration from './administration.js'; // TODO: Change name !!!

export default function (app) {
    let routes = { customer, administration };

    app.get('/', async function(req, res) {
        console.log('redirect to / (loadData)');
    
        if (!req.session.loggedIn) {
            console.log('user is null1 => login');
            return res.render('login', { errormsg: '' });
        }
    
        await administration.loadData(req, res);
    });
    
    app.get('/index', function(req, res) {
        res.redirect('/');
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
            return res.render('signup', { userData: user, errormsg: req.t('signup.generalError') });
        }
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
        if (routes[path]?.routes?.post) {
            Object.keys(routes[path].routes?.post).forEach(function (method) {
                app.post(`/${path.toLowerCase()}/${method.toLowerCase()}`, routes[path].routes?.post[method]);
            });
        }

        if (routes[path]?.routes?.get) {
            Object.keys(routes[path].routes?.get).forEach(function (method) {
                app.get(`/${path.toLowerCase()}/${method.toLowerCase()}`, routes[path].routes?.get[method]);
            });
        }
    });
    
    app.post('*', function(req, res) {
        console.log('redirect to / (*2)');
        return res.redirect('/');
    });
}
