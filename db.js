'use strict';

const monk = require('monk');
const db = monk(process.env.MONGOLAB_URI);

const Events = db.get('events');

Events.createIndex( { location : "2dsphere" } );

