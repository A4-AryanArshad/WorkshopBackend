const mongoose = require('mongoose');

// Test different connection strings
const connectionStrings = [
  {
    name: "Original Connection String",
    uri: "mongodb+srv://ali:ali@cluster0.xkuanbt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  },
  {
    name: "Alternative Connection String",
    uri: "mongodb+srv://ali:ali@cluster0.xkuanbt.mongodb.net/?retryWrites=true&w=majority&directConnection=true&serverSelectionTimeoutMS=10000"
  },
  {
    name: "Simplified Connection String",
    uri: "mongodb+srv://ali:ali@cluster0.xkuanbt.mongodb.net/?retryWrites=true&w=majority"
  }
];

async function testConnection(connectionString) {
  console.log(`\n🔌 Testing: ${connectionString.name}`);
  console.log(`🔌 URI: ${connectionString.uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  
  try {
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    console.log('⏳ Attempting connection...');
    
    await mongoose.connect(connectionString.uri, { 
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 1
    });
    
    console.log('✅ Connection successful!');
    console.log('🌐 Database:', mongoose.connection.db.databaseName);
    console.log('🔗 Connection state:', mongoose.connection.readyState);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('❌ Error type:', error.name);
    console.error('❌ Error code:', error.code);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.log('🔒 SERVER SELECTION ERROR - This usually means:');
      console.log('   - Network connectivity issues');
      console.log('   - DNS resolution problems');
      console.log('   - Firewall blocking connection');
      console.log('   - IP not whitelisted in MongoDB Atlas');
    }
    
    return false;
  }
}

async function runTests() {
  console.log('🚀 MongoDB Connection Test Suite');
  console.log('================================');
  
  // Test basic network connectivity first
  console.log('\n🌐 Testing basic network connectivity...');
  
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    // Test DNS resolution
    console.log('🔍 Testing DNS resolution...');
    try {
      const { stdout } = await execAsync('nslookup cluster0.xkuanbt.mongodb.net');
      console.log('✅ DNS resolution successful');
      console.log('📡 DNS Response:', stdout.split('\n').slice(-3).join('\n'));
    } catch (dnsError) {
      console.log('❌ DNS resolution failed:', dnsError.message);
    }
    
    // Test ping to MongoDB Atlas
    console.log('🏓 Testing ping to MongoDB Atlas...');
    try {
      const { stdout } = await execAsync('ping -c 3 cluster0.xkuanbt.mongodb.net');
      console.log('✅ Ping successful');
      console.log('📊 Ping results:', stdout.split('\n').slice(-4).join('\n'));
    } catch (pingError) {
      console.log('❌ Ping failed:', pingError.message);
    }
    
  } catch (networkError) {
    console.log('⚠️ Network test failed:', networkError.message);
  }
  
  // Test MongoDB connections
  console.log('\n🗄️ Testing MongoDB connections...');
  
  let successCount = 0;
  for (const connectionString of connectionStrings) {
    const success = await testConnection(connectionString);
    if (success) successCount++;
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`✅ Successful connections: ${successCount}/${connectionStrings.length}`);
  
  if (successCount === 0) {
    console.log('\n🔧 Troubleshooting Recommendations:');
    console.log('1. Check your internet connection');
    console.log('2. Try using a different DNS server (8.8.8.8 or 1.1.1.1)');
    console.log('3. Check if you\'re on a restricted network (corporate, VPN, public WiFi)');
    console.log('4. Verify MongoDB Atlas is accessible in your browser');
    console.log('5. Check if your IP is whitelisted in MongoDB Atlas');
    console.log('6. Try connecting from a different network');
  } else {
    console.log('\n🎉 At least one connection method worked!');
    console.log('Use the working connection string in your main application.');
  }
}

// Run the tests
runTests().catch(console.error); 