const https = require('https');

async function checkprofile(username) {
  return new Promise((resolve, reject) => {
    const url = `https://gravatar.com/${username}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ status: 'taken', type: 'public', content: data });
        } else if (res.statusCode === 404) {
          resolve({ status: 'unknown', type: 'private_or_available', content: data });
        } else {
          resolve({ status: 'error', type: 'unknown', content: data });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function checkapi(username) {
  return new Promise((resolve, reject) => {
    const url = `https://api.gravatar.com/v3/profiles/${username}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const profile = JSON.parse(data);
            resolve({ 
              status: 'taken', 
              type: profile.privacy ? 'private' : 'public',
              profile: profile 
            });
          } else if (res.statusCode === 404) {
            resolve({ status: 'available', type: 'truly_available', profile: null });
          } else if (res.statusCode === 429) {
            resolve({ status: 'rate_limited', type: 'unknown', profile: null });
          } else {
            resolve({ status: 'error', type: 'unknown', profile: null });
          }
        } catch (error) {
          resolve({ status: 'error', type: 'parse_error', profile: null });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function checkusername(username) {
  try {
    const apiResult = await checkapi(username);
    
    if (apiResult.status === 'rate_limited') {
      const profileResult = await checkprofile(username);
      if (profileResult.status === 'taken') {
        return 'taken';
      } else if (profileResult.status === 'unknown') {
        return 'available';
      }
      return 'error';
    }
    
    if (apiResult.status === 'available') {
      return 'available';
    } else if (apiResult.status === 'taken') {
      return 'taken';
    }
    
    return 'error';
  } catch (error) {
    return 'error';
  }
}

async function bulkcheck(usernames) {
  const results = {};
  for (const username of usernames) {
    try {
      results[username] = await checkusername(username);
    } catch (error) {
      results[username] = 'error';
    }
  }
  return results;
}

module.exports = { checkusername, bulkcheck, checkapi, checkprofile };

if (require.main === module) {
  const username = process.argv[2];
  if (!username) {
    console.log('Usage: node checker.js <username>');
    process.exit(1);
  }
  
  checkusername(username)
    .then(status => {
      console.log(`${username}: ${status}`);
    })
    .catch(err => {
      console.error('Error:', err.message);
    });
}