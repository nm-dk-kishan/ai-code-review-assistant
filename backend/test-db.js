const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function testConnection() {
  try {
    console.log('Attempting MongoDB connection...');
    const user = await prisma.user.findFirst();
    console.log('✓ MongoDB connection successful');
    console.log('Query executed - found user:', user ? 'yes' : 'no users in db');
  } catch (error) {
    console.error('✗ MongoDB connection failed');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('\nFull error:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
