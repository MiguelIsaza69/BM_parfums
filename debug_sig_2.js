const crypto = require('crypto');
const ref = '21e3e3c6-d3d0-4c4d-9094-0e7b6b17bd29';
const amount = '20000000';
const curr = 'COP';
const secret = 'test_integrity_wPvTgqoPkl5bSVrleK8IpclzmeYyWg5P';
const chain = `${ref}${amount}${curr}${secret}`;
const sig = crypto.createHash('sha256').update(chain).digest('hex');
console.log('Chain:', chain);
console.log('Hash:', sig);
