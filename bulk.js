const fs = require('fs');
const { checkusername } = require('./checker');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function bulkcheck() {
  const words = JSON.parse(fs.readFileSync('./data/words.json', 'utf8'));
  const available = [];
  const total = words.length;
  
  console.log(`checking ${total} usernames...`);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    try {
      const status = await checkusername(word);
      if (status === 'available') {
        available.push(word);
        console.log(`✓ ${word} - available (${i + 1}/${total})`);
      } else {
        console.log(`✗ ${word} - taken (${i + 1}/${total})`);
      }
    } catch (error) {
      console.log(`! ${word} - error (${i + 1}/${total})`);
    }
    
    await delay(100);
  }
  
  fs.writeFileSync('./data/available.txt', available.join('\n'));
  console.log(`\nfound ${available.length} available usernames`);
  console.log('saved to data/available.txt');
}

if (require.main === module) {
  bulkcheck().catch(console.error);
}

module.exports = { bulkcheck };