'use strict';

const monk = require('monk');
const db = monk(process.env.MONGOLAB_URI);

global.Events = db.get('events');
global.Users = db.get('users');


Events.createIndex( { location : "2dsphere" } );

