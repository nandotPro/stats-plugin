const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config.json');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// No backend proxy logic is required because the Angular app
// calls XCally RPC APIs directly on the same origin.

app.listen(config.expressPort, function () {
  console.log(`Agent Presence plugin (no-op backend) listening on port ${config.expressPort}`);
});