const crypto = require('crypto');
const ref = '9055483d-303a-4178-bf76-e4e3c44f7088';
const amount = '20000000';
const curr = 'COP';
const secret = 'test_integrity_wPvTgqoPkl5bSVrleK8IpclzmeYyWg5P';
const chain = `${ref}${amount}${curr}${secret}`;
const sig = crypto.createHash('sha256').update(chain).digest('hex');
console.log('Chain:', chain);
console.log('Hash:', sig);
