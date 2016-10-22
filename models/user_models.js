'use strict'

/* Import libs */
const conn = require('./connection');
const Schema = conn.Schema;
const formidable = require('express-formidable');
const fs = require('fs');

/* Create object from mongodb */
const user_schema = new Schema({
	name: String,
	email: {type: String, unique: true, required: [true, "Require email"]},
	password: {type: String, required: [true, "Require password"]},
	image: {type: String, default: 'no-img.png'}
});

/* Create model and functión utilitarian */
const User = conn.model('User', user_schema);
const path_image = './public/imgs/users/';

module.exports.login = (req, res) => {
	console.log(`POST ${req.route.path}`);
	
	User.findOne({ email: req.fields.email }, (err, user) => {
		if(err) return console.log(`Error findOne email: ${err}`);
		if(user == null) return res.render('index', {"error": `Does not exist registration email '${req.fields.email}'.`});

		if(user.password === conn.crypt(req.fields.password)){
			let u = JSON.parse(JSON.stringify(user));
			let d = `http://${req.headers.host}/${path_image.replace('./public/', '')}`;
			delete u.password;
			u.image = {"origin": `${d}o_${u.image}`, "thumb": `${d}t_${u.image}`};

			req.session.user = u;
			res.redirect('/profile');
		}else
			res.render('index', {"error": "Email or password is incorrect."});
	});
}

module.exports.register = (req, res) => {
	console.log(`POST ${req.route.path}`);

	// Create object
	let user = new User({
		name: req.fields.name,
		email: req.fields.email,
		password: conn.crypt(req.fields.password),
		image: conn.upload_image(path_image, req.files.image)
	});

	user.save().then((data) => {
		let u = JSON.parse(JSON.stringify(user));
		let d = `http://${req.headers.host}/${path_image.replace('./public/', '')}`;
		delete u.password;
		u.image = {"origin": `${d}o_${u.image}`, "thumb": `${d}t_${u.image}`};

		req.session.user = u;
		if(data.image != 'no-img.png')
			conn.upload_image(path_image, req.files.image, data.image);
		res.redirect('/profile');
	}, (err) => {
		res.render('register', {"error": conn.error(err)});
	});
}

module.exports.profile = (req, res) => {
	console.log(`PUT ${req.route.path}`);

	let u = req.session.user;
	if(u != undefined){
		User.findById(u._id, (err, user) => {
			if(err) return console.log(`Error findById id user: ${err}`);
			if(user == null) return res.redirect(301, '/');

			user.name = req.fields.name;
			u.name = req.fields.name;
			if(req.fields.password.length > 0)
				user.password = conn.crypt(req.fields.password);

			if(req.files.image != undefined)
				if(req.files.image.size > 0){
					let name_image = conn.upload_image(path_image, req.files.image);
					let image = conn.upload_image(path_image, req.files.image, name_image);
					let d = `http://${req.headers.host}/${path_image.replace('./public/', '')}`;
				
					// Delete image
					if(user.image != 'no-img.png'){
						fs.unlink(`${path_image}o_${user.image}`);
						fs.unlink(`${path_image}t_${user.image}`);
					}

					user.image = image;
					u.image = {"origin": `${d}o_${name_image}`, "thumb": `${d}t_${name_image}`};
				}

			User.findOne({ email: req.fields.email }, (err, e) => {
				let error = "";
				if(err) return console.log(`Error findOne update profile email: ${err}`);
				if(e == null){
					user.email = req.fields.email;
					u.email = req.fields.email;
				}else if(req.fields.email != user.email)
					error = "Email already registered";

				req.session.user = u;

				user.save().then((data) => {
					res.render('profile', {"user": req.session.user, "error": error});
				}, (err) => {
					res.render('profile', {"error": conn.error(err)});
				});
			});

		});
	}else
		res.redirect('/');
}
