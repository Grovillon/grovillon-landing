import { getWhitelistEmails } from './getWhitelistEmails.js';

getWhitelistEmails()
  .then(users => {
    console.log('✅ Whitelisted users:', users);
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });
