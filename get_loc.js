const https = require('https');

https.get('https://maps.app.goo.gl/Qjfxbc6o6bmfhjuBA?g_st=atm', (res) => {
  console.log('Location:', res.headers.location);
});
