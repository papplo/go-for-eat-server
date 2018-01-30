'use strict';

const usersController = require('./controllers/usersController');
const EventsController = require('./controllers/eventsController');
const ratingsController = require('./controllers/ratingsController');

const monk = require('monk');
const db = monk(process.env.MONGOLAB_URI);

const Events = db.get('events');
const Users = db.get('users');


Events.createIndex( { location : "2dsphere" } );


const eventsController = new EventsController(Events);


const router = require('koa-router')();

const authorize = async (ctx, next) => {
	if (!ctx.user) {
		ctx.status = 401;
		return;
	}

	await next();
};

const routes = function (app) {
	router
		.post('/api/v1/auth', usersController.auth)
		.get('/api/v1/users/:id', authorize, usersController.getUser)
		.get('/api/v1/me', authorize, usersController.me)
		.put('/api/v1/me', authorize, usersController.edit)
		.put('/api/v1/users/:id', authorize, ratingsController.rating)

		.post('/api/v1/events', authorize, eventsController.createEvent.bind(eventsController))
		.put('/api/v1/events/:id', authorize, eventsController.editEvent.bind(eventsController))
		.delete('/api/v1/events/:id', authorize, eventsController.deleteEvent.bind(eventsController))
		.get('/api/v1/events/:id', authorize, eventsController.getEvent.bind(eventsController))
		.put('/api/v1/events/:id/users', authorize, eventsController.joinEvent.bind(eventsController))
		.delete('/api/v1/events/:id/users', authorize, eventsController.leaveEvent.bind(eventsController))
		.get('/api/v1/events', authorize, eventsController.getEvents.bind(eventsController))

		.options('/', options)
		.trace('/', trace)
		.head('/', head);

	app
		.use(router.routes())
		.use(router.allowedMethods());

	return app;
};


const head = async () => {
	return;
};

const options = async () => {
	this.body = 'Allow: HEAD,GET,PUT,DELETE,OPTIONS';
};

const trace = async () => {
	this.body = 'Smart! But you can\'t trace.';
};

module.exports = routes;
