'use strict';
const uuidv4 = require('uuidv4');
const bcrypt = require('bcrypt');
const filterProps = require('../services/utils').filterProps;
const saltrounds = 10;
const mSecret = process.env.MANAGERSECRET || 'go4eatsecret';
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

    const { email, password, address} = ctx.request.body;

    const {
      id,
      description,
      placeId,
      active,
      formattedSuggestion,
      terms,
      types
    } = ctx.request.body.googlePlaceData;

    try {
      const restaurant = await this.Restaurants.findOne({ email: email });
      if (!restaurant) {
        const token = uuidv4();
        const hashedPass = await bcrypt.hash(password, saltrounds);

        await this.Restaurants.insert({
          email: email,
          password: hashedPass,
          token: token,
        });

        ctx.status = 203;
        ctx.body = await this.Restaurants.findOne({email : email});

      } else {
        ctx.status = 400;
        ctx.body = 'User with email already exists';
      }

    } catch (e) {
      // Raven.captureException(e);
      console.log(e);
      ctx.status = 500;
    }
  }

  async getRestaurant (ctx, next) {
    if ('GET' != ctx.method) return await next();

    const token = ctx.request.header.authorization;
    const { email, password} = ctx.request.header;

    if (token) {
      try {
        const tokenClean = token.split(' ').pop();
        const restaurant = await this.Restaurants.findOne({ token: tokenClean });
        if (!restaurant) {
          ctx.status = 401;
          ctx.body = 'Your token was not authorized';
        } else {
          ctx.body = {
            'status': 'success',
            'restaurant' : filterProps(restaurant, [
              '_id',
              'email',
              'token',
            ])
          };
        }
      } catch (e) {
        Raven.captureException(e);
        ctx.status = 500;
      }
    }

    if (email && password) {
      try {
        const restaurant = await this.Restaurants.findOne({ email: email });
        if (!restaurant) {
          ctx.status = 406;
          ctx.body = 'That email does not exist';
        }
        const match = await bcrypt.compare(password, restaurant.password);
        if (!match) {
          ctx.status = 401;
          ctx.body = 'Your password does not match our records';
        } else {
          ctx.status = 202;
          ctx.body = {
            'status': 'success',
            'restaurant' : filterProps(restaurant, [
              '_id',
              'email',
              'token',
            ])
          };
        }
      } catch (e) {
        // Raven.captureException(e);
        console.log(e);
        ctx.status = 500;
      }

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
