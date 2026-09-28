import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  errorFormat: 'pretty',
  log: [
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
  ],
});

async function testConnection() {
  const url = process.env.DATABASE_URL;
  
  console.log('=== MongoDB Atlas Connection Test ===\n');
  
  if (!url) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }
  
  console.log('✓ DATABASE_URL loaded from .env');
  console.log('  Cluster:', url.match(/cluster[\w.]+/)?.[0] || 'unknown');
  console.log('  Database:', url.match(/\/([^?]+)/)?.[1] || 'unknown');
  
  try {
    console.log('\n1. Connecting to MongoDB Atlas...');
    console.log('   Node version:', process.version);
    console.log('   Prisma version:', require('@prisma/client/package.json').version);
    
    const start = Date.now();
    await prisma.$connect();
    const elapsed = Date.now() - start;
    
    console.log('✓ Connected successfully in', elapsed, 'ms');
    
    console.log('\n2. Testing database query...');
    const userCount = await prisma.user.count();
    console.log('✓ Query successful');
    console.log('  Users in database:', userCount);
    
    console.log('\n✓✓✓ All connection tests PASSED\n');
    
  } catch (error) {
    console.error('\n❌ Connection FAILED\n');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    if (error.message.includes('InternalError')) {
      console.error('\n⚠️  TLS/SSL InternalError detected - this suggests:');
      console.error('   - Certificate validation issue');
      console.error('   - Network/Firewall blocking TLS handshake');
      console.error('   - MongoDB Atlas cluster connectivity problem');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n⚠️  DNS resolution failed - cluster domain not resolving');
    }
    
    if (error.message.includes('Server selection timeout')) {
      console.error('\n⚠️  Connection timeout - Atlas unreachable');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
