'use strict';

const usersController = require('./controllers/usersController');
const EventsController = require('./controllers/eventsController');
const ratingsController = require('./controllers/ratingsController');

require('./db');

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

		.post('/api/v1/events', authorize, eventsController.createEvent)
		.put('/api/v1/events/:id', authorize, eventsController.editEvent)
		.delete('/api/v1/events/:id', authorize, eventsController.deleteEvent)
		.get('/api/v1/events/:id', authorize, eventsController.getEvent)
		.put('/api/v1/events/:id/users', authorize, eventsController.joinEvent)
		.delete('/api/v1/events/:id/users', authorize, eventsController.leaveEvent)
		.get('/api/v1/events', authorize, eventsController.getEvents)

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
