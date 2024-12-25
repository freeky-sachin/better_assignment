// const express = require('express');
// const app = express();
// const port = 3000;

// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Testing the workflow!');
});

// Don't start the server here, only export the app
module.exports = app;
