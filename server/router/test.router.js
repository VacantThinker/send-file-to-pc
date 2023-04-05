function wrapper(passdata) {
  const testRouter = require('express').Router();

  testRouter.get('/', async (req,res)=>{
    res.status(200).send('ok')
  })

  return testRouter;
}

module.exports = wrapper;