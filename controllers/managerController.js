'use strict';
const uuidv4 = require('uuidv4');
const bcrypt = require('bcrypt');
const Raven = require('raven');
Raven.config(process.env.SENTRY_DSN).install();

const regexLat = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
const regexLng = /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;


class ManagerController {
  constructor (Restaurants, Events, monk) {
    this.Restaurants = Restaurants;
    this.Events = Events;
    this.monk = monk;
  }


  // createRestaurant endpoint takes: email, password, googleNodeObject,
  // createRestaurant endpoint creates uuidv4 token
  async createRestaurant (ctx, next) {
    if ('POST' != ctx.method) return await next();

    // Check for required fields
    const required = { id, description, placeId, active, formattedSuggestion, terms, types } = ctx.request.body.googlePlaceData;

    try {
      console.log(description);
      //console.log(ctx.request.body);
      const token = uuidv4();
      ctx.body = token + 'hello';
    } catch (e) {
      // Raven.captureException(e);
      console.log(e);
      ctx.status = 500;
    }
  }

  async getRestaurant (ctx, next) {
    if ('GET' != ctx.method) return await next();
    try {
      ctx.status = 200;
      ctx.body = 'Hello Worldz';

    } catch (e) {
      console.log(e);
    }
  }

  async editRestaurant (ctx, next) {
    if ('PUT' != ctx.method) return await next();
    try {
      ctx.status = 200;
      ctx.body = 'Hello Worldz';
    } catch (e) {
      console.log(e);
    }
  }

  async _auth (ctx, next) {
    if ('POST' != ctx.method) return await next();
    console.log(ctx.request.body);
    ctx.body = 'welcome';
  }
  async _fetchCreatedEvents (ctx, next) {}
  async _fetchAttendedEvents (ctx, next) {}
  async _notYet (ctx, next) {}


}




module.exports = ManagerController;
