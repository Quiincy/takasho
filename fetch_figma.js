const fs = require('fs');
const https = require('https');

const figmaToken = process.env.FIGMA_TOKEN || 'YOUR_FIGMA_TOKEN_HERE';
const fileId = 'ALtUPVT1c28lA7N06nuwru';

const options = {
  hostname: 'api.figma.com',
  path: `/v1/files/${fileId}`,
  headers: {
    'X-Figma-Token': figmaToken
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
