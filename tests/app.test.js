// const request = require('supertest');
// const app = require('../index'); // This will be the Express app

// describe('GET /', () => {
//   it('should return Hello World!', async () => {
//     const response = await request(app).get('/');
//     expect(response.text).toBe('Hello World!');
//   });
// });
const request = require('supertest');
const app = require('../index'); // Import app from index.js (not starting the server)

describe('GET /', () => {
  it('should return Hello World!', async () => {
    const response = await request(app).get('/'); // Supertest can now make requests
    expect(response.text).toBe('Hello World!');
  });
});

