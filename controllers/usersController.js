'use strict';
const axios = require('axios');
const config = require('../config.js');
const filterProps = require('../services/utils').filterProps;

const monk = require('monk');
const db = monk(process.env.MONGOLAB_URI);

const Events = db.get('events');
const Users = db.get('users');


const userDB = async (userData) => {
	// console.log('userDB:', userData);
	let user = await Users.findOne({email: userData.email});
	// console.log('findOne:', user);
	if (!user) {
		try {
      // console.log('new user');
      userData.ratings_number = userData.ratings_average = '0';
      userData.description = userData.profession = '';
      userData.interests = [];
			return Users.insert(userData);
		} catch (e) { console.error('Users.insert', e); }
	} else {
		try {
			await Users.update({email: userData.email}, { $set: {
				'name': userData.name,
        'email': userData.email,
        'profile_picture': userData.profile_picture,
        'birthday': userData.birthday,
        'gender': userData.gender,
				'accessToken': userData.accessToken,
			}});
			// console.log('update user');
			return Users.findOne({email: userData.email});
		} catch(e) { console.error('Update user error', e); }
	}
};

module.exports.auth = async (ctx, next) => {
	if ('POST' != ctx.method) return await next();
  // console.log('auth', ctx.request.body);
	if (ctx.request.body.network == 'facebook') {
		try {
			let authResult = await axios.get(config.facebook.validateUrl+config.facebook.fields, {
				headers: {
					'Authorization': 'Bearer ' + ctx.request.body.accessToken,
				}
			});
			console.log('authResult', authResult);
			if (authResult.data.id == ctx.request.body.id) {
				const events = await Events.find({events: ctx.request.body.id});
				const created_events = await Events.find({created_events: ctx.request.body.id});
				let user = {
					'name': authResult.data.first_name,
					'email': authResult.data.email,
					'profile_picture': authResult.data.picture.data.url,
					'birthday': authResult.data.birthday,
					'gender': authResult.data.gender,
					'events': events,
					'created_events': created_events,
					'accessToken': 'FB' + ctx.request.body.accessToken,
				};
				user = await userDB(user);
				// console.log('user', user);
				if (user.email) {
					ctx.status = 200;
					ctx.body = JSON.stringify({'user': user});
					return;
				}
			}
		} catch(e) { console.error('Facebook validate error', e); }
	} else if (ctx.request.body.network == 'google') {
		console.log('google ctx.request.body', ctx.request.body);
		try {
			let authResult = await axios.get(config.google.validateUrl + ctx.request.body.idToken, {
				headers: {
					'Authorization': 'Bearer ' + ctx.request.body.accessToken,
				}
			});
			console.log('authResult', authResult.data);
			if (authResult.data.sub == ctx.request.body.id) {
				let user = {
					'name': authResult.data.given_name,
					'email': authResult.data.email,
					'profile_picture': authResult.data.picture,
					'birthday': authResult.data.birthday,
					'gender': authResult.data.gender,
					'accessToken': 'GO' + ctx.request.body.accessToken,
				};
				console.log('user', user);
				user = await userDB(user);
				if (user.email) {
					ctx.status = 200;
					ctx.body = JSON.stringify({'user': user});
					return;
				}
			}
		} catch(e) { console.error('Google validate error', e); }
	} if (ctx.request.body.network == 'linkedin') {
		console.log('linkedin ctx.request.body', ctx.request.body);
	}
	ctx.status = 400;
};

module.exports.getUser = async (ctx, next) => {
	if ('GET' != ctx.method) return await next();
	try {
    let user = await Users.findOne({_id: ctx.params.id});
		user = filterProps(user, ['_id', 'name', 'profile_picture', 'gender', 'birthday', 'ratings_number', 'ratings_average', 'interests', 'description', 'profession']);
    ctx.status = 200;
    ctx.body = user;
	} catch(e) { console.error('Get user error', e); }
};

module.exports.me = async (ctx, next) => {
	if ('GET' != ctx.method) return await next();
	ctx.status = 200;
	ctx.body = ctx.user;
};

module.exports.edit = async (ctx, next) => {
	if ('PUT' != ctx.method) return await next();
	try {
		await Users.update({_id: ctx.user._id}, ctx.request.body.edit);
		// the recived object should be like this:
		// ctx.request.body.edit =
		// {
		//   'interests': [tennis , video games, food],
    //   'description': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    //   'profession': 'Full stack developer'
		// }
	} catch(e) { console.error('Edit user error', e); }
	ctx.status = 204;
};
