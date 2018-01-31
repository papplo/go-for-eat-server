'use strict';

const EventsController = require('../controllers/eventsController');

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
  user: '',
  request: {
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

const next = () => {};
const createdEvent = {};
const eventController = new EventsController({
  insert: mockMongoDb(() => createdEvent),
  update: mockMongoDb(() => createdEvent),
  remove: mockMongoDb(() => createdEvent),
  findOne: mockMongoDb(() => createdEvent)
})

describe('Test response on events functions', () => {
  
  test('Return 201 on create event', async () => {
    ctx.method = 'POST';
    await eventController.createEvent(ctx, next);
    expect(ctx.body).toEqual(JSON.stringify({
      'event': createdEvent
    }))
    expect(ctx.status).toEqual(201);
  });

  test('Return 204 on edit an event', async () => {
    ctx.method = 'PUT';
    await eventController.editEvent(ctx, next);
    expect(ctx.status).toEqual(204);
  });

  test('Return 204 on deleting an event', async () => {
    ctx.method = 'DELETE';
    await eventController.deleteEvent(ctx, next);
    expect(ctx.status).toEqual(204);
  });  

})