// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

window.urlList = getHostname();

function getHostname() {
  let ipAddress = getIPAddress();
  const port = 9394;
  const url = `http://${ipAddress}:${port}/`;
  const wsurl = `ws://${ipAddress}:${port}/`;
  return {
    url,
    wsurl
  };
}

function getIPAddress() {
  let interfaces = require('os').networkInterfaces();
  for (let devName in interfaces) {
    let iface = interfaces[devName];

    for (let i = 0; i < iface.length; i++) {
      let alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' &&
          !alias.internal)
        return alias.address;
    }
  }
  return '0.0.0.0';
}
