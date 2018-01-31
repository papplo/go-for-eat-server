'use strict';

const EventsController = require('../eventsController');

const mockMongoDb = jest.fn;

// from test ////////////////////////////////////////////

// const createdEvent = {}
// const eventController = new EventsController({
//   insert: jest.fn().returnValue(() => createdEvent)
// })

// ctx = {};
// eventController.createEvent(ctx, next);
// ctx.body.toEqual(JSON.stringify({
//   'event': createdEvent
// }))
// ctx.status.toEqual(201);

/////////////////////////////////////////////////////////

// Mock context
let ctx = {
  params: {
    id: ''
  },
  method: '',
  status: 0,
  user: {
    _id: 'blabla'
  },
  request: {
    query: {
      lat: '42',
      lng: '42'
    },
    body: {
      place_id: 'aasdf',
      place_name: 'asdf',
      place_address: 'asdf',
      location: {
        lat: 54324,
        lng: 5523
      },
      when: '3232',
      _id: '6464',
      attendees: []
    }
  }
};

// Mock context
let emptyDataCtx = {
  params: {
    id: ''
  },
  method: '',
  status: 0,
  user: '',
  request: {
    query: {
      lat: '42',
      lng: '42'
    },
    body: {
      place_id: '',
      place_name: '',
      place_address: '',
      location: '',
      when: '',
      _id: '',
      attendees: []
    }
  }
};

// Mock context wrong location fields
let wrongLocationCtx = {
  params: {
    id: ''
  },
  method: '',
  status: 0,
  user: {
    _id: 'blabla'
  },
  request: {
    query: {
      lat: '42',
      lng: '42'
    },
    body: {
      place_id: 'aasdf',
      place_name: 'asdf',
      place_address: 'asdf',
      location: '6565',
      when: '3232',
      _id: '6464',
      attendees: []
    }
  }
};


const next = () => {};
const createdEvent = {
  attendees: ['42']
};

const mockEventsMongoInstance = {
  insert: mockMongoDb(() => createdEvent),
  update: mockMongoDb(() => createdEvent),
  remove: mockMongoDb(() => createdEvent),
  findOne: mockMongoDb(() => createdEvent),
  aggregate: mockMongoDb(() => createdEvent)
}

const mockMonkInstance = {
  id: mockMongoDb(() => createdEvent)
}
const eventController = new EventsController(mockEventsMongoInstance, mockMonkInstance);

describe('Test correct response on events functions calls', () => {
  
  test('Return 201 on create event', async () => {
    ctx.method = 'POST';
    await eventController.createEvent(ctx, next);
    expect(ctx.body).toEqual(JSON.stringify({
      'event': createdEvent
    }))
    expect(ctx.status).toEqual(201);
  });
  
  test('Return 400 on createEvent with empty fields', async () => {
    emptyDataCtx.method = 'POST';
    await eventController.createEvent(emptyDataCtx, next);
    expect(emptyDataCtx.status).toEqual(400);
  });

  test('Return 400 on createEvent with wrong location entry fields', async () => {
    wrongLocationCtx.method = 'POST';
    await eventController.createEvent(wrongLocationCtx, next);
    expect(wrongLocationCtx.status).toEqual(400);
  });

  test('Return 204 on edit an event', async () => {
    ctx.method = 'PUT';
    await eventController.editEvent(ctx, next);
    expect(ctx.status).toEqual(204);
  });

  test('Return 400 on editEvent with empty fields', async () => {
    emptyDataCtx.method = 'PUT';
    await eventController.editEvent(emptyDataCtx, next);
    expect(emptyDataCtx.status).toEqual(400);
  });

  test('Return 400 on editEvent with wrong location entry fields', async () => {
    wrongLocationCtx.method = 'POST';
    await eventController.editEvent(wrongLocationCtx, next);
    expect(wrongLocationCtx.status).toEqual(400);
  });


  test('Return 204 on deleting an event', async () => {
    ctx.method = 'DELETE';
    await eventController.deleteEvent(ctx, next);
    expect(ctx.status).toEqual(204);
  });  

  test('Return 200 on getting infos of an event', async () => {
    ctx.method = 'GET';
    await eventController.getEvent(ctx, next);
    expect(ctx.status).toEqual(200);
  });

  test('Return 204 on joining an event', async () => {
    ctx.method = 'PUT';
    await eventController.joinEvent(ctx, next);
    expect(ctx.status).toEqual(204);
  });

  test('Return 200 on leaving an event', async () => {
    ctx.method = 'DELETE';
    await eventController.leaveEvent(ctx, next);
    expect(ctx.body).toEqual(JSON.stringify({
      'event': createdEvent
    }))
    expect(ctx.status).toEqual(200);
  });

  test('Return 200 on getting all events nearby list', async () => {
    ctx.method = 'GET';
    await eventController.getEvents(ctx, next);
    expect(ctx.body).toEqual(JSON.stringify(createdEvent))
    expect(ctx.status).toEqual(200);
  });

})


// Testing stuf f - when Id has no matches on the database

const WriteResult = {
  nMatched: 0
}

const nullResult = null;

const mockEmptyMongoInstance = {
  insert: mockMongoDb(() => createdEvent),
  update: mockMongoDb(() => WriteResult),
  remove: mockMongoDb(() => createdEvent),
  findOne: mockMongoDb(() => nullResult),
  aggregate: mockMongoDb(() => createdEvent)
}


const eventControllerNoMatches = new EventsController(mockEmptyMongoInstance, mockMonkInstance);


describe('Test on event not found or wrong ID', () => {

  test('editEvent returns error 400 if query has no matches', async () => {
    ctx.method = 'PUT';
    await eventControllerNoMatches.editEvent(ctx, next);
    expect(ctx.status).toEqual(400);
  });

  test('deleteEvent returns error 400 if query has no matches', async () => {
    ctx.method = 'DELETE';
    await eventControllerNoMatches.editEvent(ctx, next);
    expect(ctx.status).toEqual(400);
  });

});
 
