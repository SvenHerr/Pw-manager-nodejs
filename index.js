// This script runs on serverside

// dependencies required for the app
import 'dotenv/config';

import bodyParser from 'body-parser';
import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import helmet from 'helmet';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import FileStore from 'session-file-store';

import cache from './cache.js';
import routes from './routes.js';

const SessionFileStore = FileStore(session);

i18next.use(Backend).use(middleware.LanguageDetector).init({
  backend : {loadPath : './locales/{{lng}}/translation.json'},
  fallbackLng : 'en',
  preload : [ 'en', 'de' ]
});

const app = express();

const limiter = rateLimit({
  windowMs : 15 * 60 * 1000, // 15 minutes
  max :
      900, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders : true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders : false,  // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(middleware.handle(i18next));

app.use(cache());

app.use(helmet({
  contentSecurityPolicy :
      process.env.HTTPS === 'true' || process.env.HTTPS === true ? true : false,
}));

// Why do i need extended false and not true?
// https://stackoverflow.com/questions/35931135/cannot-post-error-using-express
app.use(bodyParser.urlencoded({extended : false}));

app.set('view engine', 'ejs');

// render css files
app.use(express.static('public'));

// Is only stored on server.
app.use(session({
  secret : process.env.SECRET,
  resave : true,
  saveUninitialized : true,
  store : new SessionFileStore({
    path : './sessions',
    ttl : 15 * 60, // 15 minutes
    reapAsync : true
  })
}));

// routing
routes(app);

// set app to listen on port 3001
app.listen(3001, function() { console.log('server is running on port 3001'); });
