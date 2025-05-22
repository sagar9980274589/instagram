import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config({});

const connectDB = async () => {
    try {
        // Set mongoose options for better connection handling
        mongoose.set('strictQuery', false);

        const connected = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });

        if (connected) {
            console.log("✅ MongoDB connected successfully");
            console.log(`📍 Connected to: ${connected.connection.host}:${connected.connection.port}`);
        }
    } catch (err) {
        console.error("❌ Error connecting to MongoDB:", err.message);
        console.error("🔧 Please ensure MongoDB is running on localhost:27017");

        // Exit process with failure
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose disconnected from MongoDB');
});

// Handle app termination
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed due to app termination');
    process.exit(0);
});

export default connectDB;