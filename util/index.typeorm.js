const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  getPathByLevelUp,
  handleTextArr,
  readPackageJson,
} = require('./index.common');
const stringList = {
  // 'server'
  string_server: 'server',
  // 'server'
  string_db: 'db',
  // 'server'
  string_entity: 'entity',
  // 'db.sqlite'
  string_db_sqlite3: 'db.sqlite',

  // 'util.typeorm.js'
  filename_util_typeorm: 'util.typeorm.js',
  // 'util.datasource.js'
  filename_util_datasource: 'util.datasource.js',
  // 'datasource.js'
  filename_datasource: 'datasource.js',
};

/**
 * default: xxx-project/server/db/entity/
 * @returns {string}
 */
function findPathTarget() {
  const pathRoot = process.cwd();

  const pathTarget = path.join(pathRoot,
      stringList.string_server,
      stringList.string_db,
      stringList.string_entity);

  return pathTarget;
}

/**
 * gene util.typeorm.js file
 * @param pathTarget
 */
function geneUtilTypeormJs(pathTarget = null) {
  if (pathTarget === null) {
    pathTarget = findPathTarget();
  }

  const reduce = handleTextArr(pathTarget, (filename) => {
    const reg = /.+(?=\.entity\.js)/;
    const mat = filename.match(reg);
    const entityName = mat[0]; // eg: config --> config.entity.js

    const line =
        `
  // ${entityName}.entity.js
  // **************************************************************************
  /**
   * ${entityName} repo
   * @returns {Promise<*>}
   */
  ${entityName}Repo: async () => {
    return await dataSource.getRepository('${entityName}');
  },
  /**
   * save ${entityName}
   * @param entityObj
   * @returns {Promise<void>}
   */
  ${entityName}Save: async (entityObj) => {
    return await dataSource.getRepository('${entityName}').save(entityObj);
  },
  /**
   * delete ${entityName}
   * @param options
   * @returns {Promise<*>}
   */
  ${entityName}Delete: async (options) => {
    return await dataSource.getRepository('${entityName}').delete(options);
  },
  /**
   * update ${entityName}
   * @param entityNew
   * @param options
   * @returns {Promise<void>}
   */
  ${entityName}Update: async (entityNew, options) => {
    const findObj = await dataSource.getRepository('${entityName}').findOneBy(options);
    await dataSource.getRepository('${entityName}').merge(findObj, entityNew);
    return await dataSource.getRepository('${entityName}').save(findObj)
  },
  /**
   * {id: 1}
   * @param options
   * @returns {Promise<*>} findObj
   */
  ${entityName}FindOneWhere: async (options) => {
    return await dataSource.getRepository('${entityName}').findOneBy(options);
  },
  /**
   * {select: {name: 'mari'}, where: {id: 1}}
   * @param options
   * @returns {Promise<*>} findObj
   */
  ${entityName}FindOne: async (options) => {
    return await dataSource.getRepository('${entityName}').findOne(options);
  },
  /**
   * null or {select: {name: 'mari'}, where: {id: 1}}
   * @param options
   * @returns {Promise<*>}
   */
  ${entityName}Find: async (options) => {
    if (options === null) {
      return await dataSource.getRepository('${entityName}').find();
    }else {
      return await dataSource.getRepository('${entityName}').find(options);
    }
  },
  /**
   * {id: 1}
   * @param options
   * @returns {Promise<*>}
   */
  ${entityName}FindWhere: async (options) => {
    return await dataSource.getRepository('${entityName}').findBy(options);
  },
  /**
   * {name: 'mari'} to {name: Like('%mari%')}
   * @param options
   * @returns {Promise<*>}
   */
  ${entityName}FindWhereLike: async (options) => {
    const searchKey = Object.keys(options)[0];
    const searchVal = Object.values(options)[0];
    options[searchKey] = Like(\`%\${searchVal}%\`);
    return await dataSource.getRepository('${entityName}').findBy(options);
  },
  
`;

    return line;
  });

  const text =
      `'use strict';
      
const {dataSource} = require('./datasource.js');
const {Like} = require('typeorm');

const table = {
  ${reduce}
}

module.exports = {
  table: table
}
`;

  const file = getPathByLevelUp(pathTarget, stringList.filename_util_typeorm);
  fs.writeFileSync(file, text);
  console.log(`file=\n`, file, `\n`);
  console.log(`text=\n`, text, `\n`);
}

/**
 *
 * @returns
 */
function getAppPathDbSqlite3() {

  const platform = os.platform();
  console.log(`platform=\n`, platform, `\n`);
  if (platform.includes('win32')) {
    const homedir = os.homedir();
    const {productName: dirName} = readPackageJson();
    const pathUserData = path.join(homedir,
        'AppData', 'Roaming', dirName, 'dbsqlite3');

    if (fs.existsSync(pathUserData) === false) {
      fs.mkdirSync(pathUserData);
    }

    const dbSqlite3 = path.join(pathUserData,
        stringList.string_db_sqlite3);
    console.log(`dbSqlite3=\n`, dbSqlite3, `\n`);

    return dbSqlite3.replace(/\\/g, '\\\\');
  } else {
    return null;
  }
}

/**
 * generator datasource.js file
 * @param pathTarget
 */
function geneDataSourceJs(
    pathTarget = null,
) {
  const dbSqlite3 = getAppPathDbSqlite3();
  console.log(`dbSqlite3=\n`, dbSqlite3, `\n`);

  const text =
      `'use strict';
      
const {DataSource} = require('typeorm');
const {getEntitySchemaList} = require('./util.datasource.js');

const entities = getEntitySchemaList();
const dataSource = new DataSource({
  type: 'better-sqlite3',
  database: '${dbSqlite3}',
  synchronize: true,
  logging: false,
  entities,
});

dataSource.initialize().then(() => {
  console.log('datasource init');
}).catch((err) => {
  console.log('datasource err');
  console.log(err);
});

module.exports = {
  dataSource: dataSource,
  dbInitValue: (callback) => {
    dataSource.initialize().then(async (connection) => {
      callback(connection)
    })
  }
};
`;

  if (pathTarget === null) {
    pathTarget = findPathTarget();
  }
  pathTarget = getPathByLevelUp(pathTarget);
  const file = path.join(pathTarget, stringList.filename_datasource);
  fs.writeFileSync(file, text);
  console.log(`file=\n`, file, `\n`);
  console.log(`text=\n`, text, `\n`);
}

/**
 * generator util.datasource.js file
 * @param pathTarget
 */
function geneUtilDataSourceJs(
    pathTarget = null,
) {
  if (pathTarget === null) {
    pathTarget = findPathTarget();
  }

  const dirName = stringList.string_entity;
  const reduce = handleTextArr(pathTarget, (filename) => {
    const reg = /.+(?=\.entity\.js)/;
    const mat = filename.match(reg);
    const entityName = mat[0]; // eg: config

    const line =
        `  const ${entityName}Obj = require('./${dirName}/${entityName}.entity.js');
  const ${entityName}EntitySchema = new EntitySchema(Object.create(${entityName}Obj));
  entities.push(${entityName}EntitySchema);
  
`;

    return line;
  });

  const text =
      `'use strict';
      
const {EntitySchema} = require('typeorm');

function getEntitySchemaList() {
  const entities = [];
${reduce}
  return entities;
}

module.exports = {
  getEntitySchemaList: getEntitySchemaList,
};
`;

  const file = getPathByLevelUp(pathTarget,
      stringList.filename_util_datasource);
  fs.writeFileSync(file, text);
  console.log(`file=\n`, file, `\n`);
  console.log(`text=\n`, text, `\n`);
}

/**
 * please make sure
 *
 * you have entity/ dir
 *
 * eg: entity/config.entity.js
 *
 * @param pathDir entity dir path
 */
function geneTypeormAll(pathDir) {
  geneDataSourceJs(pathDir);
  geneUtilDataSourceJs(pathDir);
  geneUtilTypeormJs(pathDir);
}

module.exports = {
  geneTypeormAll: geneTypeormAll,
  geneDataSourceJs: geneDataSourceJs,
  geneUtilDataSourceJs: geneUtilDataSourceJs,

  geneUtilTypeormJs: geneUtilTypeormJs,
};