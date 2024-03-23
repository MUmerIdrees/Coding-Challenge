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

    fetchTitles(addresses, (err, titles) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      } else {
        const htmlResponse = generateHtmlResponse(addresses, titles);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlResponse);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

function fetchTitles(addresses, callback) {
  let titles = [];
  let completedRequests = 0;

  addresses.forEach(address => {
    if (!address.startsWith('http://') && !address.startsWith('https://')) {
      // If the address doesn't start with a protocol, assume it's a relative path and prepend 'http://'
      address = 'https://' + address;
    }
    https.get(address, { maxRedirects: 5 }, response => {
      let data = '';

      response.on('data', chunk => {
        data += chunk;
      });

      response.on('end', () => {
        const titleMatch = data.match(/<title>([^<]*)<\/title>/i);
        let title = titleMatch ? titleMatch[1].trim() : 'NO RESPONSE';
        
        // Additional check to remove duplicate information like "DAWN.COM"
        title = removeDuplicateInfo(title);

        titles.push(`${address} - "${title}"`);

        completedRequests++;
        if (completedRequests === addresses.length) {
          callback(null, titles);
        }
      });
    }).on('error', error => {
      titles.push(`${address} - "NO RESPONSE"`);

      completedRequests++;
      if (completedRequests === addresses.length) {
        callback(null, titles);
      }
    });
  });
}

function removeDuplicateInfo(title) {
  // Split the title by " - "
  const parts = title.split(' - ');

  // Check for duplicate parts
  for (let i = 0; i < parts.length - 1; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      if (parts[i].trim().toLowerCase() === parts[j].trim().toLowerCase()) {
        // Remove the duplicate part
        parts.splice(j, 1);
        j--; // Adjust index after removing element
      }
    }
  }

  // Join the remaining parts to form the cleaned title
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



 


