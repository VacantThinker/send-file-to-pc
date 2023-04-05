'use strict';

// ********************************************

const url = window.urlList.url;
const wsurl = window.urlList.wsurl;

const inputFileElement = document.querySelector('#inputFile');
const btnUploadElement = document.querySelector('#btnUpload');
const progressElement = document.querySelector('#progress');

function setupQrcode() {
  // https://zxing.org/w/chart?cht=qr&chs=350x350&chld=L&choe=UTF-8&chl=http://192.168.43.25:9394/
  let qrcodeurl = `https://zxing.org/w/chart?cht=qr&chs=350x350&chld=L&choe=UTF-8&chl=${url}`;
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
    fetch(input, init).then(value => value.json()).then((value) => {
      resetInfo();
    });
  }
}

function resetInfo() {
  inputFileElement.value = '';
  progressElement.textContent = '0';
  progressElement.style.width = `0%`;
  btnUploadElement.textContent = '上传/Upload';
}

function updateProgress(message) {
  let {info} = message;
  progressElement.textContent = info;
  progressElement.style.width = info;
  btnUploadElement.textContent = info;
}

function startFN() {
  resetInfo();

  setupQrcode();
  btnUploadElement.addEventListener('click', () => {
    uploadFile(inputFileElement);
  });


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
            updateProgress(message);
            break;
          case 'uploadComplete':
            resetInfo();
            break;
          case 'fileConvert':
            btnUploadElement.textContent = `file converting`
            break
        }
      });

}

startFN();
