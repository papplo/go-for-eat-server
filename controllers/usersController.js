'use strict';
const axios = require('axios');
const config = require('../config.js');
const filterProps = require('../services/utils').filterProps;
const Raven = require('raven');

Raven.config(process.env.SENTRY_DSN).install();

const regexLat = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
const regexLng = /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;

class UsersController {
  constructor (Users, Events, monk, Ratings) {
    this.Users = Users;
    this.Events = Events;
    this.monk = monk;
    this.Ratings = Ratings;
  }

  async _fetchCreatedEvents (user, position) {
    return await this.Events.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [position.lng, position.lat] },
          distanceField: 'distance',
          // do not change monk.id
          query: { creator: this.monk.id(user._id) },
          spherical: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'attendees',
          foreignField: '_id',
          as: 'attendees'
        }
      },
      {
        $project: {
          'attendees.email': 0,
          'attendees.birthday': 0,
          'attendees.gender': 0,
          'attendees.events': 0,
          'attendees.created_events': 0,
          'attendees.accessToken': 0,
          'attendees.ratings_number': 0,
          'attendees.profession': 0,
          'attendees.description': 0,
          'attendees.interests': 0
        }
      }
    ]);
  }

  async _fetchAttendedEvents (user, position) {
    return await this.Events.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [position.lng, position.lat] },
          distanceField: 'distance',
          // do not change monk.id
          query: { attendees: this.monk.id(user._id) },
          spherical: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'attendees',
          foreignField: '_id',
          as: 'attendees'
        }
      },
      {
        $project: {
          'attendees.email': 0,
          'attendees.birthday': 0,
          'attendees.gender': 0,
          'attendees.events': 0,
          'attendees.created_events': 0,
          'attendees.accessToken': 0,
          'attendees.ratings_number': 0,
          'attendees.profession': 0,
          'attendees.description': 0,
          'attendees.interests': 0
        }
      }
    ]);
  }

  async _userDB (userData) {
    const user = await this.Users.findOne({ email: userData.email });
    if (!user) {
      try {
        userData.ratings_number = userData.ratings_average = 0;
        userData.description = userData.profession = '';
        userData.interests = '';
        return await this.Users.insert(userData);
      } catch (e) {
        Raven.captureException(e, {
          username: ctx.user.name,
          id: ctx.user._id
        }); // ctx.status = 500;
      }
    } else {
      try {
        await this.Users.update(
          { email: userData.email },
          {
            $set: {
              name: userData.name,
              email: userData.email,
              profile_picture: userData.profile_picture,
              birthday: userData.birthday,
              gender: userData.gender,
              position: userData.position,
              accessToken: userData.accessToken
            }
          }
        );
        return await this.Users.findOne({ email: userData.email });
      } catch (e) {
        Raven.captureException(e, {
          username: ctx.user.name,
          id: ctx.user._id
        }); // ctx.assert(500);
      }
    }
  }

  async auth (ctx, next) {
    if ('POST' != ctx.method) return await next();
    if (!ctx.request.body.position.lat) {
      ctx.assert(400, 'Latitude coordinate not present');
    }
    if (!ctx.request.body.position.lat) {
      ctx.assert(400, 'Latitude coordinate not present');
    }
    if (!ctx.request.body.position) {
      ctx.assert(400, 'Missing position coordinates');
    }
    if (
      !regexLat.test(ctx.request.body.position.lat) ||
      !regexLng.test(ctx.request.body.position.lng)
    ) {
      ctx.assert(403, 'Bad coordinates type');
    }
    if (ctx.request.body.network == 'facebook') {
      try {
        const authResult = await axios.get(
          config.facebook.validateUrl + config.facebook.fields,
          {
            headers: {
              Authorization: `Bearer ${ctx.request.body.accessToken}`
            }
          }
        );
        if (authResult.data.id == ctx.request.body.id) {
          let user = {
            name: authResult.data.first_name,
            email: authResult.data.email,
            profile_picture: authResult.data.picture.data.url,
            birthday: authResult.data.birthday,
            gender: authResult.data.gender,
            position: ctx.request.body.position,
            events: [],
            created_events: [],
            accessToken: `FB${ctx.request.body.accessToken}`
          };
          user = await this._userDB(user);
          user.created_events = await this._fetchCreatedEvents(
            user,
            ctx.request.body.position
          );
          user.events = await this._fetchAttendedEvents(
            user,
            ctx.request.body.position
          );
          if (user.email) {
            ctx.status = 200;
            ctx.body = { user };
            return;
          }
        }
      } catch (e) {
        Raven.captureException(e, {
          username: ctx.user.name,
          id: ctx.user._id
        }); // ctx.assert(500);
      }
    } else if (ctx.request.body.network == 'google') {
      try {
        const authResult = await axios.get(
          config.google.validateUrl + ctx.request.body.idToken,
          {
            headers: {
              Authorization: `Bearer ${ctx.request.body.accessToken}`
            }
          }
        );
        if (authResult.data.sub == ctx.request.body.id) {
          const { data } = await axios.get(config.google.birthdayRequest, {
            headers: {
              Authorization: `Bearer ${ctx.request.body.accessToken}`
            }
          });

          const birthday = data.birthdays[1]
            ? `${data.birthdays[1].date.month}/${data.birthdays[1].date.day}/${
              data.birthdays[1].date.year
            }`
            : '';
          let user = {
            name: authResult.data.given_name,
            email: authResult.data.email,
            profile_picture: authResult.data.picture,
            birthday: birthday,
            gender: authResult.data.gender,
            position: ctx.request.body.position,
            accessToken: `GO${ctx.request.body.accessToken}`
          };
          user = await this._userDB(user);
          user.created_events = await this._fetchCreatedEvents(
            user,
            ctx.request.body.position
          );
          user.events = await this._fetchAttendedEvents(
            user,
            ctx.request.body.position
          );
          if (user.email) {
            ctx.status = 200;
            ctx.body = { user };
            return;
          }
        }
      } catch (e) {
        Raven.captureException(e, {
          username: ctx.user.name,
          id: ctx.user._id
        }); // ctx.assert(500);
      }
    } else if (ctx.request.body.network == 'linkedin') {
      try {
        const authResult = await axios.get(config.linkedin.apiUrl, {
          headers: {
            Authorization: `Bearer ${ctx.request.body.accessToken}`
          }
        });
        if (authResult.data.id == ctx.request.body.id) {
          let user = {
            name: authResult.data.formattedName,
            email: authResult.data.emailAddress,
            profile_picture: authResult.data.picture.data.pictureUrl,
            birthday: '',
            gender: '',
            profession: authResult.data.position,
            position: ctx.request.body.position,
            events: [],
            created_events: [],
            accessToken: `LI${ctx.request.body.accessToken}`
          };
          user = await this._userDB(user);
          user.created_events = await this._fetchCreatedEvents(
            user,
            ctx.request.body.position
          );
          user.events = await this._fetchAttendedEvents(
            user,
            ctx.request.body.position
          );
          if (user.email) {
            ctx.status = 200;
            ctx.body = { user };
            return;
          }
        }
      } catch (e) {
        Raven.captureException(e, {
          username: ctx.user.name,
          id: ctx.user._id
        }); // ctx.assert(500);
      }
    }
  }

  async getUser (ctx, next) {
    if ('GET' != ctx.method) return await next();
    try {
      const paramId = ctx.params.id;
      let user = await this.Users.findOne({ _id: paramId });
      if (!user) return (ctx.status = 404);
      user = filterProps(user, [
        '_id',
        'name',
        'profile_picture',
        'gender',
        'birthday',
        'ratings_number',
        'ratings_average',
        'interests',
        'description',
        'profession'
      ]);
      user.myRating = await this.Ratings.findOne({
        user_id: paramId,
        author: ctx.user._id.$oid
      });
      ctx.status = 200;
      ctx.body = user;
    } catch (e) {
      Raven.captureException(e, {
        username: ctx.user.name,
        id: ctx.user._id
      }); // ctx.assert(500);
    }
  }

  async me (ctx, next) {
    if ('GET' != ctx.method) return await next();
    if (!ctx.request.query.lat || !ctx.request.query.lng)
      return ctx.assert(400, 'Missing coordinates');
    if (
      !regexLat.test(ctx.request.query.lat) ||
      !regexLng.test(ctx.request.query.lng)
    )
      return ctx.assert(403, 'Bad coordinates type');
    const position = {
      lat: Number(ctx.request.query.lat),
      lng: Number(ctx.request.query.lng)
    };
    ctx.user.created_events = await this._fetchCreatedEvents(
      ctx.user,
      position
    );
    ctx.user.events = await this._fetchAttendedEvents(ctx.user, position);
    ctx.status = 200;
    ctx.body = ctx.user;
  }

  async editUser (ctx, next) {
    if ('PUT' != ctx.method) return await next();
    try {
      const update = { $set: {} };
      if (ctx.request.body.edit.interests) {
        update.$set.interests =
          ctx.request.body.edit.interests.length >= 140
            ? ctx.request.body.edit.interests.substring(0, 139)
            : ctx.request.body.edit.interests;
      }
      if (ctx.request.body.edit.description) {
        update.$set.description =
          ctx.request.body.edit.description.length >= 140
            ? ctx.request.body.edit.description.substring(0, 139)
            : ctx.request.body.edit.description;
      }
      if (ctx.request.body.edit.profession) {
        update.$set.profession =
          ctx.request.body.edit.profession.length >= 140
            ? ctx.request.body.edit.profession.substring(0, 139)
            : ctx.request.body.edit.profession;
      }
      if (ctx.request.body.edit.position) {
        if (
          !ctx.request.body.edit.position.lng ||
          !ctx.request.body.edit.position.lat
        ) {
          ctx.assert(400, 'Missing coordinates');
        }
        if (
          !regexLat.test(ctx.request.body.edit.position.lat) ||
          !regexLng.test(ctx.request.body.edit.position.lng)
        ) {
          ctx.assert(403, 'Bad coordinates type');
        }
        update.$set.position;
      }
      const resultUpdate = await this.Users.update(
        { _id: ctx.user._id },
        update
      );
      if (!resultUpdate.nMatched) return (ctx.status = 404);
      ctx.body = await this.Users.findOne({ _id: ctx.user._id });
      ctx.status = 204;
    } catch (e) {
      Raven.captureException(e, {
        username: ctx.user.name,
        id: ctx.user._id
      }); // ctx.assert(500);
    }
  }
}

module.exports = UsersController;
