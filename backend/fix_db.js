const mongoose = require('mongoose');
require('dotenv').config();
const Chat = require('./models/Chat');
const connectDB = require('./config/db');

async function fix() {
    try {
        await connectDB();
        const docs = await Chat.find({ "messages.content": /as a test/ });
        console.log(`Found ${docs.length} chats with dummy messages.`);
        for (const doc of docs) {
            console.log(`Deleting chat with sessionId: ${doc.sessionId}`);
            await Chat.deleteOne({ _id: doc._id });
        }
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}

fix();
