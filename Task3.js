const express = require('express');
const http = require('http');
const url = require('url');
const { https } = require('follow-redirects');
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
      .catch(err => {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

function fetchTitles(addresses) {
  const requests = addresses.map(address => {
    if (!address.startsWith('http://') && !address.startsWith('https://')) {
      address = 'https://' + address;
    }
    return new Promise((resolve, reject) => {
      https.get(address, { maxRedirects: 5 }, response => {
        let data = '';

        response.on('data', chunk => {
          data += chunk;
        });

        response.on('end', () => {
          const titleMatch = data.match(/<title>([^<]*)<\/title>/i);
          let title = titleMatch ? titleMatch[1].trim() : 'NO RESPONSE';
          title = removeDuplicateInfo(title);

          resolve(`${address} - "${title}"`);
        });
      }).on('error', error => {
        reject(error);
      });
    });
  });

  return Promise.all(requests);
}

function removeDuplicateInfo(title) {
  const parts = title.split(' - ');

  for (let i = 0; i < parts.length - 1; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      if (parts[i].trim().toLowerCase() === parts[j].trim().toLowerCase()) {
        parts.splice(j, 1);
        j--;
      }
    }
  }

  title = parts.join(' - ').trim();
  return title;
}

app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



 


 
