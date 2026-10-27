import mongoose from 'mongoose';

let memoryServerInstance = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/water_testing_lab';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (primaryError) {
    console.warn(`[MongoDB] Primary connection failed: ${primaryError.message}`);
    console.log('[MongoDB] Initializing fallback in-memory database server...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const memoryUri = memoryServerInstance.getUri();
      
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Fallback In-Memory Server connected: ${memoryUri}`);
    } catch (fallbackError) {
      console.error(`[MongoDB] Critical Error: Unable to connect to MongoDB. ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};
