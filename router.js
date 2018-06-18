'use strict';
const router = require('koa-router')();

const UsersController = require('./controllers/usersController');
const EventsController = require('./controllers/eventsController');
const RatingsController = require('./controllers/ratingsController');
const ManagerController = require('./controllers/managerController');

// MongoDb configure
const monk = require('monk');
const db = monk(process.env.MONGOLAB_URI);

// Creating Db instances
const Events = db.get('events');
const PartyOf = db.get('partyOf');
const Users = db.get('users');
const Ratings = db.get('ratings');
const Restaurants = db.get('restaurants');

// Geo Indexing for MongoDb
Events.createIndex({ location: '2dsphere' });

const eventsController = new EventsController(Events);
const ratingsController = new RatingsController(Ratings, Users);
// monk here is mandatory!
const usersController = new UsersController(Users, Events, monk, Ratings);
const managerController = new ManagerController(Restaurants, PartyOf, Events, monk);

const authorize = async (ctx, next) => {
  if (!ctx.user) {
    ctx.status = 401;
    return;
  }

  await next();
};


const routes = function (app) {
  router
    // Authorization
    .post(
      '/api/v1/auth',
      usersController.auth.bind(usersController)
    )
    // Get users info
    .get(
      '/api/v1/users/:id',
      authorize,
      usersController.getUser.bind(usersController)
    )
    // Get my info
    .get(
      '/api/v1/me',
      authorize,
      usersController.me.bind(usersController)
    )
    // Modify my info
    .put(
      '/api/v1/me',
      authorize,
      usersController.editUser.bind(usersController)
    )
    // Rate user
    .put(
      '/api/v1/users/:id/rating',
      authorize,
      ratingsController.rateUser.bind(ratingsController)
    )
    .post(
      '/api/v1/events',
      authorize,
      eventsController.createEvent.bind(eventsController)
    )
    .put(
      '/api/v1/events/:id',
      authorize,
      eventsController.editEvent.bind(eventsController)
    )
    .delete(
      '/api/v1/events/:id',
      authorize,
      eventsController.deleteEvent.bind(eventsController)
    )
    .get(
      '/api/v1/events/:id',
      authorize,
      eventsController.getEvent.bind(eventsController)
    )
    .put(
      '/api/v1/events/:id/users',
      authorize,
      eventsController.joinEvent.bind(eventsController)
    )
    .delete(
      '/api/v1/events/:id/users',
      authorize,
      eventsController.leaveEvent.bind(eventsController)
    )
    .get(
      '/api/v1/events',
      authorize,
      eventsController.getEvents.bind(eventsController)
    )




    // create, Basic Auth for now
    .post(
      '/manager/register/',
      managerController.createRestaurant.bind(managerController)
    )
    // get my info (login)
    .get(
      '/manager/login/',
      managerController.getRestaurant.bind(managerController)
    )
    // edit my info
    .put(
      '/manager/restaurant/:id',
      managerController.editRestaurant.bind(managerController)
    )

    // create new custom event
    .post(
      '/manager/partyof/',
      managerController.createPartyOf.bind(managerController)
    )
    // get all custom event
    .get(
      '/manager/partyof/',
      managerController.getAllPartyOf.bind(managerController)
    )





    .options('/', options)
    .trace('/', trace)
    .head('/', head);

  app.use(router.routes()).use(router.allowedMethods());

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
