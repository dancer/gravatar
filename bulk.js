const fs = require('fs');
const { checkusername } = require('./checker');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processbatch(words, startindex, batchsize) {
  const promises = [];
  
  for (let i = 0; i < batchsize && startindex + i < words.length; i++) {
    const word = words[startindex + i];
    const promise = checkusername(word)
      .then(status => ({ word, status, index: startindex + i }))
      .catch(() => ({ word, status: 'error', index: startindex + i }));
    promises.push(promise);
  }
  
  const batchresults = await Promise.all(promises);
  return batchresults;
}

async function bulkcheck() {
  const words = JSON.parse(fs.readFileSync('./data/words.json', 'utf8'));
  const available = [];
  const total = words.length;
  const batchsize = 10;
  const concurrent = 3;
  
  console.log(`checking ${total} usernames with ${concurrent} concurrent batches...`);
  
  let processed = 0;
  
  for (let i = 0; i < words.length; i += batchsize * concurrent) {
    const batches = [];
    
    for (let j = 0; j < concurrent && i + j * batchsize < words.length; j++) {
      batches.push(processbatch(words, i + j * batchsize, batchsize));
    }
    
    const batchresults = await Promise.all(batches);
    
    for (const batch of batchresults) {
      for (const result of batch) {
        processed++;
        if (result.status === 'available') {
          available.push(result.word);
          console.log(`✓ ${result.word} - available (${processed}/${total})`);
        } else {
          console.log(`✗ ${result.word} - ${result.status} (${processed}/${total})`);
        }
      }
    }
    
    await delay(50);
  }
  
  fs.writeFileSync('./data/available.txt', available.join('\n'));
  console.log(`\nfound ${available.length} available usernames`);
  console.log('saved to data/available.txt');
}

if (require.main === module) {
  bulkcheck().catch(console.error);
}

module.exports = { bulkcheck };