const {daoNotice} = require('../dao/notice.dao');
const handleFormData = require('../middleware/formdata.mid');
const uploadRouter = require('express').Router();

function wrapper(passdata) {

  function noticePrecent(precent) {
    // fs.appendFileSync(fileLog, `${precent}\n`);
    daoNotice.n_message({
        action: `updateProgress`,
        info: `${parseInt(String(precent))}%`,
      }
      , passdata);
  }

  function noticeConvert() {
    daoNotice.n_message({action: 'fileConvert'}, passdata);
  }

  function noticeComplate() {
    daoNotice.n_message({action: 'uploadComplete'}, passdata);
  }

  /**
   * post /test
   */
  uploadRouter.post('/file',
    (req, res, next) => {
      req['notice'] = {
        noticePrecent, noticeConvert, noticeComplate,
      };
      next();
    },
    handleFormData,
    (req, res) => {
      res.status(200).send({res: 'ok'});

      let {name, filename, bufferFile} = req.formdata;
      dirDesktop(filename, bufferFile)

    });

  /**
   *
   * @param filename{String}
   * @param bufferFile
   * @returns {string}
   */
  function dirDesktop(filename, bufferFile) {
    let path = require('path');
    let fs = require('fs');
    let os = require('os');
    let homedir = os.homedir();
    // C:\Users\xxxxx\AppData\Local\Temp
    let pathTmp = path.join(homedir, 'Desktop',
      'send-file-to-pc');
    if (fs.existsSync(pathTmp) === false) {
      fs.mkdirSync(pathTmp);
    }

    let pathFile = path.join(pathTmp, filename);
    fs.writeFileSync(pathFile, bufferFile);
  }

  function dirTmp(filename) {
    let path = require('path');
    let fs = require('fs');
    let os = require('os');
    let homedir = os.homedir();
    // C:\Users\xxxxx\AppData\Local\Temp
    let pathTmp = path.join(homedir, 'AppData',
      'Local', 'Temp', 'send-file-to-pc');
    if (fs.existsSync(pathTmp) === false) {
      fs.mkdirSync(pathTmp);
    }
    return path.join(pathTmp, filename);
  }

  function getCurrent() {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let milliseconds = date.getMilliseconds();

    let dateFormat = `${hours}:${minutes}:${seconds}:${milliseconds}`;

    return dateFormat;
  }

  return uploadRouter;
}

module.exports = wrapper;