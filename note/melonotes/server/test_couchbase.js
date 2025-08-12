require('dotenv').config();
const couchbaseDB = require('./database-couchbase');

async function testCouchbase() {
  try {
    console.log('🧪 Testing Couchbase connection...');
    console.log('Username:', process.env.COUCHBASE_USERNAME);
    console.log('Bucket:', process.env.COUCHBASE_BUCKET);
    console.log('Password length:', process.env.COUCHBASE_PASSWORD?.length);
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('✅ Couchbase test completed!');
    
    // Close connection
    await couchbaseDB.close();
    
  } catch (error) {
    console.error('❌ Couchbase test failed:', error);
  }
}

testCouchbase();