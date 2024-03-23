const { from } = require('rxjs');
const { https } = require('follow-redirects');
const { map, catchError } = require('rxjs/operators');

function fetchTitles(addresses) {
  return from(addresses).pipe(
    map(address => {
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
          console.error('Error fetching data:', error); // Log error
          resolve(`${address} - "NO RESPONSE"`);
        });
      });
    }),
    catchError(error => {
      console.error('Error in fetchTitles:', error); // Log error
      return 'Error fetching title';
    })
  ).toPromise(); // Convert Observable to Promise
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

module.exports = { fetchTitles };

