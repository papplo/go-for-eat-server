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

describe('Test correct response on events functions', () => {
  
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

/* const eventControllerWrongMethod = new EventsController(mockEventsMongoInstance, mockMongoDb);


describe('Test correct error response on events functions called on with wrong method', () => {

  test('Call next on wrong ctx.method on createEvent', async () => {
    ctx.method = 'DELETE';
    await eventControllerWrongMethod.createEvent(ctx, next);
    expect(mockMongoDb).toHaveBeenCalled();
  });
 */
 /*  test('Return 400 on editEvent not PUT method', async () => {
    ctx.method = 'GET';
    await eventController.editEvent(ctx, next);
    expect(ctx.status).toEqual(404);
  });

  test('Return 400 on deleteEvent not DELETE method', async () => {
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
*/