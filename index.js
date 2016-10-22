'use strict'

/* Import libs */
const config = require('./config');
const express = require('express');
const formidable = require('express-formidable');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const jade = require('jade');

/* Create constant */
const app = express();

/* Configuratión server */
app.set('view engine', 'jade');
app.use(express.static('public'));
app.use(formidable());
app.use(methodOverride('_method'));
app.use(cookieSession({ name: "session", keys: [config.SECRET]}));

/* Controllers */
app.use(require('./controllers/user_controllers.js'));

/* Run server */
app.listen(config.PORT, () => {
	console.log(`WEB run on http://localhost:${config.PORT}`);
});
