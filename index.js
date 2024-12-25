const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Don't start the server here, only export the app
module.exports = app;
