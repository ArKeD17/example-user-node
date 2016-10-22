'use strict'

/* Imports libs */
const express = require('express');
const User = require('../models/user_models'); // Import model

/* Create constant */
const router = express.Router();

router.route('/')
	.get((req, res) => {
		res.render('index');
	})
	.post(User.login);

router.get('/sign_out', (req, res) => {
	delete req.session.user;
	res.redirect('/');
});

router.route('/register')
	.get((req, res) => {
		res.render('register');
	})
	.post(User.register);

router.route('/profile')
	.get((req, res) => {
		if(req.session.user != undefined)
			res.render('profile', {user: req.session.user});
		else
			res.redirect('/');
	})
	.put(User.profile);

/* Export module */
module.exports = router;
