function noticeAll(message, passdata) {
  let conns = Object.values(passdata.socketMap);
  conns.forEach((conn) => {
    conn?.send(JSON.stringify(message));
  });
}

function n_message(message, passdata) {

  noticeAll(message, passdata);
}

const daoNotice = {
  n_message: n_message,
};
module.exports = {
  daoNotice: daoNotice,
};