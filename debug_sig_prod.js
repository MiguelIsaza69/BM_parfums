const crypto = require('crypto');
const ref = '37b4a7b8-9f83-4adf-a86e-4cd8e7882478';
const amount = '20000000';
const curr = 'COP';
const secret = 'test_integrity_wPvTgqoPkl5bSVrleK8IpclzmeYyWg5P';
const chain = `${ref}${amount}${curr}${secret}`;
const sig = crypto.createHash('sha256').update(chain).digest('hex');
console.log('Chain:', chain);
console.log('Hash:', sig);
