var _ = require('lodash');
var bodyParser = require('body-parser');
var cors = require('cors');
var express = require('express');
var fs = require('fs-extra');
var path = require('path');
const TailFile = require('@logdna/tail-file')
const config = require('./config.json');
const quotes = require('./quotes.json');

var app = express();

// Start socket.io server (listens to http://localhost:PORT)
const server = require('http').createServer(app);
const io = require('socket.io')(server);
server.on("connection", (socket) => {
  console.info(`Client connected [id=${socket.id}]`);
});
server.listen(config.socketIoPort);

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(cors());

app.use(function (error, req, res, next) {
  if (error.status === 400) {
    logger.info(error.body);
    return res.send(400);
  }
  logger.error(error);
  process.exit();
});

// Check a file with TailFile and write in socket.io the new data
const tail = new TailFile(config.fileToMonitor, {encoding: 'utf8'})
  .on('data', (chunk) => {
    console.log(`Chunk of data received: ${chunk}`);
    io.emit('new-data', chunk)
  })
  .on('error', (err) => {
    console.error('A TailFile stream error was likely encountered', err)
  })
  .on('tail_error', (err) => {
    console.error('TailFile had an error!', err)
  })
  .start()
  .catch((err) => {
    console.error('Cannot start.  Does the file exist?', err)
  })

// Start the server
app.listen(config.expressPort, function () {
  console.log(`Sample Node Plugin Service listening on port ${config.expressPort}`);
});

// Route: update the configuration file
app.post('/api/updateSettings', function (req, res) {
    if (req.body) {
      fs.writeJson(path.join(__dirname, 'config.json'), req.body, {
          spaces: '\t'
        })
        .then(function () {
          res.sendStatus(200);
        })
        .catch(function (err) {
          var errorMessage = 'Unable to update the configuration';
          logger.error(errorMessage)
          return res.status(500).send({
            message: errorMessage
          })
        })
    }
  });

app.get('/api/test', function (req, res) {
  const idx = Math.floor(Math.random() * quotes.quotes.length);
  res.status(200).json(quotes.quotes[idx]);
});