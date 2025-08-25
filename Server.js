const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://ali:ali@cluster0.xkuanbt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Ping successful");
    await client.close();
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
}

run();
