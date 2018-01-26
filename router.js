'use strict';

const usersController = require('./controllers/usersController');
const eventsController = require('./controllers/eventsController');
const ratingController = require('./controllers/ratingController');
const restaurntsController = require('./controllers/restaurntsController');

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
    .post('/auth', usersController.auth)
    .get('/user/:id', authorize,, usersController.getUser)
    .put('/user/:id', authorize,, usersController.rating)
    .get('/me', authorize, usersController.me)
    .put('/me', authorize, usersController.edit)

    .post('/event', authorize, eventsController.createEvent)
    .put('/event/:id', authorize, eventsController.editEvent)
    .delete('/event/:id', authorize, eventsController.deleteEvent)
    .get('/event/:id', authorize, eventsController.getEvent)
    .post('/event/:id/join', authorize, eventsController.joinEvent)
    .post('/event/:id/leave', authorize, eventsController.leaveEvent)
    .get('/events/:latlng/:from/:to', authorize, eventsController.getEvents)

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
