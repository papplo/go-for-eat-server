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
  constructor (Restaurants, PartyOf, Events, monk) {
    this.Restaurants = Restaurants;
    this.PartyOf = PartyOf;
    this.Events = Events;
    this.monk = monk;
  }


  // createRestaurant endpoint takes: email, password, googleNodeObject,
  // createRestaurant endpoint creates uuidv4 token
  async createRestaurant (ctx, next) {
    if ('POST' != ctx.method) return await next();

    const { email, password, address, googlePlaceData} = ctx.request.body;

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
          googlePlaceData : googlePlaceData
        });
        const restaurant = await this.Restaurants.findOne({email : email});
        ctx.status = 203;
        ctx.body = {
          'status': 'success',
          'method': 'basic',
          'restaurant' : filterProps(restaurant, [
            '_id',
            'email',
            'token',
            'googlePlaceData',
          ])
        };
      } else {
        ctx.status = 400;
        ctx.body = 'User with email already exists';
      }

    } catch (e) {
      Raven.captureException(e);
      ctx.status = 500;
    }
  }

  async getRestaurant (ctx, next) {
    if ('GET' != ctx.method) return await next();

    const token = ctx.request.header.authorization;
    const { email, password } = ctx.request.header;

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
            'method': 'token',
            'restaurant' : filterProps(restaurant, [
              '_id',
              'email',
              'token',
              'googlePlaceData',
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
        } else {
          const match = await bcrypt.compare(password, restaurant.password);
          if (!match) {
            ctx.status = 401;
            ctx.body = 'Your password does not match our records';
          } else {
            ctx.status = 202;
            ctx.body = {
              'status': 'success',
              'method': 'basic',
              'restaurant' : filterProps(restaurant, [
                '_id',
                'email',
                'token',
                'googlePlaceData',
              ])
            };
          }
        }
      } catch (e) {
        Raven.captureException(e);
        ctx.status = 500;
      }

    }
  }

  async editRestaurant (ctx, next) {
    if ('PUT' != ctx.method) return await next();
  }

  async createPartyOf (ctx, next) {
    if ('POST' != ctx.method) return await next();

    // middleware to come....
    ctx.user = ctx.headers.authorization.split(' ').pop();

    const newPartyOf = {
      party_of_title: ctx.request.body.party_of_title,
      offer: ctx.request.body.offer,
      party_cipanti: ctx.request.body.party_cipanti,
      place_id: ctx.request.body.place_id,
      place_name: ctx.request.body.place_name,
      place_address: ctx.request.body.place_address,
      location: ctx.request.body.location,
      place_url: ctx.request.body.place_url ? ctx.request.body.place_url : '',
      when: ctx.request.body.when,
      creator: ctx.user,
      attendees: []
    };
    try {
      // for (const key in newPartyOf) {
      //   if (!newPartyOf[key]) return (ctx.status = 400);
      // }
      if (
        !ctx.request.body.location.coordinates[1] ||
        !ctx.request.body.location.coordinates[0]
      )
        return (ctx.status = 400);
      if (
        !regexLat.test(ctx.request.body.location.coordinates[1]) ||
        !regexLng.test(ctx.request.body.location.coordinates[0])
      )
        return (ctx.status = 400);

      const PartyOf = await this.PartyOf.insert(newPartyOf);
      ctx.status = 201;
      ctx.body = { PartyOf };
    } catch (e) {
      Raven.captureException(e);
      ctx.status = 500;
    }
  }


  async getAllPartyOf (ctx, next) {
    if ('GET' != ctx.method) return await next();

    // middleware to come....
    const tokenClean = ctx.headers.authorization.split(' ').pop();

    const restaurant = await this.Restaurants.findOne({ token: tokenClean });
    if (restaurant) {
      const PartyOf = await this.PartyOf.find({ creator: tokenClean });
      if (PartyOf) {
        ctx.status = 200;
        console.log(PartyOf.length + ' Parties of Found!');
        ctx.body = PartyOf;
      }
      else {
        ctx.status = 400;
        ctx.body = 'No Parties Of found, get started now!'
      }
    }
    else {
      ctx.status = 400;
      ctx.body = 'User not authenticated';
    }

  }

  async _auth (ctx, next) {
    if ('POST' != ctx.method) return await next();
    console.log(ctx.request.body);
    ctx.body = 'welcome';
  }

}




module.exports = ManagerController;
