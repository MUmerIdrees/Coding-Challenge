function generateHtmlResponse(addresses, titles) {
    let html = `
      <html>
      <head></head>
      <body>
      <h1>Following are the titles of given websites:</h1>
      <ul>
    `;
  
    addresses.forEach((address, index) => {
      html += `<li>${address} - "${titles}"</li>`;
    });
  
    html += `
      </ul>
      </body>
      </html>
    `;
  
    return html;
}
  
module.exports = { generateHtmlResponse };