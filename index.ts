import * as http from 'http';
import {IncomingMessage, ServerResponse} from 'http';
import * as fs from 'fs';
import * as p from 'path';
import * as url from 'url';

const server = http.createServer();
const publicPath = p.resolve(__dirname, 'public');
let cacheAge = 3600 * 24 * 365

server.on('request', (request: IncomingMessage, response: ServerResponse) => {

  const {method, url: path, headers} = request;
  const {pathname, search} = url.parse(path);

  if (method !== 'GET') {
    response.statusCode = 405;
    response.end('can not resolve POST request');
    return;
  }

  let filename = pathname.substr(1);

  if (filename === '') {
    filename = 'index.html';
  }

  fs.readFile(p.resolve(publicPath, filename), (error, data) => {

    if (error) {
      if (error.errno === -4058) {
        fs.readFile(p.resolve(publicPath, '404.html'), (error, data) => {
          response.end(data);
        });
      } else if (error.errno === -4068) {
        response.statusCode = 403;
        response.end('unauthorized request');
      } else {
        response.statusCode = 500;
        response.end('server error');
      }
    } else {
      response.setHeader('Cache-Control', `public, max-age=${cacheAge}`);
      response.end(data);
    }
  });

});

server.listen(8888);