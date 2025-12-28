import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import History from './models/History.js';

dotenv.config();

const viewData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Fetch Users
        const users = await User.find({});
        console.log('\n--- 👥 USERS ---');
        if (users.length === 0) console.log('No users found.');
        users.forEach(u => {
            console.log(`ID: ${u._id}`);
            console.log(`Name: ${u.name}`);
            console.log(`Email: ${u.email}`);
            console.log(`Joined: ${u.createdAt}`);
            console.log('----------------');
        });

        // 2. Fetch History
        const history = await History.find({}).sort({ createdAt: -1 });
        console.log('\n--- 📜 HISTORY LOGS ---');
        if (history.length === 0) console.log('No history found.');
        history.forEach(h => {
            console.log(`User ID: ${h.userId}`);
            console.log(`Feature: ${h.feature}`);
            console.log(`Item: ${h.itemId}`);
            console.log(`Time: ${h.createdAt}`);
            console.log('----------------');
        });

    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDone.');
        process.exit();
    }
};

viewData();
