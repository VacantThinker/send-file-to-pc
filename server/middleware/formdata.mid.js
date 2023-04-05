function getBufferFile(req, buffer) {
  let contentType = req.headers['content-type'];
  let regType = /(?<=boundary\=).+/;
  let matType = contentType.match(regType);
  let splitStr = `--${matType[0]}`;
  let endStr = `${splitStr}--`;

  let bufferStart = Buffer.from('\n\r\n');
  let start = buffer.indexOf(bufferStart) + bufferStart.length;
  let bufferEnd = Buffer.from(endStr);
  let end = buffer.lastIndexOf(bufferEnd);

  let bufferResult = Buffer.alloc(
    end - start,
  );
  buffer.copy(bufferResult, 0, start, end);
  return bufferResult;
}

function getFilename(req, buffer) {
  let bufferStart = Buffer.from('\n\r\n');
  let start = buffer.indexOf(bufferStart);

  let bufferResult = Buffer.alloc(start);
  buffer.copy(bufferResult, 0, 0, start);
  let partParam = String(bufferResult);

  let reg_name = /(?<=name=").+(?=";)/;
  let mat_name = partParam.match(reg_name);
  let name = mat_name[0];

  let reg_filename = /(?<=filename=").+(?=")/;
  let mat_filename = partParam.match(reg_filename);
  let filename = mat_filename[0];

  return {name, filename};
}

/**
 *
 * @param req {Request}
 * @param res {Response}
 * @param next {NextFunction}
 */
function handleFormData(req, res, next) {

  let {
    noticePrecent, noticeConvert, noticeComplate
  } = req['notice']
  const contentLength = req.headers['content-length'];

  let bufferobj = {};
  let cnt = 0;
  let offset = 0;
  // Uint8Array
  req.on('data', (chunk) => {
    bufferobj[cnt] = chunk;
    cnt += 1;

    offset = offset + chunk.length;
    let precent = (((offset * 1.0) / contentLength) * 100);
    noticePrecent(precent)
  });
  req.on('close', () => {
    console.log('close');

    noticeConvert()

    let buffer = Buffer.concat(Object.values(bufferobj));
    let {filename, name} = getFilename(req, buffer);
    let bufferFile = getBufferFile(req, buffer);

    noticeComplate()

    req['formdata'] = {
      name: name,
      filename: filename,
      bufferFile: bufferFile
    }

    next();
  });

}

module.exports = handleFormData;