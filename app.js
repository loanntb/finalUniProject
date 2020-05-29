/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');

/* eslint-disable */
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});

// const upload = multer({ dest: path.join(__dirname, 'uploads') });
const upload = multer({ storage: storage });
/* eslint-enable */
/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/homeController');
const roomController = require('./controllers/roomController');
const menuController = require('./controllers/menuController');
const userController = require('./controllers/userController');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contactController');
const cafeController = require('./controllers/cafeController');
const TuyendungController = require('./controllers/tuyendungController');
/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  var arr=['/api/upload','/pages/home/slide','/pages/home/welcome','/pages/home/intro','/pages/room','/pages/room/delete','/pages/contact','/pages/contact/delete','/contact','/pages/cafe/slide','/pages/book/room/delete','/pages/tuyendung/slide'];
  if ( arr.indexOf(req.path) != -1) {
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user
    && req.path !== '/login'
    && req.path !== '/signup'
    && !req.path.match(/^\/auth/)
    && !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  } else if (req.user
    && (req.path === '/account' || req.path.match(/^\/api/))) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});


app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/chart.js/dist'), { maxAge: 31557600000 }));
// app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
// app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
// app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
// app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/menu', menuController.menu);
app.get('/room', roomController.homepage);
app.get('/cafe', cafeController.getHome);
app.get('/booking/:id', roomController.getbookID);
app.post('/booking', menuController.postHomeBookTable);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/role', passportConfig.isAuthenticated, userController.postUpdateRole);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * Primary admin routes.
 */
app.get('/pages/home', passportConfig.isAuthenticated, homeController.getHome);
app.post('/pages/home/slide', upload.single('slide'), passportConfig.isAuthenticated, homeController.postHomeSlide);
app.post('/pages/home/slide/delete',passportConfig.isAuthenticated, homeController.deleteHomeSlide);
app.post('/pages/home/welcome', upload.single('welcome'), passportConfig.isAuthenticated, homeController.postHomeWelcome);
app.post('/pages/home/intro', upload.single('intro'),passportConfig.isAuthenticated,homeController.postHomeIntro);
app.post('/pages/home/intro/delete',passportConfig.isAuthenticated, homeController.deleteHomeIntro);
//room
app.get('/pages/room', passportConfig.isAuthenticated,roomController.index);
app.post('/pages/room',upload.single('room'),passportConfig.isAuthenticated,roomController.postHomeRoom);
app.post('/pages/room/delete',passportConfig.isAuthenticated, roomController.deleteHomeRoom);
//menu
app.get('/pages/menu',passportConfig.isAuthenticated,menuController.index);
app.post('/pages/menu',passportConfig.isAuthenticated,menuController.postMenu);
app.post('/pages/menu/delete',passportConfig.isAuthenticated, menuController.deleteMenu);
//book
app.get('/pages/book/table/:page?',passportConfig.isAuthenticated, menuController.getbook);
app.post('/pages/book/table/delete',passportConfig.isAuthenticated, menuController.deleteBookTable);
app.get('/pages/book/room/:page?',passportConfig.isAuthenticated, roomController.getbook);
app.post('/pages/book/room/',passportConfig.isAuthenticated, roomController.postBookRoom);
app.post('/pages/book/room/delete',passportConfig.isAuthenticated, roomController.deleteBookRoom);
//contact
app.get('/pages/contact',passportConfig.isAuthenticated, contactController.index);
app.post('/pages/contact',upload.single('contact'),passportConfig.isAuthenticated, contactController.postHomeContact);
app.post('/pages/contact/delete',passportConfig.isAuthenticated, contactController.deleteContact);
//cafe
app.get('/pages/cafe',passportConfig.isAuthenticated, cafeController.getAdmin);
app.post('/pages/cafe',passportConfig.isAuthenticated, cafeController.postHomeCafe);
app.post('/pages/cafe/slide',upload.array('image'),passportConfig.isAuthenticated, cafeController.postSilde);
app.post('/pages/cafe/delete',passportConfig.isAuthenticated, cafeController.deleteSlides);
app.get('/pages/account', passportConfig.isAuthenticated, userController.getListAccount);
app.get('/pages/email', passportConfig.isAuthenticated, userController.getEmailConfig);
app.post('/pages/email', passportConfig.isAuthenticated, userController.postEmailConfig);
//tuyen dung
app.get('/tuyendung', TuyendungController.index);
app.get('/pages/tuyendung', passportConfig.isAuthenticated, TuyendungController.getHome);
app.post('/pages/tuyendung/slide', upload.single('slide'), passportConfig.isAuthenticated, TuyendungController.postHomeSlide);
app.post('/pages/tuyendung/slide/delete',passportConfig.isAuthenticated, TuyendungController.deleteHomeSlide);
app.post('/pages/tuyendung/info',passportConfig.isAuthenticated, TuyendungController.postHomeWelcome);
/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);



app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
app.get('/api/upload', apiController.getFileUpload);
app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);
app.get('/api/google-maps', apiController.getGoogleMaps);
app.get('/api/chart', apiController.getChart);

/**
 * OAuth authentication routes. (Sign in)
 */

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});

app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});

app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});


/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
