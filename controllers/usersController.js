'use strict';
const axios = require('axios');
const config = require('../config.js');
const filterProps = require('../services/utils').filterProps;

class UsersController {
  constructor (Users, Events, monk) {
    this.Users = Users;
    this.Events = Events;
    this.monk = monk;
  }

  async _userDB (userData) {
    const user = await this.Users.findOne({ email: userData.email });
    if (!user) {
      try {
        userData.ratings_number = userData.ratings_average = '0';
        userData.description = userData.profession = '';
        userData.interests = '';
        return await this.Users.insert(userData);
      } catch (e) {
        Raven.captureException(e);
        ctx.status = 500;
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
              accessToken: userData.accessToken
            }
          }
        );
        return await this.Users.findOne({ email: userData.email });
      } catch (e) {
        Raven.captureException(e);
        ctx.status = 500;
      }
    }
  }

  async auth (ctx, next) {
    if ('POST' != ctx.method) return await next();
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
            events: [],
            created_events: [],
            accessToken: `FB${ctx.request.body.accessToken}`
          };
          user = await this._userDB(user);
          user.events = await this.Events.aggregate([
            { $match: { attendees: this.monk.id(user._id) } },
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
                'attendees.ratings_average': 0,
                'attendees.ratings_number': 0,
                'attendees.profession': 0,
                'attendees.description': 0,
                'attendees.interests': 0
              }
            }
          ]);

          user.created_events = await this.Events.aggregate([
            { $match: { creator: this.monk.id(user._id) } },
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
                'attendees.ratings_average': 0,
                'attendees.ratings_number': 0,
                'attendees.profession': 0,
                'attendees.description': 0,
                'attendees.interests': 0
              }
            }
          ]);
          if (user.email) {
            ctx.status = 200;
            ctx.body = { user };
            return;
          }
        }
      } catch (e) {
        Raven.captureException(e);
        ctx.status = 500;
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
            accessToken: `GO${ctx.request.body.accessToken}`
          };
          user = await this._userDB(user);
          user.events = await this.Events.aggregate([
            { $match: { attendees: this.monk.id(user._id) } },
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
                'attendees.ratings_average': 0,
                'attendees.ratings_number': 0,
                'attendees.profession': 0,
                'attendees.description': 0,
                'attendees.interests': 0
              }
            }
          ]);

          user.created_events = await this.Events.aggregate([
            { $match: { creator: this.monk.id(user._id) } },
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
                'attendees.ratings_average': 0,
                'attendees.ratings_number': 0,
                'attendees.profession': 0,
                'attendees.description': 0,
                'attendees.interests': 0
              }
            }
          ]);

          if (user.email) {
            ctx.status = 200;
            ctx.body = { user };
            return;
          }
        }
      } catch (e) {
        Raven.captureException(e);
        ctx.status = 500;
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
            events: [],
            created_events: [],
            accessToken: `LI${ctx.request.body.accessToken}`
          };
          user = await this._userDB(user);
          user.events = await this.Events.aggregate([
            { $match: { attendees: this.monk.id(user._id) } },
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
                'attendees.ratings_average': 0,
                'attendees.ratings_number': 0,
                'attendees.profession': 0,
                'attendees.description': 0,
                'attendees.interests': 0
              }
            }
          ]);

          user.created_events = await this.Events.aggregate([
            { $match: { creator: this.monk.id(user._id) } },
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
                'attendees.ratings_average': 0,
                'attendees.ratings_number': 0,
                'attendees.profession': 0,
                'attendees.description': 0,
                'attendees.interests': 0
              }
            }
          ]);

          if (user.email) {
            ctx.status = 200;
            ctx.body = { user };
            return;
          }
        }
      } catch (e) {
        Raven.captureException(e);
        ctx.status = 500;
      }
    }
  }

  async getUser (ctx, next) {
    if ('GET' != ctx.method) return await next();
    try {
      let user = await this.Users.findOne({ _id: ctx.params.id });
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
      ctx.status = 200;
      ctx.body = user;
    } catch (e) {
      Raven.captureException(e);
      cts.status = 500;
    }
  }

  async me (ctx, next) {
    if ('GET' != ctx.method) return await next();
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
      const user = await this.Users.update({ _id: ctx.user._id }, update);
      if (user.nMatched === 0) return (ctx.status = 404);
      ctx.status = 204;
    } catch (e) {
      Raven.captureException(e);
      ctx.status = 500;
    }
  }
}

module.exports = UsersController;
