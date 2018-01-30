'use strict';

const monk = require('monk');
const db = monk(process.env.MONGOLAB_URI);

const Events = db.get('events');
const Users = db.get('users');


Events.createIndex( { location : "2dsphere" } );



