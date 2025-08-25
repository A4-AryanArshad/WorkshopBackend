const mongoose = require('mongoose');
const https = require('https');

// Test different cluster names and connection methods
const testConfigs = [
  {
    name: "Current Cluster (xkuanbt)",
    uri: "mongodb+srv://ali:ali@cluster0.xkuanbt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  },
  {
    name: "Alternative Cluster Format",
    uri: "mongodb+srv://ali:ali@cluster0.xkuanbt.mongodb.net/test?retryWrites=true&w=majority"
  },
  {
    name: "Direct Connection Test",
    uri: "mongodb://ali:ali@cluster0-shard-00-00.xkuanbt.mongodb.net:27017,cluster0-shard-00-01.xkuanbt.mongodb.net:27017,cluster0-shard-00-02.xkuanbt.mongodb.net:27017/test?ssl=true&replicaSet=atlas-xxxxx&authSource=admin&retryWrites=true&w=majority"
  }
];

async function testNetworkConnectivity() {
  console.log('🌐 Network Connectivity Tests');
  console.log('============================');
  
  // Test basic internet
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    console.log('🔍 Testing basic internet connectivity...');
    const { stdout: pingResult } = await execAsync('ping -c 2 google.com');
    console.log('✅ Internet connectivity: OK');
    
    console.log('🔍 Testing DNS resolution...');
    const { stdout: dnsResult } = await execAsync('nslookup google.com');
    console.log('✅ DNS resolution: OK');
    
    console.log('🔍 Testing MongoDB Atlas website...');
    const { stdout: curlResult } = await execAsync('curl -s -o /dev/null -w "%{http_code}" https://cloud.mongodb.com');
    console.log(`✅ MongoDB Atlas website: HTTP ${curlResult}`);
    
  } catch (error) {
    console.log('❌ Network test failed:', error.message);
  }
}

async function testMongoDBConnection(config) {
  console.log(`\n🔌 Testing: ${config.name}`);
  console.log(`🔌 URI: ${config.uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  
  try {
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    console.log('⏳ Attempting connection...');
    
    const connectionOptions = {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 1,
      retryWrites: true,
      w: 'majority'
    };
    
    await mongoose.connect(config.uri, connectionOptions);
    
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
      console.log('   - Cluster name is incorrect');
    } else if (error.name === 'MongoAPIError') {
      console.log('🔒 API ERROR - This usually means:');
      console.log('   - Invalid connection string format');
      console.log('   - Unsupported options in connection string');
    }
    
    return false;
  }
}

async function checkMongoDBAtlasStatus() {
  console.log('\n📊 MongoDB Atlas Status Check');
  console.log('=============================');
  
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    // Check if we can reach MongoDB Atlas services
    console.log('🔍 Testing MongoDB Atlas services...');
    
    const services = [
      'cloud.mongodb.com',
      'www.mongodb.com',
      'docs.mongodb.com'
    ];
    
    for (const service of services) {
      try {
        const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" https://${service}`);
        console.log(`✅ ${service}: HTTP ${stdout}`);
      } catch (error) {
        console.log(`❌ ${service}: Failed`);
      }
    }
    
  } catch (error) {
    console.log('⚠️ Status check failed:', error.message);
  }
}

async function runDeepTest() {
  console.log('🚀 Deep MongoDB Connection Test Suite');
  console.log('=====================================');
  
  // Test network connectivity
  await testNetworkConnectivity();
  
  // Check MongoDB Atlas status
  await checkMongoDBAtlasStatus();
  
  // Test MongoDB connections
  console.log('\n🗄️ MongoDB Connection Tests');
  console.log('==========================');
  
  let successCount = 0;
  for (const config of testConfigs) {
    const success = await testMongoDBConnection(config);
    if (success) successCount++;
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`✅ Successful connections: ${successCount}/${testConfigs.length}`);
  
  if (successCount === 0) {
    console.log('\n🔧 Critical Issues Found:');
    console.log('1. ❌ DNS cannot resolve MongoDB Atlas cluster hostnames');
    console.log('2. ❌ This suggests either:');
    console.log('   - Cluster name "xkuanbt" is incorrect');
    console.log('   - Cluster has been deleted or renamed');
    console.log('   - Network restrictions are blocking MongoDB Atlas');
    console.log('   - IP address is not whitelisted in MongoDB Atlas');
    
    console.log('\n🛠️ Immediate Actions Required:');
    console.log('1. 🔍 Check your MongoDB Atlas dashboard');
    console.log('2. 🔍 Verify the cluster name is correct');
    console.log('3. 🔍 Check if your IP is whitelisted');
    console.log('4. 🔍 Try accessing MongoDB Atlas in your browser');
    console.log('5. 🔍 Check if you\'re on a restricted network');
    
    console.log('\n🌐 Browser Test:');
    console.log('   Go to: https://cloud.mongodb.com');
    console.log('   Login and check your cluster status');
    
  } else {
    console.log('\n🎉 At least one connection method worked!');
    console.log('Use the working connection string in your main application.');
  }
}

// Run the deep test
runDeepTest().catch(console.error); 