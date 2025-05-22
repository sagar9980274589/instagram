import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkMongoDB = async () => {
    console.log('🔍 Checking MongoDB connection...');
    console.log(`📍 Attempting to connect to: ${process.env.MONGO_URI}`);

    try {
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✅ MongoDB connection successful!');
        console.log(`📊 Database: ${connection.connection.db.databaseName}`);
        console.log(`🏠 Host: ${connection.connection.host}:${connection.connection.port}`);
        console.log(`📈 Ready State: ${connection.connection.readyState}`);

        // Test a simple operation
        const collections = await connection.connection.db.listCollections().toArray();
        console.log(`📁 Collections found: ${collections.length}`);
        collections.forEach(col => console.log(`  - ${col.name}`));

        await mongoose.connection.close();
        console.log('🔌 Connection closed successfully');
        process.exit(0);

    } catch (error) {
        console.error('❌ MongoDB connection failed:');
        console.error(`   Error: ${error.message}`);

        if (error.code === 'ECONNREFUSED') {
            console.error('🔧 Troubleshooting steps:');
            console.error('   1. Ensure MongoDB is installed and running');
            console.error('   2. Check if MongoDB service is started');
            console.error('   3. Verify MongoDB is listening on port 27017');
            console.error('   4. Try running: mongod --dbpath /path/to/your/db');
        }

        process.exit(1);
    }
};

checkMongoDB();
