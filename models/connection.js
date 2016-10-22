'use strict'

/* Imports libs */
const config = require('../config');
const mongoose = require('mongoose');
const easyimage = require('easyimage');
const fs = require('fs');

/* Connection to variables DB */
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/example-user-node', (err, res) => {
	if(err) console.log(`Error connecting to mongodb: ${err}`);
	else console.log('Connection to successful mongodb.');
});

/* Export module */
module.exports = mongoose;

/* Retrieve query error */
module.exports.error = (err) => {
     let error = "";
     if(err.errors != undefined)
        for(var key in err.errors)
            error += err.errors[key].message;
    else if(err.errmsg != undefined)
        error = `${err.errmsg.split(':')[2].split('_')[0].replace("  ", "")} registration already exists`;
    else
        error = "Opps error system";
    return error;
}

/* Function to encrypt strings */
module.exports.crypt = (string) => {
	const crypto = require('crypto');
	return crypto.createHmac('md5', config.SECRET).update(string).digest('hex');
}

/* Function to upload images */
module.exports.upload_image = (path_image, imagen, nombre=false, size=300) => {
   	if(imagen != undefined){
		var extencion = imagen.name.split('.').pop();
        if(!nombre){
		    nombre = Date.now() + '.' + extencion;
            return nombre;
        }
		fs.rename(imagen.path, path_image + 'o_' + nombre);
		easyimage.info(path_image + 'o_' + nombre).then(
			(file) => {
				easyimage.resize({
					src: path_image + 'o_' + nombre,
					dst: path_image + 't_' + nombre,
					width: size,
					height: (size*file.height)/file.width
				});
			}, (err) => { console.log(`Miniatura fallida ${err}`); }
		);
		return nombre;
	}
	return imagen;
}
