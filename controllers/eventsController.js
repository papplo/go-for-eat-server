'use strict';

const config = require('../config.js');
const monk = require('monk');
const db = monk(process.env.MONGOLAB_URI);

const Events = db.get('events');
const Users = db.get('users');


// This module expects an object with all the data for creating a new event
module.exports.createEvent = async (ctx, next) => {
	if ('POST' != ctx.method) return await next();
	const newEvent = {
		place_id: ctx.request.body.place_id,
		place_name: ctx.request.body.place_name,
		place_address: ctx.request.body.place_address,
		location: ctx.request.body.location,
		when: ctx.request.body.when,
		creator: ctx.user._id,
		attendees: [ctx.user._id],
	};
	try {
    const event = await Events.insert(newEvent);
		ctx.status = 200;
    ctx.body = JSON.stringify({'event': event});
	} catch (e) { console.log('Event create error: ', e);}
	ctx.status = 400;
};

// Edit event module:
// take the complete event params from request body
module.exports.editEvent = async (ctx, next) => {
  if ('PUT' != ctx.method) return await next();
  console.log(ctx.request.body);
  try {
    await Events.update({ _id: ctx.params.id }, { $set: {
      place_id: ctx.request.body.place_id,
      place_name: ctx.request.body.place_name,
      place_address: ctx.request.body.place_address,
      location: ctx.request.body.location,
      when: ctx.request.body.when,
    }});
    ctx.status = 204;
  } catch (e) { console.log('Modify create error: ', e); }
};

// Delete event
// uses the ID parsed from the uri
// notify the others users of cancel
module.exports.deleteEvent = async (ctx, next) => {
  if ('DELETE' != ctx.method) return await next();
  const event = await Events.findOne({ _id: ctx.params.id, creator: ctx.user._id });
  if (event && event.attendees.lenght === 1) {
    try {
      await Events.remove({ _id: ctx.params.id});
      ctx.status = 204;
    } catch(e) { console.log('Deleting event error: ', e);}
  }
};

// GET event informations

// TODO is it Event.get ?
module.exports.getEvent = async (ctx, next) => {
	if ('GET' != ctx.method) return await next();
  const event = await Events.findOne({ _id: ctx.params.id });
  const attendees_ids = event.attendees;
  event.attendees = await Users.find({ _id: { $in: attendees_ids }}, { $project: { id: 1, name: 1, profile_picture: 1 }});
	if (event) {
		ctx.status = 200;
		ctx.body = event;
	} else {
		ctx.status = 404;
		ctx.body = 'The event does not exist';
	}
};

module.exports.joinEvent = async (ctx, next) => {
if ('PUT' != ctx.method) return await next();
  const event = await Events.findOne({_id: ctx.params.id});
  console.log('attendees', event.attendees);
  if ( event.attendees.length < 4 ) {
    // console.log('number attendees', event.attendees.length);
    try {
      // console.log('number attendees', ctx.user._id);
      await Events.update({ _id: ctx.params.id }, { $push: { attendees: ctx.user._id }});
      // console.log('update user');
      ctx.response = 204;
    } catch (e) { console.error('Update user error', e); }
  } else {
    ctx.status = 400;
		ctx.body = 'The event is full';
  }
};

module.exports.leaveEvent = async (ctx, next) => {
  if ('GET' != ctx.method) return await next();
  let event = await Events.find({ _id: ctx.params.id, attendees: { $size: { $gt: 1 } } });
  console.log('event', event);
  let index = event.attendees.indexOf(ctx.user._id);
  event.attendees.splice(index, 1);
  if (event.attendees.length == 1) event.creator = event.attendees[0];
  try {
    await Events.updateOne({ _id: ctx.request.body._id }), { $set: {
      'attendees': event.attendees,
      'creator': event.creator
    }};
    let event = await Events.findOne({ _id: ctx.params.id });
    ctx.body = JSON.stringify({'event': event});
    ctx.status = 200;
  } catch (e) { console.log('Leave event error: ', e); }
};

module.exports.getEvents = async (ctx, next) => {
  if ('GET' != ctx.method) return await next();
  const events = await Events.find();
  ctx.status = 200;
  ctx.body = JSON.stringify(events);
};