const fs = require('fs');
const path = require('path');
const {getPathByLevelUp, handleTextArr} = require('./index.common');
const stringList = {
  // 'router'
  string_router: 'router',
  // 'server'
  string_server: 'server',
  // 'util.express.js'
  filename_util_express: 'util.express.js',
};

/**
 * if pathRouter === null,
 *
 * return path.join(process.cwd(), 'server', 'router')
 *
 * @returns {string}
 */
function findPathTarget() {
  const pathRoot = process.cwd();

  const pathTarget = path.join(pathRoot,
      stringList.string_server, stringList.string_router);
  console.log(`pathTarget=\n`, pathTarget, `\n`);
  return pathTarget;
}

/**
 *
 * please make sure, you have router/ dir
 *
 * eg: router/notice.router.js
 *
 * generator file 'util.express.js'
 *
 * @param pathTarget if null, findPathTarget()
 */
function geneUtilExpressJs(
    pathTarget = null,
) {
  if (pathTarget === null) {
    pathTarget = findPathTarget();
  }

  const dirName = stringList.string_router;
  const reduce = handleTextArr(pathTarget, (filename) => {
    const reg = /.+(?=\.router\.js)/;
    const mat = filename.match(reg);
    const routerName = mat[0];

    const line = `const ${routerName}Router = require('./${dirName}/${routerName}.router.js');
  app.use('/${routerName}', ${routerName}Router(passdata));

  `;
    return line;
  });

  const text =
      `'use strict';

function setupRouterList(app, passdata) {
  ${reduce}
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

`;

  const file = getPathByLevelUp(pathTarget, stringList.filename_util_express);
  fs.writeFileSync(file, text);
  console.log(`file=\n`, file, `\n`);
  console.log(`text=\n`, text, `\n`);
}

module.exports = {
  geneUtilExpressJs: geneUtilExpressJs,
};