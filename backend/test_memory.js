const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Chat = require('./models/Chat');
const memoryService = require('./services/memoryService');
const connectDB = require('./config/db');

async function test() {
    await connectDB();
    
    // Find a user
    const user = await User.findOne();
    if (!user) {
        console.log("No user found.");
        process.exit(1);
    }
    
    // Create a mock chat with > 10 messages
    const sessionId = "test-session-memory";
    
    await Chat.deleteOne({ sessionId }); // cleanup
    
    const messages = [];
    for (let i = 0; i < 15; i++) {
        messages.push({ role: i % 2 === 0 ? 'user' : 'assistant', content: `Message number ${i} content goes here as a test.` });
    }
    
    await Chat.create({
        userId: user._id,
        sessionId,
        messages,
        totalCost: 0
    });
    
    console.log("Created mock chat. Triggering memoryService...");
    
    await memoryService.manageMemory(sessionId, user._id);
    
    const updated = await Chat.findOne({ sessionId });
    console.log("Updated summarizedCount:", updated.summarizedCount);
    console.log("Updated summary:", updated.summary);
    
    process.exit(0);
}

test();
