'use strict';

const config = require('../config.js');
const monk = require('monk');
const db = monk(process.env.MONGOLAB_URI);

const Events = db.get('events');
const Users = db.get('users');

// This module expects an object with all the data for creating a new event
module.exports.createEvent = async (ctx, next) => {
  if ('POST' != ctx.method) return await next();
  console.log(typeof ctx.user._id);
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
    Events.createIndex( { location : "2dsphere" } );
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
    Events.createIndex( { location : "2dsphere" } );
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
      Events.createIndex( { location : "2dsphere" } );
    } catch(e) { console.log('Deleting event error: ', e);}
  }
};

// GET event informations
module.exports.getEvent = async (ctx, next) => {
	if ('GET' != ctx.method) return await next();
  const event = await Events.findOne({ _id: ctx.params.id });
  const attendees_ids = event.attendees;
  console.log('attendees_ids', attendees_ids);
  event.attendees = await Users.find({ _id: { $in: attendees_ids }}, { _id: 1, name: 1, profile_picture: 1 });
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
  try {
    await Events.update({ _id: ctx.params.id, 'attendees.3': { $exists: false } },
      { $addToSet: { attendees: ctx.user._id }}
    );
    ctx.status = 204;
    console.log( await Events.findOne({_id: ctx.params.id}));
  } catch (e) { console.error('Update user error', e); }
};

module.exports.leaveEvent = async (ctx, next) => {
  if ('DELETE' != ctx.method) return await next();
  let event = await Events.findOne({
    _id: ctx.params.id,
    attendees: ctx.user._id,
    'attendees.1': { $exists: true }
  });
  // console.log('event', event);
  if ( JSON.stringify(event.creator) === JSON.stringify(ctx.user._id) ) {
    event.creator = event.attendees[1];
    console.log('event.attendees[1]', event.attendees[1]);
  }
  try {
    let update = await Events.update(
      { _id: ctx.params.id },
      {
        $pull:
          { attendees: ctx.user._id },
        $set:
          { 'creator': event.creator }
      }
    );
    event = await Events.findOne({ _id: ctx.params.id });
    // console.log('updated event', event);
    ctx.body = JSON.stringify({'event': event});
    ctx.status = 200;
  } catch (e) { console.log('Leave event error: ', e); }
};

module.exports.getEvents = async (ctx, next) => {
  if ('GET' != ctx.method) return await next();
  let lat = Number(ctx.request.query.lat);
  let lng = Number(ctx.request.query.lng);
  let distance = Number(ctx.request.query.dist) ? Number(ctx.request.query.dist) : 1000;
  let limit = Number(ctx.request.query.limit) ? Number(ctx.request.query.limit) : 100;
  let from = Number(ctx.request.query.from) ? Number(ctx.request.query.from) : Date.now();
  let to = Number(ctx.request.query.to) ? Number(ctx.request.query.to) : Date.now() + 3600*24*7;
  console.log(ctx.request.query);
  const events = await Events.aggregate([{
    $geoNear: {
        near: { type: "Point", coordinates: [ lat, lng ] },
        distanceField: "dist.calculated",
        maxDistance: distance,
        query: { when: { $gte: from , $lte: to } },
        limit: limit,
        spherical: true
    }
  }]);
  console.log('events', events);
  ctx.status = 200;
  ctx.body = JSON.stringify(events);

  // await Events.geoHaystackSearch(
  //   Number(ctx.request.headers.latitude),
  //   Number(ctx.request.headers.longitude),
  //   { search : { when: { $gte: Number(ctx.request.headers.from) , $lte: Number(ctx.request.headers.to) } },
  //   limit: 100,
  //   maxDistance: maxDistance } //, $lte: ctx.request.headers.to
  // ).then(result => console.log(result));

  //   {
  //   geoSearch: "events",
  //   near: [Number(ctx.request.headers.latitude), Number(ctx.request.headers.longitude)],
  //   maxDistance: Number(ctx.request.headers.maxDistance),
  //   search : { when: { $gte: Number(ctx.request.headers.from) , $lte: Number(ctx.request.headers.to) }},
  //   limit: 100
  // });

  // const events = await Events.find({
  //   location: {
  //     $near : {
  //       $geometry: { type: "Point", coordinates: [ latitude, longitude ] },
  //       $maxDistance: maxDistance,
  //     }
  //   },
  //   when: { $gte: Number(ctx.request.headers.from) , $lte: Number(ctx.request.headers.to) },
  // });
};