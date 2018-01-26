'use strict';
const monk = require('monk');
const db = monk('localhost/wallto_db');
const filterProps = require('../services/utils').filterProps;

const Events = db.get('events');

module.exports.createEvent = async (ctx, next) => {
  if ('POST' != ctx.method) return await next();
}

module.exports.editEvent = async (ctx, next) => {
  if ('PUT' != ctx.method) return await next();
}

module.exports.deleteEvent = async (ctx, next) => {
  if ('DELETE' != ctx.method) return await next();
}

module.exports.getEvent = async (ctx, next) => {
  if ('GET' != ctx.method) return await next();
}

module.exports.joinEvent = async (ctx, next) => {
  if ('POST' != ctx.method) return await next();
}

module.exports.leaveEvent = async (ctx, next) => {
  if ('POST' != ctx.method) return await next();
}

module.exports.getEvents = async (ctx, next) => {
  if ('GET' != ctx.method) return await next();
}