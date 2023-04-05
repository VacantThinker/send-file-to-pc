'use strict';

/**
 *
 * @param href
 * @returns {string}
 */
function getWSUrl(href) {
  let regIP = /(?<=\/\/).+(?=\:)/;
  let matIP = href.match(regIP);
  let ip = matIP[0];

  let regPORT = /(?<=\:)\d{1,10}/;
  let matPORT = href.match(regPORT);
  let port = matPORT[0];

  return `ws://${ip}:${port}`;
}

// ********************************************

const href = window.location.href;
const url = ``;
const wsurl = getWSUrl(href);

const inputFileElement = document.querySelector('#inputFile');
const btnUploadElement = document.querySelector('#btnUpload');
const progressElement = document.querySelector('#progress');

function setupQrcode() {
  // https://zxing.org/w/chart?cht=qr&chs=350x350&chld=L&choe=UTF-8&chl=http://192.168.43.25:9394/
  let qrcodeurl = `https://zxing.org/w/chart?cht=qr&chs=350x350&chld=L&choe=UTF-8&chl=${href}`;
  let imgElement = document.querySelector('#qrcode');
  imgElement.setAttribute('src', qrcodeurl);
}

function uploadFile() {
  if (inputFileElement.files.length > 0) {
    // prepare
    const file = inputFileElement.files[0];
    const filename = file.name;
    const formData = new FormData();
    formData.append('file', file, filename);

    const input = `${url}upload/file/`;
    const init = {
      method: 'POST',
      body: formData,
    };
    fetch(input, init).then(value => value.json()).then(value => {
      resetInfo();
    });
  }
}

function resetInfo() {
  inputFileElement.value = '';
  progressElement.textContent = '0';
  progressElement.style.width = `0%`;

}

function startFN() {
  btnUploadElement.textContent = '上传/Upload';

  setupQrcode();
  btnUploadElement.addEventListener('click', () => {
    uploadFile(inputFileElement);
  });

  resetInfo();

  let socketGlobal = new WebSocket(wsurl);
  socketGlobal.addEventListener('open', async () => {
  });
  socketGlobal.addEventListener('close', () => {
  });
  socketGlobal.addEventListener('error', () => {
  });
  socketGlobal.addEventListener('message',
      async (messageEvent) => {
        let message = JSON.parse(messageEvent.data);
        switch (message.action) {
          case 'updateProgress':
            let {info} = message;
            progressElement.textContent = info;
            progressElement.style.width = info;
            break;
          case 'uploadComplete':
            resetInfo();
            break;
        }
      });

}

startFN();
