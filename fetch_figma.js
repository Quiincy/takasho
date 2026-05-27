const fs = require('fs');
const https = require('https');

const options = {
  hostname: 'api.figma.com',
  path: '/v1/files/ALtUPVT1c28lA7N06nuwru',
  headers: {
    'X-Figma-Token': 'YOUR_TOKEN_HERE'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('figma_data_full.json', data);
    console.log('Figma full data saved to figma_data_full.json');
  });
}).on('error', (e) => {
  console.error(e);
});
