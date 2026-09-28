require('dotenv').config();

const { MongoClient } = require('mongodb');

async function testMongoDBDirect() {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    console.error('❌ DATABASE_URL not set in .env');
    process.exit(1);
  }
  
  console.log('Testing MongoDB Atlas connection...');
  console.log('Cluster host:', url.match(/cluster[\w.]+/)?.[0]);
  
  const client = new MongoClient(url, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
  
  try {
    console.log('\n1. Connecting to MongoDB...');
    await client.connect();
    console.log('✓ Connection established');
    
    console.log('\n2. Testing database ping...');
    const result = await client.db('admin').command({ ping: 1 });
    console.log('✓ Ping successful:', result);
    
    console.log('\n3. Listing databases...');
    const dbs = await client.db('admin').admin().listDatabases();
    console.log('✓ Found', dbs.databases.length, 'databases');
    
    console.log('\n✓✓✓ All MongoDB tests passed');
  } catch (error) {
    console.error('\n❌ MongoDB connection failed');
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    if (error.reason) console.error('Reason:', error.reason);
  } finally {
    await client.close();
  }
}

testMongoDBDirect();
