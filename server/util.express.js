'use strict';

function setupRouterList(app, passdata) {
  const testRouter = require('./router/test.router.js');
  app.use('/test', testRouter(passdata));

  const uploadRouter = require('./router/upload.router.js');
  app.use('/upload', uploadRouter(passdata));

  
}

function getIPAddress() {
  let interfaces = require('os').networkInterfaces();
  for (let devName in interfaces) {
    let iface = interfaces[devName];

    for (let i = 0; i < iface.length; i++) {
      let alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        return alias.address;
    }
  }
  return '0.0.0.0';
}

module.exports = {
  setupRouterList: setupRouterList,
  getIPAddress: getIPAddress
};

