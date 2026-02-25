const crypto = require('crypto');
const ref = 'ffb0f62d-83ea-41f3-a419-866a78a8d9f9';
const amount = '20000000';
const curr = 'COP';
const secret = 'wPvTgqoPkl5bSVrleK8IpclzmeYyWg5P';
const chain = `${ref}${amount}${curr}${secret}`;
const sig = crypto.createHash('sha256').update(chain).digest('hex');
console.log('Chain:', chain);
console.log('Hash:', sig);
