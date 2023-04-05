const express = require('express');
const {WebSocketServer} = require('ws');
const http = require('http');

const cors = require('cors');
const bodyParser = require('body-parser');
const {v4: uuidv4} = require('uuid');

const fs = require('fs');
let path = require('path');
const {getIPAddress} = require('./util.express');

const app = express();
// app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('publicapp'));
app.use(express.static(path.join(process.cwd(), 'publicapp')));

const socketMap = {};
// const urlList = 'localhost';
let hostname = getIPAddress();
const port = 9394;
const url = `http://${hostname}:${port}/`;


//------------------------------------------------------------------------------
const passdata = {
  socketMap: socketMap,
};

// step1: init a simple http server
const server = http.createServer(app);
// step2: init a websocketserver
const webSocketServer = new WebSocketServer({server});
webSocketServer.on('connection', (connect) => {
  const uuid = uuidv4();
  socketMap[uuid] = connect;
  let message = {
    'action': 'socketinit',
    'uuid': uuid,
  };
  // connect.send(JSON.stringify(message)); // init uuid
  console.log('new connect', uuid);
  connect.on('message', (data) => { // heart_firefox
    let message = JSON.parse(String(data));
    console.log(`message=\n`, message, `\n`);
  });
});

require('./util.express').setupRouterList(app, passdata);
server.listen(port, hostname, async () => {
  console.log(url, `started ${hostname} ${port} --- with websocket`);
});

module.exports = {
  url: url,
};