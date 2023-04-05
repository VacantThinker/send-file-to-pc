const path = require('path');
const fs = require('fs');

/**
 * read env file , eg: auth.env xxx.env
 *
 * @param filename path env file
 * @returns {{}}
 */
function readEnvFile(filename) {
  let pathFile = path.join(filename);
  const buffer = fs.readFileSync(pathFile);
  const textContent = buffer.toString();

  const split = textContent.split('\n');

  const reduce = split.filter((value) => {
    return value.trim().length > 0;
  }).reduce((map, value) => {
    const regexpKey = /.+(?=\=)/;
    const envKey = value.match(regexpKey)[0];
    const regexpVal = /(?<=\=).+/;
    const envVal = value.match(regexpVal)[0].replace(/\"/g, '');

    map[envKey] = envVal;
    return map;
  }, {});

  return reduce;
}

/**
 *
 * @param pathTarget
 * @returns {any}
 */
function readPackageJson(pathTarget = 'package.json') {
  const path_package_json = path.join(process.cwd(), pathTarget);
  if (fs.existsSync(path_package_json) === false) {
    return;
  }
  const buffer = fs.readFileSync(path_package_json);
  const textContent = buffer.toString();

  const objPackageJson = JSON.parse(textContent);
  return objPackageJson;
}

/**
 * find dir/ level up
 *
 * eg: xxx-project/server/router/
 *
 * return xxx-project/server/
 *
 * @param pathTarget
 * @param filename
 * @returns
 */
function getPathByLevelUp(
    pathTarget = null,
    filename = null) {

  if (pathTarget === null) {
    return;
  }

  const basename = path.basename(pathTarget);
  const pathLevelUp = pathTarget.replace(basename, '');
  if (filename === null) {
    return pathLevelUp;
  } else {
    return path.join(pathLevelUp, filename);
  }
}

/**
 * create an array, save text
 * @param pathTarget
 * @param callbacks
 * @returns {*}
 */
function handleTextArr(pathTarget, ...callbacks) {
  const textArr = [];

  const filenameList = fs.readdirSync(pathTarget);
  callbacks.forEach((callback) => {
    filenameList.forEach((filename) => {
      const text = callback(filename);
      if (Array.isArray(text)) {
        Array.from(text).forEach((value) => {
          textArr.push(value);
        });
      } else {
        textArr.push(text);
      }
    });
  });

  const reduce = textArr.reduce((str, value) => {
    return str.concat(value);
  }, '');
  return reduce;
}

//**********************************

//*********************************

module.exports = {
  readEnvFile: readEnvFile,
  readPackageJson: readPackageJson,

  getPathByLevelUp: getPathByLevelUp,
  handleTextArr: handleTextArr,

  // *****************************

};