const express = require('express');
const http = require('http');
const url = require('url');
const { fetchTitles } = require('./titleFetcher');
const { generateHtmlResponse } = require('./htmlResponse');

const app = express();

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;

  if (pathname.startsWith('/I/want/title') && query.address) {
    const addresses = Array.isArray(query.address) ? query.address : [query.address];

    fetchTitles(addresses)
      .then(titles => {
        const htmlResponse = generateHtmlResponse(addresses, titles);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlResponse);
      })
      .catch(error => {
        console.error('Error:', error); // Log any errors
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});


app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




 