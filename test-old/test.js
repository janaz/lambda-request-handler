const app = require('../example/koa').callback()

const hugeBody = require('../integration/huge.json')

const {createRequest, createResponse} = require('../src/httpMock');

const req2 = createRequest({
  body: JSON.stringify(hugeBody),
  method: 'GET',
  path: '/file.txt',
  path2: '/inspect',
  path3: '/',
  headers: {
    'host': 'a.com',
    'cookie': 'a=10;b=20;',
    'content-type': 'application/json'
  },
})
const res2 = createResponse(req2);
res2.on('finish', r => console.log(r));
app(req2, res2);
